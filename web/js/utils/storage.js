// LocalStorage wrapper with date validation and error handling
const StorageManager = {
  /**
   * Save data to localStorage with timestamp
   * @param {string} key - Storage key
   * @param {*} data - Data to store
   * @returns {boolean} Success status
   */
  save(key, data) {
    try {
      const payload = {
        date: new Date().toISOString(),
        data: data
      };
      localStorage.setItem(key, JSON.stringify(payload));
      return true;
    } catch (error) {
      console.error(`Storage save failed for key "${key}":`, error);
      return false;
    }
  },
  
  /**
   * Load data from localStorage with optional date validation
   * @param {string} key - Storage key
   * @param {boolean} validateDate - Only return data from today
   * @returns {*|null} Stored data or null
   */
  load(key, validateDate = true) {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return null;
      
      const parsed = JSON.parse(saved);
      
      // Validate date if required
      if (validateDate && parsed.date) {
        const savedDate = new Date(parsed.date).toDateString();
        const today = new Date().toDateString();
        
        if (savedDate !== today) {
          console.log(`Stale data found for key "${key}" - dated ${savedDate}`);
          return null;
        }
      }
      
      return parsed.data;
    } catch (error) {
      console.error(`Storage load failed for key "${key}":`, error);
      return null;
    }
  },
  
  /**
   * Remove item from localStorage
   * @param {string} key - Storage key
   */
  clear(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Storage clear failed for key "${key}":`, error);
      return false;
    }
  },
  
  /**
   * Check if key exists
   * @param {string} key - Storage key
   * @returns {boolean}
   */
  has(key) {
    return localStorage.getItem(key) !== null;
  },
  
  /**
   * Get all keys with a prefix
   * @param {string} prefix - Key prefix
   * @returns {string[]} Matching keys
   */
  getKeysWithPrefix(prefix) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keys.push(key);
      }
    }
    return keys;
  }
};
