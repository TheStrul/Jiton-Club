/**
 * Authentication Manager
 * Handles username/password authentication for local development
 */

window.PokerAuth = {
    DEFAULT_USERNAME: 'a',
    DEFAULT_PASSWORD: 'a!',
    
    isAuthenticated() {
        return sessionStorage.getItem('auth_token') === 'authenticated';
    },
    
    login(username, password) {
        if (username === this.DEFAULT_USERNAME && password === this.DEFAULT_PASSWORD) {
            sessionStorage.setItem('auth_token', 'authenticated');
            return { success: true, message: 'Login successful!' };
        } else {
            return { success: false, message: 'Wrong credentials!' };
        }
    },
    
    logout() {
        sessionStorage.removeItem('auth_token');
    },
    
    getRedirectUrl() {
        return 'menu.html';
    }
};
