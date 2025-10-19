// Configuration for different environments
const CONFIG = {
  // Environment: 'development' | 'production'
  environment: 'development',
  
  // API Base URL (update for production)
  API_BASE: 'http://localhost:7071',
  
  // Authentication
  auth: {
    enabled: true,
    pin: '1234' // Change this to your desired 4-digit PIN
  },
  
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
  },
  
  // Server settings (for development)
  server: {
    port: 8000,
    encoding: 'utf-8', // Hebrew language support
    customServer: true // Use custom Python server with UTF-8 support
  }
};
