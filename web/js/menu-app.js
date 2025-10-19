// Main Menu App - Dashboard Controller
class MenuApp {
  constructor() {
    this.menuItems = [];
    this.init();
  }
  
  init() {
    this.initializeUIText();
    this.buildMenuItems();
    this.renderMenu();
  }
  
  initializeUIText() {
    try {
      document.title = Resources.get('titles.mainMenu');
      DOM.$('dashboardTitle').innerHTML = `${Resources.icon('game')} ${Resources.get('titles.mainMenu')}`;
      DOM.$('welcomeMessage').textContent = Resources.get('messages.welcome');
      DOM.$('logoutBtn').innerHTML = `${Resources.icon('logout')} ${Resources.get('buttons.logout')}`;
      DOM.$('footerText').textContent = Resources.get('messages.menuFooter');
    } catch (error) {
      console.error('Failed to initialize UI text:', error);
    }
  }
  
  buildMenuItems() {
    this.menuItems = [
      {
        id: 'record-game',
        title: Resources.get('menu.recordGame'),
        description: Resources.get('menu.recordGameDesc'),
        icon: Resources.icon('game'),
        url: 'easy-game-recorder.html',
        enabled: true,
        badge: null
      },
      {
        id: 'view-history',
        title: Resources.get('menu.viewHistory'),
        description: Resources.get('menu.viewHistoryDesc'),
        icon: Resources.icon('history'),
        url: 'history.html',
        enabled: false, // Coming soon
        badge: '?????'
      },
      {
        id: 'league-standings',
        title: Resources.get('menu.leagueStandings'),
        description: Resources.get('menu.leagueStandingsDesc'),
        icon: Resources.icon('trophy'),
        url: 'standings.html',
        enabled: false, // Coming soon
        badge: '?????'
      },
      {
        id: 'manage-players',
        title: Resources.get('menu.managePlayers'),
        description: Resources.get('menu.managePlayersDesc'),
        icon: Resources.icon('guest'),
        url: 'players.html',
        enabled: false, // Coming soon
        badge: '?????'
      },
      {
        id: 'statistics',
        title: Resources.get('menu.statistics'),
        description: Resources.get('menu.statisticsDesc'),
        icon: Resources.icon('stats'),
        url: 'statistics.html',
        enabled: false, // Coming soon
        badge: '?????'
      },
      {
        id: 'settings',
        title: Resources.get('menu.settings'),
        description: Resources.get('menu.settingsDesc'),
        icon: Resources.icon('settings'),
        url: 'settings.html',
        enabled: false, // Coming soon
        badge: '?????'
      }
    ];
  }
  
  renderMenu() {
    const grid = DOM.$('menuGrid');
    DOM.clear(grid);
    
    this.menuItems.forEach(item => {
      const card = this.createMenuCard(item);
      grid.appendChild(card);
    });
  }
  
  createMenuCard(item) {
    const card = document.createElement('div');
    card.className = `menu-card ${item.enabled ? 'enabled' : 'disabled'}`;
    
    if (item.enabled) {
      card.onclick = () => this.navigate(item.url);
      card.style.cursor = 'pointer';
    }
    
    card.innerHTML = `
      <div class="menu-card-header">
        <div class="menu-icon">${item.icon}</div>
        ${item.badge ? `<span class="menu-badge">${item.badge}</span>` : ''}
      </div>
      <div class="menu-card-body">
        <h3 class="menu-title">${item.title}</h3>
        <p class="menu-description">${item.description}</p>
      </div>
    `;
    
    return card;
  }
  
  navigate(url) {
    window.location.href = url;
  }
}

// Global functions
function logout() {
  if (UI.confirm(Resources.get('confirmations.logout'))) {
    Auth.logout();
    window.location.href = 'login.html';
  }
}

function switchLanguage(lang) {
  Resources.switchLanguage(lang);
}

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    console.log('Initializing Menu App...');
    new MenuApp();
  } catch (error) {
    console.error('Failed to initialize menu app:', error);
    alert('Failed to initialize menu. Check console for details.');
  }
});
