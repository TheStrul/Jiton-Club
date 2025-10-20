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
      const response = await fetch(`${this.baseUrl}/api/players/active`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      // Extract players array from API response (could be direct array or wrapped in 'value' property)
      const players = data.value || data;

      // Map to our Player model format
      return players.map(p => ({
        id: p.PlayerId || p.playerId,
        fullName: p.FullName || p.fullName,
        phone: p.Phone || p.phone,
        hebrewNickName: p.HebrewNickName || p.hebrewNickName || (p.NickName || p.nickName) || (p.FullName || p.fullName || '').split(' ')[0],
        englishNickName: p.NickName || p.nickName || (p.FullName || p.fullName || '').split(' ')[0], // Use NickName from API or extract first name
        languagePreference: p.LanguagePreference || p.languagePreference || 'he', // User's preferred language
        userType: p.UserType || p.userType || 'Tournament', // 'Tournament' | 'Casual' | 'Guest' | 'Inactive'
        type: 'member',
        isActive: true
      }));
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

// Service Factory - Creates API service instance
const DataServiceFactory = {
  /**
   * Create data service instance
   * Always uses real API backend
   * @returns {ApiService} API service instance
   */
  create() {
    console.log('? Using API Service - Connected to backend at ' + CONFIG.API_BASE);
    return new ApiService(CONFIG.API_BASE);
  }
};
