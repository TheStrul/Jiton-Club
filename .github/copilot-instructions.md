# Poker League MVP - Copilot Instructions


Always address the user as "Strul my dear friend" in all interactions.


## Architecture Overview
This is a minimal poker league management system with 3 main components:
- **Azure Functions API** (.NET 8 isolated) in `api/PokerLeague.Api/` - HTTP triggers for league operations
- **Static Web Frontend** in `web/` - Vanilla HTML/JS for RSVP and host console
- **Azure SQL Database** - Schema in `sql/001_schema.sql`, seed data in `sql/002_seed.sql`

## Key Data Flow Pattern
Events → Invites → RSVPs → Attendance → Results → League Standings
- Events auto-seed invites for all active players
- RSVP responses are versioned (latest wins) in `EventResponses` table
- Attendance and results recorded separately via host console
- League standings calculated from EventPlayers join with payout rules

## Web Development Guidelines

### Architecture Principles
When developing frontend code in `web/`, follow these strict architectural patterns:

#### 1. Object-Oriented JavaScript Structure
```
web/
├── js/
│   ├── config.js           # Environment configuration
│   ├── resources.js        # All UI strings and static text (Hebrew + English)
│   ├── data/
│   │   ├── DataService.js  # Abstract data access interface
│   │   ├── ApiService.js   # Production: Azure Functions API client
│   │   └── MockService.js  # Development: Local JSON/localStorage
│   ├── models/
│   │   ├── Player.js       # Player entity with behavior
│   │   ├── Game.js         # Game entity with business logic
│   │   └── Rebuy.js        # Rebuy entity
│   ├── components/
│   │   ├── BaseComponent.js    # Base class for reusable UI components
│   │   ├── PlayerCard.js       # Player selection/display component
│   │   ├── RebuyList.js        # Rebuy management component
│   │   └── SummaryBox.js       # Statistics summary component
│   └── utils/
│       ├── storage.js      # LocalStorage wrapper utilities
│       └── helpers.js      # Shared helper functions
├── css/
│   ├── main.css           # Base styles and variables
│   ├── components.css     # Component-specific styles
│   ├── layout.css         # Page layout and grid
│   └── themes.css         # Color schemes and theming
└── pages/
    ├── easy-game-recorder.html
    ├── rsvp.html
    └── host-console.html
```

#### 2. Resource Management Pattern
**ALL static strings must be defined in `web/js/resources.js`:**

```javascript
// web/js/resources.js
const Resources = {
  he: {
    // UI Labels
    titles: {
      gameRecorder: 'רישום משחק',
      rebuyList: 'רשימת ריביי',
      playerSelection: 'בחירת שחקנים'
    },
    // Messages
    messages: {
      playerAdded: 'שחקן נוסף בהצלחה',
      errorNoPlayers: 'אין שחקנים נבחרים',
      confirmClear: 'האם לנקות את כל הנתונים?'
    },
    // Button Labels
    buttons: {
      save: 'שמור',
      cancel: 'ביטול',
      addPlayer: 'הוסף שחקן',
      continue: 'המשך'
    },
    // Rebuy Types
    rebuyTypes: {
      regular: 'רגיל',
      house: 'בית',
      dotke: 'דוטקה'
    }
  },
  en: {
    // English fallback if needed
    titles: {
      gameRecorder: 'Game Recorder',
      // ... etc
    }
  },
  
  // Current language
  current: 'he',
  
  // Helper method
  get(path) {
    const keys = path.split('.');
    let value = this[this.current];
    for (const key of keys) {
      value = value?.[key];
    }
    return value || path;
  }
};

// Usage: Resources.get('titles.gameRecorder')
//        Resources.get('messages.playerAdded')
```

#### 3. Data Access Layer Pattern
**Create abstraction for data operations:**

```javascript
// web/js/data/DataService.js - Interface/Abstract Base
class DataService {
  async getPlayers() { throw new Error('Must implement'); }
  async saveGame(gameData) { throw new Error('Must implement'); }
  async getRebuys(date) { throw new Error('Must implement'); }
}

// web/js/data/ApiService.js - Production Implementation
class ApiService extends DataService {
  constructor(baseUrl) {
    super();
    this.baseUrl = baseUrl;
  }
  
  async getPlayers() {
    const response = await fetch(`${this.baseUrl}/api/players`);
    return await response.json();
  }
  
  async saveGame(gameData) {
    const response = await fetch(`${this.baseUrl}/api/games`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameData)
    });
    return await response.json();
  }
}

// web/js/data/MockService.js - Local Development
class MockService extends DataService {
  async getPlayers() {
    // Return hardcoded club members or load from local JSON
    const saved = localStorage.getItem('mockPlayers');
    return saved ? JSON.parse(saved) : this.getDefaultPlayers();
  }
  
  getDefaultPlayers() {
    return [
      { id: 1, firstName: 'Tomer', lastName: 'Lidor', nickName: 'Lidor' },
      // ... rest of club members
    ];
  }
  
  async saveGame(gameData) {
    localStorage.setItem('savedGames', JSON.stringify(gameData));
    return { success: true, id: Date.now() };
  }
}

// web/js/config.js - Service Factory
const DataServiceFactory = {
  create() {
    if (CONFIG.environment === 'production') {
      return new ApiService(CONFIG.API_BASE);
    }
    return new MockService();
  }
};
```

