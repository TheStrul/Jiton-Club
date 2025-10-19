// Player Model - Represents a player with behavior and computed properties
class Player {
  constructor(data) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.nickName = data.nickName;
    this.type = data.type || 'member'; // 'member' | 'guest'
  }
  
  /**
   * Get full name
   * @returns {string} Full name (FirstName LastName)
   */
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
  
  /**
   * Get display name with guest indicator
   * @returns {string} Display name
   */
  get displayName() {
    const icon = this.isGuest ? ` ${Resources.icon('guest')}` : '';
    return `${this.nickName}${icon}`;
  }
  
  /**
   * Check if player is a guest
   * @returns {boolean}
   */
  get isGuest() {
    return this.type === 'guest';
  }
  
  /**
   * Check if player is a club member
   * @returns {boolean}
   */
  get isMember() {
    return this.type === 'member';
  }
  
  /**
   * Convert to JSON object
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      nickName: this.nickName,
      type: this.type
    };
  }
  
  /**
   * Create Player instance from JSON
   * @param {Object} json - JSON object
   * @returns {Player} Player instance
   */
  static fromJSON(json) {
    return new Player(json);
  }
  
  /**
   * Create guest player
   * @param {string} name - Guest name
   * @param {string} id - Guest ID
   * @returns {Player} Guest player instance
   */
  static createGuest(name, id) {
    return new Player({
      id: id,
      firstName: name,
      lastName: '',
      nickName: name,
      type: 'guest'
    });
  }
}
