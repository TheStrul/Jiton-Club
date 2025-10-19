// UI Helper functions
const UI = {
  /**
   * Show a temporary message to the user
   * @param {string} text - Message text
   * @param {string} type - Message type: 'success' | 'error' | 'info'
   * @param {number} duration - Display duration in ms
   */
  showMessage(text, type = 'info', duration = 3000) {
    const msg = document.getElementById('message');
    if (!msg) {
      console.warn('Message element not found');
      return;
    }
    
    msg.textContent = text;
    msg.className = `message ${type}`;
    msg.style.display = 'block';
    
    setTimeout(() => {
      msg.style.display = 'none';
    }, duration);
  },
  
  /**
   * Format currency amount in Israeli Shekels
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency string
   */
  formatCurrency(amount) {
    return `?${amount.toLocaleString('he-IL')}`;
  },
  
  /**
   * Format date in Hebrew locale
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted date string
   */
  formatDate(date) {
    const dateObj = date instanceof Date ? date : new Date(date);
    const format = Resources.get('dateFormats');
    
    return dateObj.toLocaleDateString('he-IL', {
      weekday: format.weekday,
      year: format.year,
      month: format.month,
      day: format.day
    });
  },
  
  /**
   * Format time in Hebrew locale
   * @param {Date|string} date - Date to format
   * @returns {string} Formatted time string
   */
  formatTime(date) {
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleTimeString('he-IL');
  },
  
  /**
   * Confirm action with user
   * @param {string} message - Confirmation message
   * @returns {boolean} User confirmation
   */
  confirm(message) {
    return confirm(message);
  },
  
  /**
   * Prompt user for input
   * @param {string} message - Prompt message
   * @param {string} defaultValue - Default value
   * @returns {string|null} User input or null if cancelled
   */
  prompt(message, defaultValue = '') {
    return prompt(message, defaultValue);
  },
  
  /**
   * Sanitize HTML to prevent XSS
   * @param {string} html - HTML string
   * @returns {string} Sanitized HTML
   */
  sanitizeHTML(html) {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  },
  
  /**
   * Set loading state on button
   * @param {HTMLButtonElement} button - Button element
   * @param {boolean} isLoading - Loading state
   * @param {string} loadingText - Text to show while loading
   */
  setButtonLoading(button, isLoading, loadingText = null) {
    if (!button) return;
    
    if (isLoading) {
      button.dataset.originalText = button.textContent;
      button.textContent = loadingText || Resources.get('messages.saving');
      button.classList.add('saving');
      button.disabled = true;
    } else {
      button.textContent = button.dataset.originalText || button.textContent;
      button.classList.remove('saving');
      button.disabled = false;
      delete button.dataset.originalText;
    }
  },
  
  /**
   * Copy text to clipboard
   * @param {string} text - Text to copy
   * @returns {Promise<boolean>} Success status
   */
  async copyToClipboard(text) {
    try {
      // Modern Clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      
      return success;
    } catch (error) {
      console.error('Copy to clipboard failed:', error);
      return false;
    }
  },
  
  /**
   * Share content using native share API or fallback
   * @param {object} data - Share data {title, text, url}
   * @returns {Promise<boolean>} Success status
   */
  async share(data) {
    try {
      if (navigator.share) {
        await navigator.share(data);
        return true;
      }
      
      // Fallback to clipboard
      const success = await this.copyToClipboard(data.text || data.url || '');
      if (success) {
        this.showMessage(Resources.get('messages.copiedToClipboard'), 'success');
      }
      return success;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Share failed:', error);
      }
      return false;
    }
  },
  
  /**
   * Open WhatsApp with pre-filled message
   * @param {string} text - Message text
   */
  openWhatsApp(text) {
    const url = `whatsapp://send?text=${encodeURIComponent(text)}`;
    window.location.href = url;
  }
};

// DOM Helper functions
const DOM = {
  /**
   * Get element by ID
   * @param {string} id - Element ID
   * @returns {HTMLElement|null}
   */
  $(id) {
    return document.getElementById(id);
  },
  
  /**
   * Query selector
   * @param {string} selector - CSS selector
   * @param {HTMLElement} parent - Parent element
   * @returns {HTMLElement|null}
   */
  $$(selector, parent = document) {
    return parent.querySelector(selector);
  },
  
  /**
   * Query selector all
   * @param {string} selector - CSS selector
   * @param {HTMLElement} parent - Parent element
   * @returns {NodeList}
   */
  $$$(selector, parent = document) {
    return parent.querySelectorAll(selector);
  },
  
  /**
   * Create element with attributes and children
   * @param {string} tag - Tag name
   * @param {object} attrs - Attributes
   * @param {Array|string} children - Child elements or text
   * @returns {HTMLElement}
   */
  create(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    
    Object.keys(attrs).forEach(key => {
      if (key === 'className') {
        el.className = attrs[key];
      } else if (key === 'dataset') {
        Object.assign(el.dataset, attrs[key]);
      } else if (key.startsWith('on')) {
        el.addEventListener(key.substring(2).toLowerCase(), attrs[key]);
      } else {
        el.setAttribute(key, attrs[key]);
      }
    });
    
    if (typeof children === 'string') {
      el.textContent = children;
    } else if (Array.isArray(children)) {
      children.forEach(child => {
        if (typeof child === 'string') {
          el.appendChild(document.createTextNode(child));
        } else if (child instanceof HTMLElement) {
          el.appendChild(child);
        }
      });
    }
    
    return el;
  },
  
  /**
   * Clear element's children
   * @param {HTMLElement} element
   */
  clear(element) {
    if (element) {
      element.innerHTML = '';
    }
  }
};
