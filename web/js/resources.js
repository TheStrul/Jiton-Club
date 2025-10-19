/**
 * Resources Manager
 * Loads language-specific resource files and provides string lookup
 * 
 * Usage:
 *   Resources.get('titles.login')          → 'התחברות למערכת'
 *   Resources.get('messages.playerAdded', { name: 'ליאור' }) → 'ליאור נוסף לרשימה'
 *   Resources.icon('game')                 → '🎮'
 *   Resources.switchLanguage('en')         → Switch to English
 */
const Resources = {
    // Available languages (populated by Resources.register())
    languages: {},
    
    // Current active language
    current: 'he',
    
    /**
     * Register a language resource pack
     * Called by language files: Resources.register('he', {...})
     * @param {string} langCode - Language code ('he', 'en')
     * @param {object} resources - Resource object
     */
    register(langCode, resources) {
        this.languages[langCode] = resources;
        console.log(`Language '${langCode}' registered`);
    },
    
    /**
     * Get resource string by path
     * @param {string} path - Dot-notation path (e.g., 'titles.login')
     * @param {object} replacements - Object with placeholder replacements
     * @returns {string} - Localized string or path if not found
     */
    get(path, replacements = {}) {
        const keys = path.split('.');
        let value = this.languages[this.current];
        
        // Navigate through object path
        for (const key of keys) {
            value = value?.[key];
            if (value === undefined) {
                console.warn(`Resource not found: ${path} in language: ${this.current}`);
                return path; // Return path as fallback
            }
        }
        
        // Replace placeholders if value is string
        if (typeof value === 'string') {
            return value.replace(/{(\w+)}/g, (match, key) => {
                return replacements[key] !== undefined ? replacements[key] : match;
            });
        }
        
        return value;
    },
    
    /**
     * Get icon emoji
     * @param {string} name - Icon name
     * @returns {string} - Emoji or empty string
     */
    icon(name) {
        return this.get('icons.' + name) || '';
    },
    
    /**
     * Switch language and persist preference
     * @param {string} lang - Language code ('he' or 'en')
     */
    switchLanguage(lang) {
        if (this.languages[lang]) {
            this.current = lang;
            localStorage.setItem('preferredLanguage', lang);
            console.log(`Language switched to: ${lang}`);
            // Reload page to apply new language
            window.location.reload();
        } else {
            console.error(`Language '${lang}' not available`);
        }
    },
    
    /**
     * Initialize language from saved preference or default to Hebrew
     */
    initLanguage() {
        // Priority: localStorage > default (he)
        const savedLang = localStorage.getItem('preferredLanguage');
        
        if (savedLang && this.languages[savedLang]) {
          this.current = savedLang;
        } else {
          this.current = 'he'; // Default to Hebrew
        }
        
        console.log(`Resources initialized. Current language: ${this.current}`);
      }
};

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => Resources.initLanguage());
} else {
    Resources.initLanguage();
}