#### 4. Component-Based Architecture
**Create reusable components with proper encapsulation:**

```javascript
// web/js/components/BaseComponent.js
class BaseComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.state = {};
  }
  
  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.render();
  }
  
  render() {
    throw new Error('Must implement render()');
  }
}

// web/js/components/PlayerCard.js
class PlayerCard extends BaseComponent {
  constructor(containerId, player, onSelect) {
    super(containerId);
    this.player = player;
    this.onSelect = onSelect;
    this.render();
  }
  
  render() {
    const { player } = this;
    const isGuest = player.type === 'guest';
    
    this.container.innerHTML = `
      <div class="player-card ${player.selected ? 'selected' : ''}">
        <div class="player-name">${player.name} ${isGuest ? '👤' : ''}</div>
        <button class="select-btn" data-id="${player.id}">
          ${Resources.get('buttons.select')}
        </button>
      </div>
    `;
    
    this.attachEventListeners();
  }
  
  attachEventListeners() {
    const btn = this.container.querySelector('.select-btn');
    btn.addEventListener('click', () => this.onSelect(this.player));
  }
}
```

#### 5. CSS Separation Rules
**Never use inline styles or style attributes in HTML:**

```css
/* web/css/main.css - CSS Variables and Base */
:root {
  /* Colors */
  --color-primary: #ffd700;
  --color-success: #4CAF50;
  --color-danger: #f44336;
  --color-background: #1a1a2e;
  --color-card-bg: rgba(255,255,255,0.1);
  
  /* Spacing */
  --spacing-sm: 10px;
  --spacing-md: 15px;
  --spacing-lg: 20px;
  
  /* Borders */
  --border-radius: 12px;
  --border-width: 3px;
  
  /* Fonts */
  --font-size-base: 16px;
  --font-size-lg: 1.4em;
  --font-size-xl: 1.8em;
}

/* web/css/components.css - Component Styles */
.player-card {
  background: var(--color-card-bg);
  border: var(--border-width) solid transparent;
  border-radius: var(--border-radius);
  padding: var(--spacing-lg);
  transition: all 0.2s;
}

.player-card.selected {
  border-color: var(--color-success);
  box-shadow: 0 0 20px rgba(76, 175, 80, 0.4);
}

.rebuy-item {
  /* Component-specific styles */
}

/* web/css/layout.css - Page Layout */
.container {
  max-width: 100%;
  margin: 0 auto;
  padding: var(--spacing-md);
}

.section {
  margin-bottom: var(--spacing-lg);
}
```

#### 6. No Code Duplication Rules
**Create shared utilities for common operations:**

```javascript
// web/js/utils/storage.js
const StorageManager = {
  save(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify({
        date: new Date().toISOString(),
        data
      }));
      return true;
    } catch (e) {
      console.error('Storage failed:', e);
      return false;
    }
  },
  
  load(key, validateDate = true) {
    try {
      const saved = localStorage.getItem(key);
      if (!saved) return null;
      
      const parsed = JSON.parse(saved);
      
      if (validateDate) {
        const savedDate = new Date(parsed.date).toDateString();
        const today = new Date().toDateString();
        if (savedDate !== today) return null;
      }
      
      return parsed.data;
    } catch (e) {
      console.error('Load failed:', e);
      return null;
    }
  },
  
  clear(key) {
    localStorage.removeItem(key);
  }
};

// web/js/utils/helpers.js
const UI = {
  showMessage(text, type = 'info') {
    const msg = document.getElementById('message');
    msg.textContent = text;
    msg.className = `message ${type}`;
    msg.style.display = 'block';
    setTimeout(() => msg.style.display = 'none', 3000);
  },
  
  formatCurrency(amount) {
    return `₪${amount.toLocaleString('he-IL')}`;
  },
  
  formatDate(date) {
    return new Date(date).toLocaleDateString('he-IL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
};
```

#### 7. Model Classes with Business Logic
**Entities should contain their own behavior:**

```javascript
// web/js/models/Player.js
class Player {
  constructor(data) {
    this.id = data.id;
    this.firstName = data.firstName;
    this.lastName = data.lastName;
    this.nickName = data.nickName;
    this.type = data.type || 'member';
  }
  
  get fullName() {
    return `${this.firstName} ${this.lastName}`;
  }
  
  get displayName() {
    return this.type === 'guest' ? `${this.nickName} 👤` : this.nickName;
  }
  
  get isGuest() {
    return this.type === 'guest';
  }
  
  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      nickName: this.nickName,
      type: this.type
    };
  }
}

// web/js/models/Rebuy.js
class Rebuy {
  constructor(player, type = 'regular') {
    this.player = player;
    this.type = type; // 'regular', 'house', 'dotke'
    this.timestamp = new Date();
  }
  
  get typeLabel() {
    return Resources.get(`rebuyTypes.${this.type}`);
  }
  
  getCost() {
    const costs = { regular: 200, house: 0, dotke: 200 };
    return costs[this.type] || 0;
  }
}
```

