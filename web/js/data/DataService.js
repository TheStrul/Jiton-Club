// Abstract Data Service - Interface for data operations
class DataService {
  /**
   * Get all players
   * @returns {Promise<Array>} Array of player objects
   */
  async getPlayers() {
    throw new Error('getPlayers() must be implemented by subclass');
  }
  
  /**
   * Get player by ID
   * @param {number|string} id - Player ID
   * @returns {Promise<Object|null>} Player object or null
   */
  async getPlayer(id) {
    throw new Error('getPlayer() must be implemented by subclass');
  }
  
  /**
   * Save game data
   * @param {Object} gameData - Game data object
   * @returns {Promise<Object>} Save result
   */
  async saveGame(gameData) {
    throw new Error('saveGame() must be implemented by subclass');
  }
  
  /**
   * Get rebuys for a specific date
   * @param {Date|string} date - Date to fetch rebuys for
   * @returns {Promise<Array>} Array of rebuy objects
   */
  async getRebuys(date) {
    throw new Error('getRebuys() must be implemented by subclass');
  }
  
  /**
   * Save rebuy data
   * @param {Object} rebuyData - Rebuy data object
   * @returns {Promise<Object>} Save result
   */
  async saveRebuys(rebuyData) {
    throw new Error('saveRebuys() must be implemented by subclass');
  }
}
