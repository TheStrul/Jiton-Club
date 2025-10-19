# Jiton Club Poker League - Current Project Status
**Date:** January 19, 2025  
**Session Summary:** Complete overview of work completed

---

## ?? **Project Overview**

A poker league management system with:
- **Frontend:** Mobile-first web app (HTML/CSS/JavaScript)
- **Backend:** Azure Functions (.NET 8 isolated)
- **Database:** SQL Server (LocalDB for dev, Azure SQL for production)

---

## ? **COMPLETED WORK**

### **1. Database Layer (100% Complete)**

#### **Setup:**
- ? SQL Server LocalDB installed and running
- ? Database created: `PokerLeague`
- ? Connection: `(localdb)\MSSQLLocalDB`

#### **Schema Applied:**
```sql
-- 10 Tables Created:
- Players (with PreferredLanguage field recommended for future)
- Seasons
- TournamentTypes
- Events
- EventInvites
- EventResponses
- EventPlayers
- LeagueLedger
- PayoutRules
- SheetsSyncLog
```

#### **Seed Data Loaded:**
- 5+ Active Players (Lidor, Shmuli, Shuster, Merfish, Goldberg)
- 1 Active Season
- Tournament Types defined

#### **Verification Commands:**
```powershell
# Check database exists
sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "SELECT name FROM sys.databases WHERE name='PokerLeague'"

# Check players loaded
sqlcmd -S "(localdb)\MSSQLLocalDB" -d PokerLeague -Q "SELECT PlayerId, FullName FROM Players"
```

---

### **2. Frontend Web Application (95% Complete)**

#### **File Structure:**
```
web/
??? login.html                 ? PIN-based auth page
??? menu.html                  ? Main navigation hub
??? easy-game-recorder.html    ? Game entry/rebuy/scoring
??? index.html                 (old RSVP page - legacy)
??? dashboard.html             (old dashboard - legacy)
?
??? js/
?   ??? config.js              ? Environment configuration
?   ??? resources.js           ? All UI strings (Hebrew + English)
?   ?
?   ??? resources/ (NEW - WinForms-style pattern)
?   ?   ??? resources.js       ? Core loader
?   ?   ??? resources.he.js    ? Hebrew strings
?   ?   ??? resources.en.js    ? English strings
?   ?
?   ??? utils/
?   ?   ??? auth.js            ? Session-based authentication
?   ?   ??? helpers.js         ? UI utilities (DOM, messages)
?   ?   ??? storage.js         ? localStorage wrapper
?   ?
?   ??? data/
?   ?   ??? DataService.js     ? Abstract interface
?   ?   ??? MockService.js     ? Local development (active)
?   ?   ??? ApiService.js      ? Production API client (ready)
?   ?
?   ??? models/
?   ?   ??? Player.js          ? Player entity
?   ?   ??? Rebuy.js           ? Rebuy entity
?   ?
?   ??? components/
?   ?   ??? BaseComponent.js   ? Reusable component base
?   ?
?   ??? game-app.js            ? Game recorder controller
?   ??? menu-app.js            ? Main menu controller
?   ??? login-app.js           ? Login controller
?
??? css/
?   ??? main.css               ? CSS variables and base
?   ??? layout.css             ? Page layouts
?   ??? components.css         ? Component styles + menu/login
?
??? server.py                  ? Custom UTF-8 dev server
??? .htaccess                  ? Apache UTF-8 config
??? staticwebapp.config.json   ? Azure Static Web App config
??? SERVER-README.md           ? Server setup guide
```

#### **Features Implemented:**

**Authentication System:**
- ? Login page with 4-digit PIN (`login.html`)
- ? Session management (8-hour expiry)
- ? Auth stored in `sessionStorage`
- ? Protected page redirection
- ? Default PIN: `1234` (configurable in `config.js`)

