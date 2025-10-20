// Player Model - Represents a player with behavior and computed properties
class Player {
  constructor(data) {
    this.id = data.id;
    this.fullName = data.fullName || '';
    this.phone = data.phone || null;
    this.hebrewNickName = data.hebrewNickName || this.getFirstName();
    this.englishNickName = data.englishNickName || this.getFirstName();
    this.languagePreference = data.languagePreference || 'he'; // Player's preferred language
    this.userType = data.userType || 'Tournament'; // 'Tournament' | 'Casual' | 'Guest' | 'Inactive'
    this.type = data.type || 'member'; // 'member' | 'guest' (for frontend compatibility)
  }

  /**
   * Get first name from full name
   * @returns {string} First name
   */
  getFirstName() {
    return this.fullName.split(' ')[0] || this.fullName;
  }

  /**
   * Get last name from full name
   * @returns {string} Last name
   */
  getLastName() {
    const parts = this.fullName.split(' ');
    return parts.slice(1).join(' ') || '';
  }

  /**
   * Get nickname based on player's language preference
   * @returns {string} Nickname in player's preferred language
   */
  get nickName() {
    return this.languagePreference === 'he' ? this.hebrewNickName : this.englishNickName;
  }

  /**
   * Get display name with type indicator
   * @returns {string} Display name with icon
   */
  get displayName() {
    let icon = '';
    if (this.isGuest) {
      icon = ' 👤';
    } else if (this.isTournamentPlayer) {
      icon = ' 🏆';
    } else if (this.isCasualPlayer) {
      icon = ' 🎲';
    }
    return `${this.nickName}${icon}`;
  }

  /**
   * Check if player is a guest
   * @returns {boolean}
   */
  get isGuest() {
    return this.type === 'guest' || this.userType === 'Guest';
  }

  /**
   * Check if player is a club member
   * @returns {boolean}
   */
  get isMember() {
    return this.type === 'member';
  }

  /**
   * Check if player is a tournament player
   * @returns {boolean}
   */
  get isTournamentPlayer() {
    return this.userType === 'Tournament';
  }

  /**
   * Check if player is a casual player
   * @returns {boolean}
   */
  get isCasualPlayer() {
    return this.userType === 'Casual';
  }

  /**
   * Convert to JSON object
   * @returns {Object} JSON representation
   */
  toJSON() {
    return {
      id: this.id,
      fullName: this.fullName,
      phone: this.phone,
      hebrewNickName: this.hebrewNickName,
      englishNickName: this.englishNickName,
      userType: this.userType,
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
      fullName: name,
      hebrewNickName: name,
      englishNickName: name,
      userType: 'Guest',
      type: 'guest'
    });
  }
}