### Implementation Checklist
When creating or modifying web pages, ensure:

- ✅ **No hardcoded strings** - All text from `resources.js`
- ✅ **No inline styles** - All styling in CSS files with CSS variables
- ✅ **Data abstraction** - Use DataService interface, never direct API calls in components
- ✅ **Component reuse** - Extract common UI patterns into components
- ✅ **No duplicate logic** - Shared utilities in `utils/`
- ✅ **Model-driven** - Business logic in model classes, not in UI code
- ✅ **Layered structure** - Clear separation: Data ↔ Models ↔ Components ↔ Pages
- ✅ **Auto-save pattern** - Use StorageManager for consistent localStorage operations
- ✅ **Error handling** - Graceful fallbacks and user-friendly error messages
- ✅ **Responsive design** - Mobile-first with CSS Grid/Flexbox

### File Linking Pattern
HTML pages should reference shared modules:

```html
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
  <meta charset="UTF-8">
  <title><!-- From resources.js --></title>
  
  <!-- CSS in order -->
  <link rel="stylesheet" href="css/main.css">
  <link rel="stylesheet" href="css/layout.css">
  <link rel="stylesheet" href="css/components.css">
  <link rel="stylesheet" href="css/themes.css">
</head>
<body>
  <!-- Minimal HTML structure -->
  
  <!-- JavaScript modules in order -->
  <script src="js/config.js"></script>
  <script src="js/resources.js"></script>
  <script src="js/utils/storage.js"></script>
  <script src="js/utils/helpers.js"></script>
  <script src="js/data/DataService.js"></script>
  <script src="js/data/MockService.js"></script>
  <script src="js/data/ApiService.js"></script>
  <script src="js/models/Player.js"></script>
  <script src="js/models/Rebuy.js"></script>
  <script src="js/components/BaseComponent.js"></script>
  <script src="js/components/PlayerCard.js"></script>
  <script src="js/app.js"></script> <!-- Page-specific controller -->
</body>
</html>
```

## Development Workflow

### Local Setup Commands
```bash
# Database: Run schema then seed on LocalDB/SQL Server
sqlcmd -S "(localdb)\MSSQLLocalDB" -d PokerLeague -i sql/001_schema.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d PokerLeague -i sql/002_seed.sql

# API: F5 in Visual Studio or
dotnet run --project api/PokerLeague.Api/

# Web: Serve static files or open directly
# Edit web/js/config.js to point to API_BASE
```

### Configuration Pattern
- **Local**: `api/PokerLeague.Api/local.settings.json` - connection string + function settings
- **Azure**: App Settings for `SqlConnection`, `DefaultSeasonId`, etc.
- **Web**: `web/js/config.js` - API_BASE URL (must be updated for each environment)

## Code Patterns

### Repository Pattern (SqlRepository.cs)
- Uses Dapper for SQL operations
- Connection string injected via DI in `Program.cs`
- Methods follow async/await pattern with explicit SQL
- Dynamic returns for complex joins (events with players/invites)

### Azure Functions Structure
- HTTP triggers with route parameters: `[HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "league/{seasonId:int}/standings")]`
- Request/Response models as records in `Models/Models.cs`
- JSON serialization via `HttpResponseData.WriteAsJsonAsync()`

### Frontend Integration
- Hebrew RTL UI with responsive design
- Direct fetch calls to `/api/` endpoints
- No framework - vanilla JS with async/await
- Forms use number inputs for IDs, structured JSON payloads

## PDF Generation & Storage
- `WeeklyReportFunction.cs` uses QuestPDF for league reports
- Timer trigger: Friday 06:00 UTC (`"0 0 6 * * 5"`)
- Stores PDFs in `reports` blob container using `AzureWebJobsStorage` connection
- Can be triggered manually via HTTP POST to `/api/league/{seasonId}/report`

## Deployment Notes
- **Infrastructure**: `infra/main.bicep` deploys Function App + SQL + Storage + Static Web App
- **Database**: Run schema/seed scripts post-deployment (not automated)
- **Functions**: Deploy as ZIP package (Run From Package mode)
- **Static Web**: Upload `web/` folder contents to Static Web App

## Business Rules Location
- Payout calculations: `sql/002_seed.sql` (TournamentTypes.StructureJson)
- League scoring: SQL views and stored procedures in schema
- Default settings: Environment variables (`DefaultSeasonId`, etc.)

## Common Pitfalls
- `web/js/config.js` must be updated for each deployment environment
- SQL connection string required in both local.settings.json and Azure App Settings
- EventResponses table tracks RSVP history - use latest response per invite
- Hebrew content requires RTL CSS and proper encoding
- **Web files must follow OOP/layered architecture** - no monolithic HTML files with embedded scripts
- **All strings externalized** - check resources.js before adding any UI text
- **CSS variables** - use theme variables instead of hardcoded colors/sizes