// Rebuy Model - Represents a rebuy transaction with business logic
class Rebuy {
  constructor(player, type = 'regular') {
    this.player = player instanceof Player ? player : new Player(player);
    this.type = type; // 'regular' | 'house' | 'dotke'
    this.timestamp = new Date();
  }
  
  /**
   * Get rebuy type label (translated)
   * @returns {string} Type label
   */
  get typeLabel() {
    return Resources.get(`rebuyTypes.${this.type}`);
  }
  
  /**
   * Get rebuy type icon
   * @returns {string} Type icon
   */
  get typeIcon() {
    return Resources.icon(this.type);
  }
  
  /**
   * Get rebuy cost
   * @returns {number} Cost in currency units
   */
  getCost() {
    const costs = {
      regular: 200,
      house: 0,
      dotke: 200
    };
    return costs[this.type] || 0;
  }
  
  /**
   * Check if rebuy is free (house rebuy)
   * @returns {boolean}
   */
  get isFree() {
    return this.type === 'house';
  }
  
  /**
   * Check if rebuy is paid
   * @returns {boolean}
   */
  get isPaid() {
    return !this.isFree;
  }
  
  /**
   * Get formatted cost
   * @returns {string} Formatted cost string
   */
  get formattedCost() {
    return UI.formatCurrency(this.getCost());
  }
  
  /**
   * Convert to JSON object
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      player: this.player.toJSON(),
      type: this.type,
      timestamp: this.timestamp.toISOString(),
      cost: this.getCost()
    };
  }
  
  /**
   * Create Rebuy instance from JSON
   * @param {Object} json - JSON object
   * @returns {Rebuy} Rebuy instance
   */
  static fromJSON(json) {
    const rebuy = new Rebuy(json.player, json.type);
    if (json.timestamp) {
      rebuy.timestamp = new Date(json.timestamp);
    }
    return rebuy;
  }
  
  /**
   * Get valid rebuy types
   * @returns {string[]} Array of valid types
   */
  static getValidTypes() {
    return ['regular', 'house', 'dotke'];
  }
  
  /**
   * Validate rebuy type
   * @param {string} type - Type to validate
   * @returns {boolean} Is valid type
   */
  static isValidType(type) {
    return this.getValidTypes().includes(type);
  }
}
