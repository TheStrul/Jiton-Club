/**
 * English Language Resources
 * File: resources.en.js
 * Encoding: UTF-8
 */

Resources.register('en', {
  titles: {
    gameRecorder: 'Game Recorder',
    rebuyRecorder: 'Rebuy Recorder',
    rebuyList: 'Rebuy List',
    scoreList: 'Results List',
    playerSelection: 'Player Selection',
    summary: 'Summary',
    gameSummary: 'Game Summary',
    addRebuy: 'Add Rebuy List',
    addScore: 'Add Results List',
    playersList: 'Players List',
    login: 'System Login',
    mainMenu: 'Main Menu - Jiton Club'
  },
  
  sections: {
    addPlayer: 'Add Player to Tonight\'s List',
    rebuyListTitle: 'Rebuy List',
    scoreListTitle: 'Results List',
    playersTonight: 'Tonight\'s Players'
  },
  
  buttons: {
    save: 'Save',
    cancel: 'Cancel',
    confirm: 'Confirm',
    addPlayer: 'Add Player',
    addToList: 'Add to List',
    continue: 'Continue',
    continueToResults: 'Continue to Results',
    selectAll: 'Select All',
    clearAll: 'Clear All',
    finished: 'Finish - Save',
    addGuest: 'Add Guest',
    addRebuy: '🔄 Add Rebuy Entry',
    addScore: '🏆 Add Result Entry',
    login: 'Login',
    logout: 'Logout',
    backToMenu: 'Back to Menu'
  },
  
  labels: {
    selectPlayer: 'Select Player',
    playerName: 'Player Name',
    guestName: 'Guest Name',
    rebuyType: 'Rebuy Type',
    payment: 'Payment Amount',
    position: 'Position',
    totalPlayers: 'Players',
    totalEntries: 'Entries',
    totalMoney: 'Total Amount',
    totalRebuys: 'Total Rebuys',
    rebuyBreakdown: 'Regular/House/Dotke',
    noRebuy: 'No Rebuy',
    buyIn: 'Buy-In (Initial Entry)',
    paid: 'Paid',
    pin: 'PIN Code (4 digits)',
    username: 'Username',
    password: 'Password'
  },
  
  rebuyTypes: {
    none: 'None',
    regular: 'Regular',
    house: 'House',
    dotke: 'Dotke'
  },
  
  messages: {
    playerAdded: '{name} added successfully',
    guestAdded: '{name} added as guest',
    rebuyAdded: 'Rebuy added for {name}',
    scoreAdded: 'Result added for {name}',
    rebuysSaved: 'Rebuys saved! Continuing to results...',
    gameSaved: 'Game saved successfully!',
    dataSaved: 'Data saved and sent!',
    dataLoaded: 'Game data loaded',
    copiedToClipboard: 'Copied to clipboard! Now paste in WhatsApp',
    saving: 'Saving...',
    loginSuccess: 'Login successful!',
    loginSubtitle: 'Enter PIN code',
    loginFooter: 'Jiton Club - Game Management System',
    lockoutExpired: 'Lockout period expired',
    welcome: 'Welcome!',
    menuFooter: 'Jiton Club � 2025 - All Rights Reserved'
  },
  
  errors: {
    noPlayerSelected: 'No player selected',
    playerAlreadyInList: 'Player already in list',
    noGuestName: 'Guest name missing',
    noPlayers: 'No players in list!',
    noEntries: 'No entries in list!',
    copyFailed: 'Copy failed',
    invalidPin: 'Must enter 4 digits',
    wrongPin: 'Wrong PIN! {remaining} attempts remaining',
    tooManyAttempts: 'Too many attempts. Try again in 30 seconds',
    invalidCredentials: 'Please enter username and password',
    wrongCredentials: 'Wrong credentials! {remaining} attempts remaining'
  },
  
  confirmations: {
    removePlayer: 'Remove this player from the list?',
    removeEntry: 'Remove this entry?',
    clearAll: 'Clear all data?',
    continueWithoutRebuys: 'No rebuys recorded. Continue without rebuys?',
    removeGuest: 'Remove this guest?',
    logout: 'Logout from system?'
  },
  
  placeholders: {
    selectPlayer: 'Select player or guest...',
    selectPlayerForRebuy: 'Select player for rebuy',
    selectPlayerForScore: 'Select player for result',
    newGuest: 'New guest...',
    enterGuestName: 'Enter guest name',
    positionPlaceholder: '-'
  },
  
  emptyStates: {
    noRebuys: 'No rebuys added yet',
    noScores: 'No results added yet',
    noPlayers: 'No players'
  },
  
  icons: {
    game: '🎮',
    guest: '👤',
    money: '💰',
    stats: '📊',
    regular: '🔄',
    house: '🏠',
    dotke: '🎯',
    trophy: '🏆',
    trash: '🗑️',
    plus: '+',
    check: '✅',
    cross: '❌',
    empty: '⚪',
    none: '⭕',
    history: '📝',
    settings: '⚙️',
    logout: '🚪'
  },
  
  dateFormats: {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  },
  
  menu: {
    recordGame: 'Record Game',
    recordGameDesc: 'Record a new game with players, rebuys and results',
    viewHistory: 'Game History',
    viewHistoryDesc: 'View previous games and statistics',
    leagueStandings: 'League Standings',
    leagueStandingsDesc: 'Current player rankings table',
    managePlayers: 'Manage Players',
    managePlayersDesc: 'Add, edit and remove players',
    statistics: 'Statistics',
    statisticsDesc: 'View statistical data and trends',
    settings: 'Settings',
    settingsDesc: 'Configure system preferences and options'
  }
});