**Main Menu:**
- ? Navigation hub with 6 feature cards
- ? Language switcher (Hebrew ? English)
- ? Logout button
- ? Only "Record Game" currently enabled
- ? Other features show "?????" (Coming Soon) badge

**Game Recorder:**
- ? Multi-step wizard (Players ? Rebuys ? Results ? Summary)
- ? Player selection with guest support
- ? Rebuy tracking (Regular/House/Dotke types)
- ? Results recording by position
- ? Auto-save to localStorage
- ? WhatsApp summary export
- ? Back to menu navigation

**Multi-Language Support:**
- ? Hebrew (default) + English
- ? WinForms-style resource pattern (separate files per language)
- ? Language preference stored in `localStorage`
- ? **Future:** Language preference to be stored in database per player

**Custom Server:**
- ? Python UTF-8 server (`server.py`)
- ? Automatic UTF-8 encoding for Hebrew
- ? Color console logs
- ? Smart MIME type handling

**Current Data Flow:**
```
User ? Web Browser ? Python Server (port 8000)
                   ?
              Serves HTML/CSS/JS
                   ?
         JavaScript runs in browser
                   ?
            MockService (localStorage)
                   ?
           No backend API yet
```

---

### **3. Backend API - Data Access Layer (50% Complete)**

#### **Created:**

**Interface Layer:**
```
api/PokerLeague.Api/Data/Abstractions/IPokerRepository.cs
- Complete interface with 23+ methods defined
- Player operations (5 methods)
- Season operations (3 methods)
- Event operations (3 methods)
- RSVP operations (3 methods)
- Attendance operations (2 methods)
- Results operations (2 methods)
- League standings (3 methods)
- Tournament types (2 methods)
```

**DTO Layer:**
```
api/PokerLeague.Api/Models/Dtos.cs
- PlayerDto (with PreferredLanguage field)
- EventDto, EventDetailsDto, EventPlayerDto
- SeasonDto
- RsvpDto
- AttendanceDto, ResultDto
- StandingDto, LedgerDto
- TournamentTypeDto
- Request DTOs (CreateEventRequest, RsvpRequest, etc.)
```

#### **Existing Code (Old Pattern):**
```
api/PokerLeague.Api/Data/SqlRepository.cs
- Uses Dapper for SQL queries
- Works with current Azure Functions
- Not using new IPokerRepository interface yet
- Methods:
  - CreateEventAsync()
  - GetEventAsync()
  - RsvpAsync()
  - UpsertAttendanceAsync()
  - SaveResultsAsync()
  - GetStandingsAsync()
  - GetActivePlayersAsync()
```

#### **Azure Functions (Exist, Not Updated):**
```
api/PokerLeague.Api/Functions/
- EventsFunctions.cs       (needs update to use IPokerRepository)
- LeagueFunctions.cs       (needs update)
- PlayersFunctions.cs      (needs update)
- WeeklyReportFunction.cs  (generates PDF reports)
```

#### **Status:**
- ?? **SqlPokerRepository.cs NOT created yet**
- ?? **Program.cs NOT configured for DI**
- ?? **local.settings.json NOT created**
- ?? **Azure Functions NOT updated to use new interface**
- ? **Azure Functions NOT running locally**

---

### **4. Documentation Created**

**LOCALDEV_SETUP.md:**
- Complete local development setup guide
- Database creation steps (LocalDB)
- API configuration instructions
- Web server setup
- End-to-end testing scenarios
- Troubleshooting section

**SERVER-README.md:**
- Custom Python server documentation
- UTF-8 encoding setup
- Language preference storage
- File structure overview

---

## ?? **Current Working State**

### **What Works RIGHT NOW:**

#### **Frontend (Fully Functional):**
```powershell
# Start web server
cd web
python server.py

# Access at: http://localhost:8000/login.html
# PIN: 1234
# Language switch: Works ?
# Game recording: Works with MockService ?
# Data: Saved to localStorage ?
```

