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
            playersList: 'שחקנים במשחק'
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
            addScore: '🏆 הוסף רשומת תוצאה'
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
            paid: 'שולם'
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
            rebuysSaved: 'ריביי נשמרו! ממשיך לרישום תוצאות...',
            gameSaved: 'המשחק נשמר בהצלחה!',
            dataSaved: 'הנתונים נשמרו ונשלחו!',
            dataLoaded: 'נתוני משחק נטענו',
            copiedToClipboard: 'הועתק ללוח! עכשיו תדביק בוואטסאפ',
            saving: 'שומר...'
        },
        errors: {
            noPlayerSelected: 'בחר שחקן קודם',
            playerAlreadyInList: 'שחקן כבר ברשימה',
            noGuestName: 'הזן שם אורח',
            noPlayers: 'אין שחקנים נבחרים!',
            noEntries: 'לא נוספו כניסות!',
            copyFailed: 'שגיאה בהעתקה'
        },
        confirmations: {
            removePlayer: 'האם להסיר שחקן זה מרשימת הריביי?',
            removeEntry: 'האם להסיר רשומה זו?',
            clearAll: 'האם לנקות את כל הנתונים?',
            continueWithoutRebuys: 'לא נוספו ריביי. להמשך ללא ריביי?',
            removeGuest: 'האם להסיר אורח זה?'
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
            none: '⭕'
        },
        dateFormats: {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
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
    }
};