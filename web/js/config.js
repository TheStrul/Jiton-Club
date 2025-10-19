// Configuration for different environments
const CONFIG = {
  // Environment: 'development' | 'production'
  environment: 'development',
  
  // API Base URL (update for production)
  API_BASE: 'http://localhost:7071',
  
  // Feature flags
  features: {
    useApi: false, // Set to true when API is ready
    autoSave: true,
    validateDates: true
  },
  
  // Storage keys
  storage: {
    rebuyData: 'rebuyData',
    gameData: 'currentGame',
    rebuyHistory: 'rebuyHistory',
    gameHistory: 'pokerGames'
  },
  
  // Default values
  defaults: {
    rebuyType: 'regular',
    payment: 200,
    language: 'he'
  }
};