#### **Database (Ready):**
```powershell
# Query database
sqlcmd -S "(localdb)\MSSQLLocalDB" -d PokerLeague -Q "SELECT * FROM Players"
# Returns 5+ players ?
```

### **What Does NOT Work Yet:**

#### **Backend API:**
- ? Azure Functions NOT running
- ? No API endpoints available (`http://localhost:7071`)
- ? Frontend can't connect to real database
- ? Currently using MockService (fake data in localStorage)

---

## ?? **Architecture Layers**

### **Desired Production Flow:**
```
Browser
  ? (HTTP)
Azure Static Web Apps (frontend)
  ? (HTTPS API calls)
Azure Functions App (backend)
  ? (C# calls)
IPokerRepository (interface)
  ? (implementation)
SqlPokerRepository (data access)
  ? (SQL queries via Dapper)
Azure SQL Database
```

### **Current Local Flow:**
```
Browser
  ? (HTTP)
Python Server (localhost:8000) - Frontend files
  ? (JavaScript runs)
MockService - Fake data in localStorage
  ? NO backend connection
  ? NO database access
```

### **Target Local Flow:**
```
Browser
  ? (HTTP)
Python Server (localhost:8000) - Frontend files
  ? (fetch API calls)
Azure Functions (localhost:7071) - Backend API
  ? (C# calls)
IPokerRepository
  ?
SqlPokerRepository
  ? (SQL queries)
SQL Server LocalDB
```

---

## ??? **Current Configuration**

### **web/js/config.js:**
```javascript
const CONFIG = {
  environment: 'development',
  API_BASE: 'http://localhost:7071',
  
  auth: {
    enabled: true,
    pin: '1234'
  },
  
  features: {
    useApi: false,  // ? Currently FALSE (using MockService)
    autoSave: true,
    validateDates: true
  },
  
  defaults: {
    rebuyType: 'regular',
    payment: 200,
    language: 'he'
  }
};
```

**To connect to backend API, need to change:**
```javascript
useApi: true  // ? Change to TRUE when Functions running
```

---

## ?? **Known Issues & TODOs**

### **Encoding Issues:**
- ?? Some Hebrew characters show as `???` in certain files
- ? **Solution:** Use `python server.py` instead of basic Python server
- ? UTF-8 encoding configured in:
  - `server.py` (local dev)
  - `.htaccess` (Apache production)
  - `staticwebapp.config.json` (Azure production)

### **Language Preference Storage:**
**Current:** Stored in browser `localStorage`
```javascript
localStorage.setItem('preferredLanguage', 'en')
```

**Future (Recommended):**
- Add `PreferredLanguage` column to `Players` table in database
- Store per-user preference in SQL
- Load user preference after login from API
- Save changes back to database via API
- Keep localStorage as fallback for anonymous browsing

---

## ?? **Technology Stack**

### **Frontend:**
- HTML5 + CSS3 (Responsive, mobile-first)
- Vanilla JavaScript (ES6+, OOP pattern)
- No frameworks (intentional)
- RTL support for Hebrew
- localStorage for client-side persistence

### **Backend:**
- .NET 8 (isolated worker)
- Azure Functions (serverless)
- Dapper (micro-ORM)
- QuestPDF (report generation)

### **Database:**
- SQL Server LocalDB (development)
- Azure SQL Database (production)
- 10 tables with foreign keys

### **Development:**
- Python HTTP server (UTF-8 encoding)
- Visual Studio 2022 / VS Code
- Azure Functions Core Tools
- sqlcmd (database operations)

---

## ?? **Repository Structure**

