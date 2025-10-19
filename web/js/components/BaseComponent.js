// Base Component - Abstract base class for all UI components
class BaseComponent {
  /**
   * Create a component
   * @param {string} containerId - Container element ID
   * @param {Object} initialState - Initial state
   */
  constructor(containerId, initialState = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      console.warn(`Container "${containerId}" not found`);
    }
    this.state = initialState;
    this.eventListeners = [];
  }
  
  /**
   * Update component state and re-render
   * @param {Object} newState - New state to merge
   */
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }
  
  /**
   * Render component - Must be implemented by subclass
   */
  render() {
    throw new Error('render() must be implemented by subclass');
  }
  
  /**
   * Clean up event listeners
   */
  destroy() {
    this.eventListeners.forEach(({ element, event, handler }) => {
      element.removeEventListener(event, handler);
    });
    this.eventListeners = [];
  }
  
  /**
   * Add event listener with tracking for cleanup
   * @param {HTMLElement} element - Element to attach listener to
   * @param {string} event - Event name
   * @param {Function} handler - Event handler
   */
  addEventListener(element, event, handler) {
    element.addEventListener(event, handler);
    this.eventListeners.push({ element, event, handler });
  }
  
  /**
   * Attach event listeners after render - Override in subclass
   */
  attachEventListeners() {
    // Override in subclass
  }
  
  /**
   * Show component
   */
  show() {
    if (this.container) {
      this.container.classList.remove('hidden');
    }
  }
  
  /**
   * Hide component
   */
  hide() {
    if (this.container) {
      this.container.classList.add('hidden');
    }
  }
  
  /**
   * Toggle component visibility
   */
  toggle() {
    if (this.container) {
      this.container.classList.toggle('hidden');
    }
  }
}
