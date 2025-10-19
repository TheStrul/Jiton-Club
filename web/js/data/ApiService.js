// API Service - Production implementation using Azure Functions
class ApiService extends DataService {
  constructor(baseUrl) {
    super();
    this.baseUrl = baseUrl;
  }
  
  /**
   * Get all players from API
   * @returns {Promise<Array>} Array of player objects
   */
  async getPlayers() {
    try {
      const response = await fetch(`${this.baseUrl}/api/players`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch players:', error);
      throw error;
    }
  }
  
  /**
   * Get player by ID from API
   * @param {number|string} id - Player ID
   * @returns {Promise<Object|null>} Player object or null
   */
  async getPlayer(id) {
    try {
      const response = await fetch(`${this.baseUrl}/api/players/${id}`);
      if (!response.ok) {
        if (response.status === 404) return null;
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch player ${id}:`, error);
      throw error;
    }
  }
  
  /**
   * Save game data to API
   * @param {Object} gameData - Game data object
   * @returns {Promise<Object>} Save result
   */
  async saveGame(gameData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(gameData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to save game:', error);
      throw error;
    }
  }
  
  /**
   * Get rebuys for a specific date from API
   * @param {Date|string} date - Date to fetch rebuys for
   * @returns {Promise<Array>} Array of rebuy objects
   */
  async getRebuys(date) {
    try {
      const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
      const response = await fetch(`${this.baseUrl}/api/rebuys?date=${dateStr}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch rebuys:', error);
      throw error;
    }
  }
  
  /**
   * Save rebuy data to API
   * @param {Object} rebuyData - Rebuy data object
   * @returns {Promise<Object>} Save result
   */
  async saveRebuys(rebuyData) {
    try {
      const response = await fetch(`${this.baseUrl}/api/rebuys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(rebuyData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Failed to save rebuys:', error);
      throw error;
    }
  }
}

// Service Factory - Creates appropriate service based on configuration
const DataServiceFactory = {
  /**
   * Create data service instance based on config
   * @returns {DataService} Data service instance
   */
  create() {
    if (CONFIG.features.useApi && CONFIG.environment === 'production') {
      console.log('Using API Service');
      return new ApiService(CONFIG.API_BASE);
    }
    
    console.log('Using Mock Service (Local Development)');
    return new MockService();
  }
};
