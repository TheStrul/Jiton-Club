/**
 * Hebrew Language Resources
 * File: resources.he.js
 * Encoding: UTF-8
 */

Resources.register('he', {
  titles: {
    gameRecorder: 'רישום משחק',
    rebuyRecorder: 'רישום ריביי',
    rebuyList: 'רשימת ריביי',
    scoreList: 'רשימת תוצאות',
    playerSelection: 'בחירת שחקנים',
    summary: 'סיכום',
    gameSummary: 'סיכום משחק',
    addRebuy: 'הוסף רישום ריביי',
    addScore: 'הוסף רישום תוצאה',
    playersList: 'רשימת שחקנים',
    login: 'התחברות למערכת',
    mainMenu: 'תפריט ראשי - מועדון ג\'יטון'
  },

  sections: {
    addPlayer: 'הוסף שחקן לרשימת הערב',
    rebuyListTitle: 'רשימת ריביי',
    scoreListTitle: 'רשימת תוצאות',
    playersTonight: 'שחקני הערב'
  },

  buttons: {
    save: 'שמור',
    cancel: 'ביטול',
    confirm: 'אישור',
    addPlayer: 'הוסף שחקן',
    addToList: 'הוסף לרשימה',
    continue: 'המשך',
    continueToResults: 'המשך לתוצאות',
    selectAll: 'בחר הכל',
    clearAll: 'נקה הכל',
    finished: 'סיים - שמור',
    addGuest: 'הוסף אורח 👤',
    addRebuy: 'הוסף רישום ריביי',
    addScore: 'הוסף רישום תוצאה',
    login: 'התחבר',
    logout: 'התנתק',
    backToMenu: 'חזור לתפריט'
  },

  labels: {
    selectPlayer: 'בחר שחקן',
    playerName: 'שם שחקן',
    guestName: 'שם אורח',
    rebuyType: 'סוג ריביי',
    payment: 'שולם במזומן',
    position: 'מיקום',
    totalPlayers: 'שחקנים',
    totalEntries: 'כניסות',
    totalMoney: 'סכום כולל',
    totalRebuys: 'סה״כ ריביי',
    rebuyBreakdown: 'רגיל/בית/דותקה',
    noRebuy: 'ללא ריביי',
    buyIn: 'דמי כניסה ראשוניים (Buy-In)',
    paid: 'שולם',
    pin: 'קוד PIN (4 ספרות)',
    username: 'שם משתמש',
    password: 'סיסמה'
  },

  rebuyTypes: {
    none: 'ללא',
    regular: 'רגיל',
    house: 'בית',
    dotke: 'דותקה'
  },

  messages: {
    playerAdded: '{name} נוסף לרשימה',
    guestAdded: '{name} נוסף כאורח',
    rebuyAdded: 'ריביי נוסף ל-{name}',
    scoreAdded: 'תוצאה נוספה ל-{name}',
    rebuysSaved: 'ריביי נשמרו! ממשיך לתוצאות...',
    gameSaved: 'משחק נשמר בהצלחה!',
    dataSaved: 'הנתונים נשמרו בהצלחה!',
    dataLoaded: 'נתונים נטענו בהצלחה',
    copiedToClipboard: 'הועתק בהצלחה! עכשיו אפשר לשתף',
    saving: 'שומר...',
    loginSuccess: 'התחברות הצליחה!',
    loginSubtitle: 'נכנס למצב מנהל',
    loginFooter: 'מועדון ג\'יטון - מאמן בפוקר ובחיים',
    lockoutExpired: 'תקופת הנעילה עברה',
    welcome: 'שלום אבי!',
    menuFooter: 'מועדון ג\'יטון © 2025 - כל הזכויות שמורות'
  },

  errors: {
    noPlayerSelected: 'לא נבחר שחקן',
    playerAlreadyInList: 'שחקן כבר ברשימה',
    noGuestName: 'חסר שם אורח',
    noPlayers: 'אין שחקנים ברשימה!',
    noEntries: 'אין רישומי תוצאות!',
    copyFailed: 'העתקה נכשלה',
    invalidPin: 'קוד חייב להיות 4 ספרות',
    wrongPin: 'PIN שגוי! נותרו {remaining} ניסיונות',
    tooManyAttempts: 'יותר מדי ניסיונות. נסה שוב בעוד 30 דקות',
    invalidCredentials: 'חסר שם משתמש או סיסמה',
    wrongCredentials: 'שם משתמש או סיסמה שגויים! נותרו {remaining} ניסיונות'
  },

  confirmations: {
    removePlayer: 'להסיר שחקן זה מהרשימה?',
    removeEntry: 'למחוק רישום זה?',
    clearAll: 'למחוק את כל הרשימות?',
    continueWithoutRebuys: 'אין רישומי ריביי. להמשיך ללא ריביי?',
    removeGuest: 'להסיר אורח זה?',
    logout: 'להתנתק מהמערכת?'
  },

  placeholders: {
    selectPlayer: 'בחר שחקן או אורח...',
    selectPlayerForRebuy: 'בחר שחקן לריביי',
    selectPlayerForScore: 'בחר שחקן לתוצאה',
    newGuest: 'אורח חדש...',
    enterGuestName: 'הכנס שם אורח',
    positionPlaceholder: '-'
  },

  emptyStates: {
    noRebuys: 'אין רישומי ריביי',
    noScores: 'אין רישומי תוצאות',
    noPlayers: 'אין שחקנים'
  },

  icons: {
    game: '🎲',
    guest: '👤',
    money: '💰',
    stats: '📊',
    regular: '🎯',
    house: '🏠',
    dotke: '🎭',
    trophy: '🏆',
    trash: '🗑️',
    plus: '+',
    check: '✓',
    cross: '✗',
    empty: '○',
    none: '∅',
    history: '📜',
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
    recordGame: 'רישום משחק',
    recordGameDesc: 'רשום משחק חדש עם כל השחקנים, ריביי ותוצאות',
    viewHistory: 'היסטוריית משחקים',
    viewHistoryDesc: 'צפה במשחקים קודמים וההיסטוריה',
    leagueStandings: 'דירוג הליגה',
    leagueStandingsDesc: 'צפה בדירוג שחקני המועדון',
    managePlayers: 'ניהול שחקנים',
    managePlayersDesc: 'הוספה, עריכה וניהול שחקנים',
    statistics: 'סטטיסטיקות',
    statisticsDesc: 'צפה בנתונים סטטיסטיים מפורטים',
    settings: 'הגדרות',
    settingsDesc: 'ניהול הגדרות מערכת וקונפיגורציה'
  }
});
