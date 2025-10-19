// Configuration for different environments
const CONFIG = {
  // Environment: 'development' | 'production'
  environment: 'development',
  
  // API Base URL (update for production)
  API_BASE: 'http://localhost:7071',
  
  // Authentication
  auth: {
    enabled: true,
    sessionCheckInterval: 300000, // 5 minutes
    autoLogoutWarning: 60000, // 1 minute warning
    cookieName: 'poker_session'
  },
  
  // Feature flags
  features: {
    autoSave: true,
    validateDates: true,
    mockData: false, // Use mock data instead of API
    debugMode: true
  },
  
  // Storage keys
  storage: {
    rebuyData: 'rebuyData',
    gameData: 'currentGame',
    rebuyHistory: 'rebuyHistory',
    gameHistory: 'pokerGames',
    sessionToken: 'poker_session_token',
    userData: 'poker_user_data'
  },
  
  // Default values
  defaults: {
    rebuyType: 'regular',
    payment: 200,
    language: 'he',
    seasonId: 2 // Current active season
  },
  
  // Server settings (for development)
  server: {
    port: 8000,
    encoding: 'utf-8', // Hebrew language support
    customServer: true // Use custom Python server with UTF-8 support
  }
};

// Auto-detect production environment
if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
  CONFIG.environment = 'production';
  CONFIG.API_BASE = window.location.origin + '/api';
  CONFIG.features.debugMode = false;
}
