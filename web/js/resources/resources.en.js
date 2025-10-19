/**
 * English Language Resources  
 * File: resources.en.js
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
    addRebuy: 'Add Rebuy Entry',
    addScore: 'Add Result Entry',
    playersList: 'Players in Game',
    login: 'System Login',
    mainMenu: 'Main Menu - Jiton Club'
  },
  
  sections: {
    addPlayer: 'Add Player to Rebuy List',
    rebuyListTitle: 'Rebuy List',
    scoreListTitle: 'Results List',
    playersTonight: 'Players Tonight'
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
    finished: 'Done - Save',
    addGuest: 'Add Guest',
    addRebuy: '?? Add Rebuy Entry',
    addScore: '?? Add Result Entry',
    login: 'Login',
    logout: 'Logout',
    backToMenu: 'Back to Menu'
  },
  
  labels: {
    selectPlayer: 'Select Player',
    playerName: 'Player Name',
    guestName: 'Guest Name',
    rebuyType: 'Rebuy Type',
    payment: 'How much paid?',
    position: 'Position',
    totalPlayers: 'Players',
    totalEntries: 'Entries',
    totalMoney: 'Total Money',
    totalRebuys: 'Players with Rebuys',
    rebuyBreakdown: 'Regular/House/Dotke',
    noRebuy: 'No Rebuy',
    buyIn: 'Buy-In Amount',
    paid: 'Paid',
    pin: 'Access Code (4 digits)'
  },
  
  rebuyTypes: {
    none: 'None',
    regular: 'Regular',
    house: 'House',
    dotke: 'Dotke'
  },
  
  messages: {
    playerAdded: '{name} added to list',
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
    loginSubtitle: 'Enter system access code',
    loginFooter: 'Jiton Club - Game Management System',
    lockoutExpired: 'You can try again',
    welcome: 'Hello!',
    menuFooter: 'Jiton Club © 2025 - All Rights Reserved'
  },
  
  errors: {
    noPlayerSelected: 'Select a player first',
    playerAlreadyInList: 'Player already in list',
    noGuestName: 'Enter guest name',
    noPlayers: 'No players selected!',
    noEntries: 'No entries added!',
    copyFailed: 'Copy error',
    invalidPin: 'Must enter 4 digits',
    wrongPin: 'Wrong code! {remaining} attempts remaining',
    tooManyAttempts: 'Too many attempts. Try again in 30 seconds'
  },
  
  confirmations: {
    removePlayer: 'Remove this player from rebuy list?',
    removeEntry: 'Remove this entry?',
    clearAll: 'Clear all data?',
    continueWithoutRebuys: 'No rebuys added. Continue without rebuys?',
    removeGuest: 'Remove this guest?',
    logout: 'Logout from system?'
  },
  
  placeholders: {
    selectPlayer: 'Select player or guest...',
    selectPlayerForRebuy: 'Select player to add rebuy',
    selectPlayerForScore: 'Select player to add result',
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
    game: '??',
    guest: '??',
    money: '??',
    stats: '??',
    regular: '??',
    house: '??',
    dotke: '??',
    trophy: '??',
    trash: '???',
    plus: '?',
    check: '?',
    cross: '?',
    empty: '??',
    none: '?',
    history: '??',
    settings: '??',
    logout: '??'
  },
  
  dateFormats: {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  },
  
  menu: {
    recordGame: 'Record Game',
    recordGameDesc: 'Record new game with entries, rebuys and results',
    viewHistory: 'Game History',
    viewHistoryDesc: 'View past games and statistics',
    leagueStandings: 'League Standings',
    leagueStandingsDesc: 'League standings and player points',
    managePlayers: 'Manage Players',
    managePlayersDesc: 'Add, edit and remove players',
    statistics: 'Statistics',
    statisticsDesc: 'View charts and statistical analysis',
    settings: 'Settings',
    settingsDesc: 'Customize and update settings'
  }
});
