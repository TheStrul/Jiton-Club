// Mock Data Service - Local development implementation using localStorage
class MockService extends DataService {
  constructor() {
    super();
    this.clubMembers = [
      { id: 1, firstName: 'Tomer', lastName: 'Lidor', nickName: 'Lidor' },
      { id: 2, firstName: 'Lior', lastName: 'Goldberg', nickName: 'Goldberg' },
      { id: 3, firstName: 'Eran', lastName: 'Shuster', nickName: 'Shuster' },
      { id: 4, firstName: 'Nati', lastName: 'Merfish', nickName: 'Merfish' },
      { id: 5, firstName: 'Lior', lastName: 'Shmuli', nickName: 'Shmueli' },
      { id: 6, firstName: 'Arik', lastName: 'Fridman', nickName: 'Arik' },
      { id: 7, firstName: 'Danny', lastName: 'Silberstein', nickName: 'Danny' },
      { id: 8, firstName: 'Avi', lastName: 'Strul', nickName: 'Strul' },
      { id: 9, firstName: 'Dotan', lastName: 'Gad', nickName: 'Dotke' },
      { id: 10, firstName: 'Doron', lastName: 'Lida', nickName: 'Doron' },
      { id: 11, firstName: 'Ovi', lastName: 'Hamama', nickName: 'Ovi' },
      { id: 12, firstName: 'Ex-pres', lastName: 'Frenkl', nickName: 'Pre&F' },
      { id: 13, firstName: 'Moshe', lastName: 'Nachman', nickName: 'Moshe' },
      { id: 14, firstName: 'Rami', lastName: 'Bareli', nickName: 'Rambo' },
      { id: 15, firstName: 'Nir', lastName: 'Perach', nickName: 'Nir' },
      { id: 16, firstName: 'Oded', lastName: 'Fisher', nickName: 'Shoded' },
      { id: 17, firstName: 'Ran', lastName: 'Shacham', nickName: 'Ran S' },
      { id: 18, firstName: 'Sharon', lastName: 'Cohen', nickName: 'Kov' },
      { id: 19, firstName: 'Zohar', lastName: 'Alon', nickName: 'Zohar' }
    ];
  }
  
  /**
   * Get all club members
   * @returns {Promise<Array>} Array of player objects
   */
  async getPlayers() {
    // Simulate network delay
    await this._delay(100);
    
    // Check if custom players are stored
    const customPlayers = StorageManager.load('mockPlayers', false);
    return customPlayers || this.clubMembers;
  }
  
  /**
   * Get player by ID
   * @param {number|string} id - Player ID
   * @returns {Promise<Object|null>} Player object or null
   */
  async getPlayer(id) {
    await this._delay(50);
    
    const players = await this.getPlayers();
    return players.find(p => p.id == id) || null;
  }
  
  /**
   * Save game data to localStorage
   * @param {Object} gameData - Game data object
   * @returns {Promise<Object>} Save result
   */
  async saveGame(gameData) {
    await this._delay(200);
    
    try {
      // Add to game history
      const history = StorageManager.load(CONFIG.storage.gameHistory, false) || [];
      const gameRecord = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('he-IL'),
        ...gameData
      };
      
      history.push(gameRecord);
      StorageManager.save(CONFIG.storage.gameHistory, history);
      
      return {
        success: true,
        id: gameRecord.id,
        message: 'Game saved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Get rebuys for a specific date
   * @param {Date|string} date - Date to fetch rebuys for
   * @returns {Promise<Array>} Array of rebuy objects
   */
  async getRebuys(date) {
    await this._delay(100);
    
    const history = StorageManager.load(CONFIG.storage.rebuyHistory, false) || [];
    const dateStr = date instanceof Date ? date.toISOString().split('T')[0] : date;
    
    return history.filter(r => r.date === dateStr);
  }
  
  /**
   * Save rebuy data to localStorage
   * @param {Object} rebuyData - Rebuy data object
   * @returns {Promise<Object>} Save result
   */
  async saveRebuys(rebuyData) {
    await this._delay(200);
    
    try {
      // Add to rebuy history
      const history = StorageManager.load(CONFIG.storage.rebuyHistory, false) || [];
      const rebuyRecord = {
        id: Date.now(),
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString('he-IL'),
        ...rebuyData
      };
      
      history.push(rebuyRecord);
      StorageManager.save(CONFIG.storage.rebuyHistory, history);
      
      return {
        success: true,
        id: rebuyRecord.id,
        message: 'Rebuys saved successfully'
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Simulate network delay
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
