// Centralized resource strings
const Resources = {
    he: {
        titles: {
            gameRecorder: 'רישום משחק',
            rebuyRecorder: 'רישום ריביי',
            rebuyList: 'רשימת ריביי',
            scoreList: 'רשימת תוצאות',
            playerSelection: 'בחירת שחקנים',
            summary: 'סיכום',
            gameSummary: 'סיכום משחק',
            addRebuy: 'הוסף רשומת ריביי',
            addScore: 'הוסף רשומת תוצאה',
            playersList: 'שחקנים במשחק',
            login: 'התחברות למערכת',
            mainMenu: 'תפריט ראשי - ג׳יטון קלאב'
        },
        sections: {
            addPlayer: 'הוסף שחקן לרשימת ריביי',
            rebuyListTitle: 'רשימת ריביי',
            scoreListTitle: 'רשימת תוצאות',
            playersTonight: 'שחקנים הערב'
        },
        buttons: {
            save: 'שמור',
            cancel: 'ביטול',
            confirm: 'אישור',
            addPlayer: 'הוסף שחקן',
            addToList: 'הוסף לרשימה',
            continue: 'המשך',
            continueToResults: 'המשך לרישום תוצאות',
            selectAll: 'סמן הכל',
            clearAll: 'נקה הכל',
            finished: 'סיימתי - שמור',
            addGuest: 'הוסף אורח',
            addRebuy: '🔄 הוסף רשומת ריביי',
            addScore: '🏆 הוסף רשומת תוצאה',
            login: 'התחבר',
            logout: 'התנתק',
            backToMenu: 'חזור לתפריט'
        },
        labels: {
            selectPlayer: 'בחר שחקן',
            playerName: 'שם השחקן',
            guestName: 'שם האורח',
            rebuyType: 'סוג ריביי',
            payment: 'כמה שילם?',
            position: 'מקום',
            totalPlayers: 'שחקנים',
            totalEntries: 'כניסות',
            totalMoney: 'סך כסף',
            totalRebuys: 'שחקנים עם ריביי',
            rebuyBreakdown: 'רגיל/בית/דותקה',
            noRebuy: 'ללא ריביי',
            buyIn: 'מחיר כניסה (Buy-In)',
            paid: 'שולם',
            pin: 'קוד גישה (4 ספרות)'
        },
        rebuyTypes: {
            none: 'ללא',
            regular: 'רגיל',
            house: 'בית',
            dotke: 'דותקה'
        },
        messages: {
            playerAdded: '{name} נוסף לרשימה',
            guestAdded: '{name}追加作为访客',
            rebuyAdded: 'ריביי נוסף ל-{name}',
            scoreAdded: 'תוצאה נוספה ל-{name}',
            rebuysSaved: 'ריביי נשמרו! ממשיך לרישום תוצאות...',
            gameSaved: 'המשחק נשמר בהצלחה!',
            dataSaved: 'הנתונים נשמרו ונשלחו!',
            dataLoaded: 'נתוני משחק נטענו',
            copiedToClipboard: 'הועתק ללוח! עכשיו תדביק בוואטסאפ',
            saving: 'שומר...',
            loginSuccess: 'התחבלת בהצלחה!',
            loginSubtitle: 'הזן קוד גישה למערכת',
            loginFooter: 'ג׳יטון קלאב - מערכת ניהול משחקים',
            lockoutExpired: 'ניתן לנסות שוב',
            welcome: 'שלום!',
            menuFooter: 'ג׳יטון קלאב © 2025 - כל הזכויות שמורות'
        },
        errors: {
            noPlayerSelected: 'בחר שחקן קודם',
            playerAlreadyInList: 'שחקן כבר ברשימה',
            noGuestName: 'הזן שם אורח',
            noPlayers: 'אין שחקנים נבחרים!',
            noEntries: 'לא נוספו כניסות!',
            copyFailed: 'שגיאה בהעתקה',
            invalidPin: 'יש להזין 4 ספרות',
            wrongPin: 'קוד שגוי! נותרו {remaining} ניסיונות',
            tooManyAttempts: 'יותר מדי ניסיונות. נסה שוב בעוד 30 שניות'
        },
        confirmations: {
            removePlayer: 'האם להסיר שחקן זה מרשימת הריביי?',
            removeEntry: 'האם להסיר רשומה זו?',
            clearAll: 'האם לנקות את כל הנתונים?',
            continueWithoutRebuys: 'לא נוספו ריביי. להמשך ללא ריבוי�?',
            removeGuest: 'האם להסיר אורח זה?',
            logout: 'האם להתנתק מהמערכת?'
        },
        placeholders: {
            selectPlayer: 'בחר שחקן או אורח...',
            selectPlayerForRebuy: 'בחר שחקן להוספת ריביי',
            selectPlayerForScore: 'בחר שחקן להוספת תוצאה',
            newGuest: 'אורח חדש...',
            enterGuestName: 'הזן שם האורח',
            positionPlaceholder: '-'
        },
        emptyStates: {
            noRebuys: 'עדיין לא נוספו ריביים',
            noScores: 'עדיין לא נוספו תוצאות',
            noPlayers: 'אין שחקנים'
        },
        icons: {
            game: '🎲',
            guest: '👤',
            money: '💰',
            stats: '📊',
            regular: '💵',
            house: '🏠',
            dotke: '🎯',
            trophy: '🏆',
            trash: '🗑️',
            plus: '➕',
            check: '✓',
            cross: '✗',
            empty: '🎰',
            none: '⭕',
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
            recordGameDesc: 'רשום משחק חדש עם כניסות, ריביים ותוצאות',
            viewHistory: 'היסטוריית משחקים',
            viewHistoryDesc: 'צפה במשחקים קודמים וסטטיסטיקות',
            leagueStandings: 'דירוג ליגה',
            leagueStandingsDesc: 'טבלת דירוג ונקודות השחקנים',
            managePlayers: 'ניהול שחקנים',
            managePlayersDesc: 'הוסף, ערוך והסר שחקנים',
            statistics: 'סטטיסטיקות',
            statisticsDesc: 'צפה בגרפים וניתוחים סטטיסטיים',
            settings: 'הגדרות',
            settingsDesc: 'התאמה אישית ועדכון הגדרות'
        }
    },

    en: {
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
            game: '🎲',
            guest: '👤',
            money: '💰',
            stats: '📊',
            regular: '💵',
            house: '🏠',
            dotke: '🎯',
            trophy: '🏆',
            trash: '🗑️',
            plus: '➕',
            check: '✓',
            cross: '✗',
            empty: '🎰',
            none: '⭕',
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
    },

    current: 'he',

    get(path, replacements = {}) {
        const keys = path.split('.');
        let value = this[this.current];
        for (const key of keys) {
            value = value?.[key];
            if (value === undefined) {
                console.warn('Resource not found: ' + path);
                return path;
            }
        }
        if (typeof value === 'string') {
            return value.replace(/{(\w+)}/g, function (match, key) {
                return replacements[key] !== undefined ? replacements[key] : match;
            });
        }
        return value;
    },

    icon(name) {
        return this.get('icons.' + name) || '';
    },
    
    /**
     * Switch language and persist preference
     * @param {string} lang - Language code ('he' or 'en')
     */
    switchLanguage(lang) {
        if (this[lang]) {
            this.current = lang;
            localStorage.setItem('preferredLanguage', lang);
            // Reload page to apply new language
            window.location.reload();
        }
    },
    
    /**
     * Initialize language from saved preference
     */
    initLanguage() {
        const saved = localStorage.getItem('preferredLanguage');
        if (saved && this[saved]) {
            this.current = saved;
        }
    }
};

// Initialize language on load
Resources.initLanguage();