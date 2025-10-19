/**
 * Authentication Service
 * Handles login, logout, session validation, and user state
 */
class AuthService {
    constructor() {
        this.currentUser = null;
        this.sessionToken = null;
        this.sessionCheckInterval = null;
        this._loadFromStorage();
    }

    /**
     * Login with username and password
     */
    async login(username, password) {
        try {
            const response = await fetch(`${CONFIG.API_BASE}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include', // Important for cookies
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                return {
                    success: false,
                    message: data.message || '????? ????????'
                };
            }

            // Store session data
            this.sessionToken = data.sessionToken;
            this.currentUser = data.user;
            this._saveToStorage();

            // Start session monitoring
            this._startSessionMonitoring();

            return {
                success: true,
                user: data.user,
                message: data.message || '?????? ??????'
            };
        } catch (error) {
            console.error('Login error:', error);
            return {
                success: false,
                message: '????? ?????? ?? ????'
            };
        }
    }

    /**
     * Logout and clear session
     */
    async logout() {
        try {
            if (this.sessionToken) {
                await fetch(`${CONFIG.API_BASE}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${this.sessionToken}`
                    },
                    credentials: 'include'
                });
            }
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            this._clearSession();
            window.location.href = '/login.html';
        }
    }

    /**
     * Validate current session
     */
    async validateSession() {
        if (!this.sessionToken) {
            return false;
        }

        try {
            const response = await fetch(`${CONFIG.API_BASE}/auth/validate`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.sessionToken}`
                },
                credentials: 'include'
            });

            const data = await response.json();

            if (response.ok && data.isValid) {
                this.currentUser = data.user;
                this._saveToStorage();
                return true;
            } else {
                this._clearSession();
                return false;
            }
        } catch (error) {
            console.error('Session validation error:', error);
            return false;
        }
    }

    /**
     * Get current user info
     */
    async getCurrentUser() {
        if (!this.sessionToken) {
            return null;
        }

        try {
            const response = await fetch(`${CONFIG.API_BASE}/auth/me`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.sessionToken}`
                },
                credentials: 'include'
            });

            if (response.ok) {
                const user = await response.json();
                this.currentUser = user;
                this._saveToStorage();
                return user;
            }
        } catch (error) {
            console.error('Get current user error:', error);
        }

        return null;
    }

    /**
     * Change password
     */
    async changePassword(currentPassword, newPassword) {
        if (!this.sessionToken) {
            return { success: false, message: '?? ?????' };
        }

        try {
            const response = await fetch(`${CONFIG.API_BASE}/auth/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.sessionToken}`
                },
                credentials: 'include',
                body: JSON.stringify({ currentPassword, newPassword })
            });

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Change password error:', error);
            return { success: false, message: '????? ?????? ?????' };
        }
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated() {
        return this.sessionToken !== null && this.currentUser !== null;
    }

    /**
     * Check if user has specific role
     */
    hasRole(role) {
        return this.currentUser?.role === role;
    }

    /**
     * Check if user has any of the specified roles
     */
    hasAnyRole(roles) {
        return this.currentUser && roles.includes(this.currentUser.role);
    }

    /**
     * Require authentication - redirect to login if not authenticated
     */
    async requireAuth(allowedRoles = null) {
        const isValid = await this.validateSession();

        if (!isValid) {
            this._redirectToLogin();
            return false;
        }

        if (allowedRoles && !this.hasAnyRole(allowedRoles)) {
            this._showAccessDenied();
            return false;
        }

        return true;
    }

    /**
     * Get authorization header for API requests
     */
    getAuthHeader() {
        if (!this.sessionToken) {
            return {};
        }

        return {
            'Authorization': `Bearer ${this.sessionToken}`
        };
    }

    /**
     * Make authenticated API request
     */
    async fetchAuth(url, options = {}) {
        if (!this.sessionToken) {
            throw new Error('Not authenticated');
        }

        const authOptions = {
            ...options,
            headers: {
                ...options.headers,
                ...this.getAuthHeader()
            },
            credentials: 'include'
        };

        const response = await fetch(url, authOptions);

        // Handle 401 Unauthorized
        if (response.status === 401) {
            this._clearSession();
            this._redirectToLogin();
            throw new Error('Session expired');
        }

        return response;
    }

    // Private methods

    _startSessionMonitoring() {
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
        }

        // Check session every 5 minutes
        this.sessionCheckInterval = setInterval(async () => {
            const isValid = await this.validateSession();
            if (!isValid) {
                this._clearSession();
                this._redirectToLogin();
            }
        }, CONFIG.auth.sessionCheckInterval);
    }

    _stopSessionMonitoring() {
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
            this.sessionCheckInterval = null;
        }
    }

    _saveToStorage() {
        if (this.sessionToken) {
            localStorage.setItem(CONFIG.storage.sessionToken, this.sessionToken);
        }
        if (this.currentUser) {
            localStorage.setItem(CONFIG.storage.userData, JSON.stringify(this.currentUser));
        }
    }

    _loadFromStorage() {
        this.sessionToken = localStorage.getItem(CONFIG.storage.sessionToken);
        const userData = localStorage.getItem(CONFIG.storage.userData);
        if (userData) {
            try {
                this.currentUser = JSON.parse(userData);
            } catch (e) {
                console.error('Failed to parse user data:', e);
            }
        }

        // Start monitoring if we have a session
        if (this.sessionToken) {
            this._startSessionMonitoring();
        }
    }

    _clearSession() {
        this.sessionToken = null;
        this.currentUser = null;
        this._stopSessionMonitoring();
        localStorage.removeItem(CONFIG.storage.sessionToken);
        localStorage.removeItem(CONFIG.storage.userData);
    }

    _redirectToLogin() {
        const currentPath = window.location.pathname;
        if (!currentPath.includes('login.html')) {
            window.location.href = `/login.html?redirect=${encodeURIComponent(currentPath)}`;
        }
    }

    _showAccessDenied() {
        alert('??? ?? ????? ???? ????? ??');
        window.location.href = '/';
    }
}

// Create global instance
const authService = new AuthService();
