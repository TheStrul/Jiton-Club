/**
 * Login Page App
 * Handles user authentication via PIN code
 */

function initializeLoginApp() {
    // Check if PokerAuth is available
    if (typeof PokerAuth !== 'undefined') {
        console.log('✅ Auth module loaded successfully');
        // Check if already logged in
        if (PokerAuth.isAuthenticated()) {
            console.log('User already authenticated, redirecting to menu...');
            window.location.href = 'menu.html';
            return;
        }
    } else {
        console.error('❌ Auth module not loaded, skipping authentication check');
    }

    // Initialize UI text from resources
    initializeUI();
    
    // Setup login form
    setupLoginForm();
}

/**
 * Initialize UI text from resources
 */
function initializeUI() {
    try {
        // Set page title
        document.getElementById('page-title').textContent = Resources.get('titles.login') || 'System Login';
        document.getElementById('login-title').textContent = Resources.get('messages.loginSubtitle') || 'Enter credentials';
        
        // Set form labels
        document.getElementById('username-label').textContent = Resources.get('labels.username') || 'Username';
        document.getElementById('password-label').textContent = Resources.get('labels.password') || 'Password';
        
        // Set button text
        document.getElementById('login-button').textContent = Resources.get('buttons.login') || 'Login';
        
        // Set footer
        const footer = document.getElementById('login-footer');
        if (footer) {
            footer.textContent = Resources.get('messages.loginFooter') || 'Jiton Club - Game Management System';
        }
        
        console.log('UI text initialized from resources');
    } catch (error) {
        console.error('Failed to initialize UI text:', error);
        // Fallback to hardcoded English if resources fail
        document.getElementById('page-title').textContent = 'System Login';
        document.getElementById('login-title').textContent = 'Enter credentials';
    }
}

/**
 * Setup login form submission
 */
function setupLoginForm() {
    const form = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginButton = document.getElementById('login-button');
    const errorMessage = document.getElementById('error-message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = usernameInput.value.trim();
        const password = passwordInput.value.trim();
        
        // Validate inputs
        if (!username || !password) {
            showError(Resources.get('errors.invalidCredentials') || 'Please enter username and password');
            return;
        }
        
        // Disable form during login
        loginButton.disabled = true;
        loginButton.textContent = Resources.get('messages.saving') || 'Logging in...';
        hideError();
        
        try {
            console.log('Attempting login...');
            
            const result = PokerAuth.login(username, password);
            
            if (result.success) {
                console.log('Login successful!');
                showSuccess(Resources.get('messages.loginSuccess') || 'Login successful!');
                
                // Redirect to menu after short delay
                setTimeout(() => {
                    const redirectUrl = PokerAuth.getRedirectUrl();
                    window.location.href = redirectUrl;
                }, 500);
            } else {
                console.error('Login failed:', result.message);
                const errorMsg = Resources.get('errors.wrongCredentials', { remaining: result.attemptsRemaining }) || result.message;
                showError(errorMsg);
                
                // Re-enable form
                loginButton.disabled = false;
                loginButton.textContent = Resources.get('buttons.login') || 'Login';
                passwordInput.value = '';
                passwordInput.focus();
            }
        } catch (error) {
            console.error('Login error:', error);
            showError(Resources.get('errors.tooManyAttempts') || 'Too many attempts. Try again in 30 seconds');
            
            // Re-enable form
            loginButton.disabled = false;
            loginButton.textContent = Resources.get('buttons.login') || 'Login';
        }
    });
    
    // Focus on username input
    usernameInput.focus();
}

/**
 * Show error message
 */
function showError(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.background = 'rgba(244, 67, 54, 0.2)';
    errorDiv.style.color = '#f44336';
    errorDiv.classList.add('show');
}

/**
 * Hide error message
 */
function hideError() {
    const errorDiv = document.getElementById('error-message');
    errorDiv.classList.remove('show');
}

/**
 * Show success message
 */
function showSuccess(message) {
    const errorDiv = document.getElementById('error-message');
    errorDiv.textContent = message;
    errorDiv.style.background = 'rgba(76, 175, 80, 0.2)';
    errorDiv.style.color = '#4CAF50';
    errorDiv.classList.add('show');
}

// Note: initializeLoginApp() is called from login.html after DOM is ready and all modules are loaded
