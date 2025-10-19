/**
 * Resources Loader - WinForms-style pattern for web
 * Loads language-specific resource files dynamically
 */

const Resources = {
  // Available languages
  availableLanguages: ['he', 'en'],
  
  // Current language
  current: 'he',
  
  // Language data (loaded from separate files)
  data: {},
  
  /**
   * Get resource string by path
   * @param {string} path - Dot-notation path (e.g., 'titles.gameRecorder')
   * @param {object} replacements - Template replacements
   * @returns {string} Localized string
   */
  get(path, replacements = {}) {
    const keys = path.split('.');
    let value = this.data[this.current];
    
    for (const key of keys) {
      value = value?.[key];
      if (value === undefined) {
        console.warn(`Resource not found: ${path} for language: ${this.current}`);
        return path;
      }
    }
    
    if (typeof value === 'string') {
      return value.replace(/{(\w+)}/g, (match, key) => {
        return replacements[key] !== undefined ? replacements[key] : match;
      });
    }
    
    return value;
  },
  
  /**
   * Get icon by name
   * @param {string} name - Icon name
   * @returns {string} Icon emoji
   */
  icon(name) {
    return this.get('icons.' + name) || '';
  },
  
  /**
   * Switch language and reload page
   * @param {string} lang - Language code
   */
  switchLanguage(lang) {
    if (this.availableLanguages.includes(lang)) {
      this.current = lang;
      localStorage.setItem('preferredLanguage', lang);
      window.location.reload();
    } else {
      console.error(`Language not available: ${lang}`);
    }
  },
  
  /**
   * Initialize language from saved preference or browser default
   */
  initLanguage() {
    // Priority: localStorage > browser language > default (he)
    const savedLang = localStorage.getItem('preferredLanguage');
    const browserLang = navigator.language?.substring(0, 2);
    
    if (savedLang && this.availableLanguages.includes(savedLang)) {
      this.current = savedLang;
    } else if (browserLang && this.availableLanguages.includes(browserLang)) {
      this.current = browserLang;
    }
    
    console.log(`Resources loaded for language: ${this.current}`);
  },
  
  /**
   * Register language data (called from language files)
   * @param {string} lang - Language code
   * @param {object} data - Language data object
   */
  register(lang, data) {
    this.data[lang] = data;
    console.log(`Language registered: ${lang}`);
  }
};

// Auto-initialize on load
Resources.initLanguage();