```
poker-league-mvp/
??? .github/
?   ??? copilot-instructions.md    ? Architecture rules
?
??? api/
?   ??? PokerLeague.Api/
?       ??? Data/
?       ?   ??? Abstractions/
?       ?   ?   ??? IPokerRepository.cs      ? Interface
?       ?   ??? SqlRepository.cs             ? Old implementation
?       ??? Models/
?       ?   ??? Dtos.cs                      ? Data transfer objects
?       ??? Functions/
?       ?   ??? EventsFunctions.cs
?       ?   ??? LeagueFunctions.cs
?       ?   ??? PlayersFunctions.cs
?       ?   ??? WeeklyReportFunction.cs
?       ??? Program.cs                       ?? Needs DI config
?
??? sql/
?   ??? 001_schema.sql                       ? Applied
?   ??? 002_seed.sql                         ? Applied
?
??? web/                                     ? Complete structure
?
??? LOCALDEV_SETUP.md                        ? Setup guide
??? README.md                                ? Original docs
```

---

## ?? **Key Decisions Made**

1. **WinForms-Style Resource Pattern:** Separate language files (`resources.he.js`, `resources.en.js`) instead of single monolithic file

2. **Repository Pattern:** Complete abstraction with `IPokerRepository` interface for clean data access layer

3. **No Mock Repository:** Only `SqlPokerRepository` implementation needed since we have real LocalDB

4. **Language Storage:** Future enhancement to store in database per player, currently in localStorage

5. **UTF-8 Encoding:** Custom Python server with proper encoding headers for Hebrew support

6. **Session-Based Auth:** Simple PIN authentication with 8-hour session expiry

7. **Component Architecture:** OOP JavaScript pattern with reusable components and models

---

## ?? **Critical Files**

### **Must Create Before Running API:**
```
api/PokerLeague.Api/local.settings.json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "UseDevelopmentStorage=true",
    "FUNCTIONS_WORKER_RUNTIME": "dotnet-isolated",
    "SqlConnection": "Server=(localdb)\\MSSQLLocalDB;Database=PokerLeague;Trusted_Connection=True;TrustServerCertificate=True;",
    "DefaultSeasonId": "1"
  }
}
```

### **Must Create Before Using New Pattern:**
```
api/PokerLeague.Api/Data/SqlPokerRepository.cs
- Implement all 23 methods from IPokerRepository
- Use Dapper for SQL operations
- Inject connection string via constructor
```

---

## ?? **How to Test Current System**

### **Frontend Only (Works Now):**
```powershell
# Terminal 1: Start web server
cd web
python server.py

# Browser: Navigate to
http://localhost:8000/login.html

# Login with PIN: 1234
# Navigate to game recorder
# Record sample game
# Data saved to localStorage
```

### **Database Access:**
```powershell
# View players
sqlcmd -S "(localdb)\MSSQLLocalDB" -d PokerLeague -Q "SELECT * FROM Players"

# View seasons
sqlcmd -S "(localdb)\MSSQLLocalDB" -d PokerLeague -Q "SELECT * FROM Seasons"
```

---

## ?? **Progress Summary**

| Component | Status | Completion |
|-----------|--------|------------|
| **Database Schema** | ? Complete | 100% |
| **Database Seed Data** | ? Complete | 100% |
| **Frontend Pages** | ? Complete | 95% |
| **Frontend Architecture** | ? Complete | 100% |
| **Multi-Language** | ? Complete | 100% |
| **Authentication** | ? Complete | 100% |
| **Custom Server** | ? Complete | 100% |
| **Repository Interface** | ? Complete | 100% |
| **DTOs** | ? Complete | 100% |
| **Repository Implementation** | ? Not Started | 0% |
| **DI Configuration** | ? Not Started | 0% |
| **Functions Update** | ? Not Started | 0% |
| **End-to-End Testing** | ? Not Started | 0% |

**Overall Project Completion:** ~60%

---

## ?? **Ready for Next Phase**

All groundwork is complete. The system is ready to:
1. Implement `SqlPokerRepository` with all methods
2. Configure dependency injection
3. Start Azure Functions locally
4. Connect frontend to backend
5. Test complete end-to-end flow

**Everything is in place for the next development phase!** ??
