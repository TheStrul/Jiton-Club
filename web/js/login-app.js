// Login App - Authentication Controller
class LoginApp {
  constructor() {
    this.attempts = 0;
    this.maxAttempts = 5;
    this.init();
  }
  
  init() {
    // Check if already authenticated
    if (Auth.isAuthenticated()) {
      this.redirectToApp();
      return;
    }
    
    this.initializeUIText();
    this.setupEventListeners();
    
    // Focus on PIN input
    setTimeout(() => DOM.$('pinInput').focus(), 300);
  }
  
  initializeUIText() {
    try {
      document.title = Resources.get('titles.login');
      DOM.$('loginTitle').innerHTML = `${Resources.icon('game')} ${Resources.get('titles.login')}`;
      DOM.$('loginSubtitle').textContent = Resources.get('messages.loginSubtitle');
      DOM.$('pinLabel').textContent = Resources.get('labels.pin');
      DOM.$('loginBtn').textContent = `${Resources.icon('check')} ${Resources.get('buttons.login')}`;
      DOM.$('loginFooter').textContent = Resources.get('messages.loginFooter');
    } catch (error) {
      console.error('Failed to initialize UI text:', error);
    }
  }
  
  setupEventListeners() {
    const form = DOM.$('loginForm');
    const pinInput = DOM.$('pinInput');
    
    // Form submit
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleLogin();
    });
    
    // Auto-submit when 4 digits entered
    pinInput.addEventListener('input', (e) => {
      // Only allow numbers
      e.target.value = e.target.value.replace(/[^0-9]/g, '');
      
      // Auto-submit when 4 digits
      if (e.target.value.length === 4) {
        setTimeout(() => this.handleLogin(), 300);
      }
    });
    
    // Clear on focus
    pinInput.addEventListener('focus', () => {
      pinInput.select();
    });
  }
  
  handleLogin() {
    const pinInput = DOM.$('pinInput');
    const pin = pinInput.value.trim();
    
    // Validate PIN length
    if (pin.length !== 4) {
      UI.showMessage(Resources.get('errors.invalidPin'), 'error');
      pinInput.value = '';
      pinInput.focus();
      return;
    }
    
    // Check attempts
    if (this.attempts >= this.maxAttempts) {
      UI.showMessage(Resources.get('errors.tooManyAttempts'), 'error');
      this.lockout();
      return;
    }
    
    // Attempt authentication
    if (Auth.authenticate(pin)) {
      UI.showMessage(Resources.get('messages.loginSuccess'), 'success', 1000);
      setTimeout(() => this.redirectToApp(), 1000);
    } else {
      this.attempts++;
      const remaining = this.maxAttempts - this.attempts;
      
      if (remaining > 0) {
        UI.showMessage(
          Resources.get('errors.wrongPin', { remaining }), 
          'error'
        );
      } else {
        UI.showMessage(Resources.get('errors.tooManyAttempts'), 'error');
        this.lockout();
      }
      
      pinInput.value = '';
      pinInput.focus();
    }
  }
  
  lockout() {
    const pinInput = DOM.$('pinInput');
    const loginBtn = DOM.$('loginBtn');
    
    pinInput.disabled = true;
    loginBtn.disabled = true;
    
    // Re-enable after 30 seconds
    setTimeout(() => {
      this.attempts = 0;
      pinInput.disabled = false;
      loginBtn.disabled = false;
      pinInput.value = '';
      pinInput.focus();
      UI.showMessage(Resources.get('messages.lockoutExpired'), 'info');
    }, 30000);
  }
  
  redirectToApp() {
    const redirectUrl = Auth.getRedirectUrl();
    window.location.href = redirectUrl;
  }
}

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Initializing Login App...');
    new LoginApp();
  } catch (error) {
    console.error('Failed to initialize login app:', error);
    alert('Failed to initialize login page. Check console for details.');
  }
});
