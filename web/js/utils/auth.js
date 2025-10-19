// Authentication utility
const Auth = {
  /**
   * Default PIN for poker night (change in config.js)
   */
  DEFAULT_PIN: '1234',
  
  /**
   * Session storage key
   */
  SESSION_KEY: 'pokerAuth',
  
  /**
   * Check if user is authenticated
   * @returns {boolean} True if authenticated
   */
  isAuthenticated() {
    const session = sessionStorage.getItem(this.SESSION_KEY);
    if (!session) return false;
    
    try {
      const data = JSON.parse(session);
      const now = Date.now();
      
      // Check if session is still valid (expires after 8 hours)
      if (data.expires && now < data.expires) {
        return true;
      }
      
      // Session expired
      this.logout();
      return false;
    } catch (e) {
      return false;
    }
  },
  
  /**
   * Authenticate with PIN
   * @param {string} pin - PIN to validate
   * @returns {boolean} True if PIN is correct
   */
  authenticate(pin) {
    // Get configured PIN from config or use default
    const validPin = CONFIG.auth?.pin || this.DEFAULT_PIN;
    
    if (pin === validPin) {
      // Create session (expires in 8 hours)
      const session = {
        authenticated: true,
        timestamp: Date.now(),
        expires: Date.now() + (8 * 60 * 60 * 1000) // 8 hours
      };
      
      sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
      return true;
    }
    
    return false;
  },
  
  /**
   * Logout - clear session
   */
  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
  },
  
  /**
   * Require authentication - redirect to login if not authenticated
   * Call this at the top of protected pages
   */
  requireAuth() {
    if (!this.isAuthenticated()) {
      // Save current page to redirect back after login
      sessionStorage.setItem('authRedirect', window.location.pathname);
      window.location.href = 'login.html';
    }
  },
  
  /**
   * Get redirect URL after successful login
   * @returns {string} URL to redirect to
   */
  getRedirectUrl() {
    const saved = sessionStorage.getItem('authRedirect');
    sessionStorage.removeItem('authRedirect');
    return saved || 'menu.html'; // Changed from easy-game-recorder.html to menu.html
  }
};
