# Local Development Setup Guide - Jiton Club Poker League

## ?? Prerequisites

- ? SQL Server LocalDB (comes with Visual Studio)
- ? .NET 8 SDK
- ? Visual Studio 2022 or VS Code
- ? Azure Functions Core Tools (optional, for CLI)

---

## ?? **Step 1: Create Local Database**

### **Option A: Using SQL Server Management Studio (SSMS)**

1. **Connect to LocalDB:**
   ```
   Server name: (localdb)\MSSQLLocalDB
   Authentication: Windows Authentication
   ```

2. **Create Database:**
   ```sql
   CREATE DATABASE PokerLeague;
   GO
   ```

3. **Run Schema:**
   - Open `sql/001_schema.sql` in SSMS
   - Execute against `PokerLeague` database

4. **Run Seed Data:**
   - Open `sql/002_seed.sql` in SSMS  
   - Execute against `PokerLeague` database

### **Option B: Using Command Line**

```powershell
# Navigate to project root
cd C:\Users\avist\source\repos\GitHubLocal\Customers\JitonClub\poker-league-mvp

# Create database and run schema
sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "CREATE DATABASE PokerLeague"
sqlcmd -S "(localdb)\MSSQLLocalDB" -d PokerLeague -i sql/001_schema.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d PokerLeague -i sql/002_seed.sql
```

### **Verify Database Creation:**

```powershell
sqlcmd -S "(localdb)\MSSQLLocalDB" -d PokerLeague -Q "SELECT name FROM sys.tables"
```

**Expected Output:**
```
name
-----------------
Players
Seasons
TournamentTypes
Events
EventInvites
EventResponses
EventPlayers
LeagueLedger
PayoutRules
SheetsSyncLog
```

---

## ?? **Step 2: Configure API Connection String**

### **Create or Edit `local.settings.json`:**

**File:** `api/PokerLeague.Api/local.settings.json`

```json
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

**Important:** Add `local.settings.json` to `.gitignore` if not already there (contains local settings).

---

## ?? **Step 3: Run Azure Functions API Locally**

### **Option A: Visual Studio 2022**

1. Open `api/PokerLeague.Api/PokerLeague.Api.csproj` in VS2022
2. Set `PokerLeague.Api` as startup project
3. Press **F5** to run
4. Functions host will start on `http://localhost:7071`

### **Option B: Command Line**

```powershell
cd api/PokerLeague.Api
dotnet build
dotnet run
# Or use Azure Functions Core Tools:
func start
```

### **Verify API is Running:**

Open browser or use curl:
```
http://localhost:7071/api/players
```

**Expected:** List of players from seed data.

---

## ?? **Step 4: Configure and Run Web Frontend**

### **Update `web/js/config.js`:**

```javascript
const CONFIG = {
  environment: 'development',
  API_BASE: 'http://localhost:7071', // ? Local Functions API
  
  auth: {
    enabled: true,
    pin: '1234'
  },
  
  features: {
    useApi: true,  // ? SET TO TRUE for local API testing
    autoSave: true,
    validateDates: true
  },
  
  storage: {
    rebuyData: 'rebuyData',
    gameData: 'currentGame',
    rebuyHistory: 'rebuyHistory',
    gameHistory: 'pokerGames'
  },
  
  defaults: {
    rebuyType: 'regular',
    payment: 200,
    language: 'he'
  },
  
  server: {
    port: 8000,
    encoding: 'utf-8'
  }
};
```

### **Start Web Server:**

```powershell
cd web
python server.py
```

### **Access Application:**

```
Login:        http://localhost:8000/login.html
Main Menu:    http://localhost:8000/menu.html
Game Recorder: http://localhost:8000/easy-game-recorder.html
```

---

## ?? **Step 5: Test End-to-End Flow**

### **Test Scenario: Create Event and Record Game**

1. **Create Event (via API):**
```powershell
curl -X POST "http://localhost:7071/api/events/create?seasonId=1" `
  -H "Content-Type: application/json"
```

2. **Get Event Details:**
```powershell
curl "http://localhost:7071/api/events/1"
```

3. **RSVP (via Web or API):**
```powershell
curl -X POST "http://localhost:7071/api/events/1/rsvp" `
  -H "Content-Type: application/json" `
  -d '{"playerId": 1, "response": "Yes"}'
```

4. **Record Attendance:**
```powershell
curl -X POST "http://localhost:7071/api/events/1/attendance" `
  -H "Content-Type: application/json" `
  -d '[
    {"playerId": 1, "buyIns": 1, "rebuys": 1},
    {"playerId": 2, "buyIns": 1, "rebuys": 0}
  ]'
```

5. **Record Results:**
```powershell
curl -X POST "http://localhost:7071/api/events/1/results" `
  -H "Content-Type: application/json" `
  -d '[
    {"playerId": 1, "finishPlace": 1},
    {"playerId": 2, "finishPlace": 2}
  ]'
```

6. **Get League Standings:**
```powershell
curl "http://localhost:7071/api/league/1/standings"
```

---

## ?? **Project Structure**

```
poker-league-mvp/
??? api/
?   ??? PokerLeague.Api/
?       ??? Data/                    ? DATA ACCESS LAYER
?       ?   ??? IRepository.cs       ? Interface (abstraction)
?       ?   ??? SqlRepository.cs     ? SQL implementation
?       ?   ??? MockRepository.cs    ? In-memory testing
?       ??? Services/                ? BUSINESS LOGIC LAYER
?       ?   ??? IGameService.cs
?       ?   ??? GameService.cs
?       ?   ??? ILeagueService.cs
?       ?   ??? LeagueService.cs
?       ??? Functions/               ? API LAYER
?       ?   ??? EventsFunctions.cs
?       ?   ??? LeagueFunctions.cs
?       ?   ??? PlayersFunctions.cs
?       ??? Models/
?       ?   ??? Models.cs            ? DTOs and domain models
?       ??? Program.cs               ? DI configuration
?       ??? local.settings.json      ? Local config (NOT in Git)
?
??? sql/
?   ??? 001_schema.sql               ? Database schema
?   ??? 002_seed.sql                 ? Sample data
?
??? web/
    ??? js/
    ?   ??? data/
    ?   ?   ??? DataService.js       ? Abstract interface
    ?   ?   ??? ApiService.js        ? HTTP API client
    ?   ?   ??? MockService.js       ? Local development
    ?   ??? config.js                ? Frontend config
    ??? server.py                    ? Dev server
```

---

## ??? **Data Access Layer Architecture**

### **3-Tier Separation:**

```
???????????????????????????????????????
?  PRESENTATION LAYER (Functions)     ?
?  - EventsFunctions.cs               ?
?  - LeagueFunctions.cs               ?
?  - Validates HTTP requests          ?
?  - Returns HTTP responses           ?
???????????????????????????????????????
               ?
               ?
???????????????????????????????????????
?  BUSINESS LOGIC LAYER (Services)    ?
?  - GameService.cs                   ?
?  - LeagueService.cs                 ?
?  - Calculates standings             ?
?  - Applies business rules           ?
???????????????????????????????????????
               ?
               ?
???????????????????????????????????????
?  DATA ACCESS LAYER (Repository)     ?
?  - IRepository.cs (interface)       ?
?  - SqlRepository.cs (SQL Server)    ?
?  - MockRepository.cs (Testing)      ?
?  - ONLY database operations         ?
???????????????????????????????????????
```

---

## ?? **Troubleshooting**

### **LocalDB Connection Issues:**

```powershell
# Check LocalDB instances
sqllocaldb info

# Start LocalDB instance
sqllocaldb start MSSQLLocalDB

# Check if database exists
sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "SELECT name FROM sys.databases"
```

### **Functions Won't Start:**

1. Check `local.settings.json` exists
2. Verify connection string is correct
3. Check .NET 8 SDK installed: `dotnet --list-sdks`
4. Clear bin/obj folders: `dotnet clean`

### **Web Can't Connect to API:**

1. Verify API is running on `http://localhost:7071`
2. Check `web/js/config.js` has correct `API_BASE`
3. Check browser console for CORS errors
4. Verify `features.useApi = true` in config

---

## ? **Success Checklist**

- [ ] LocalDB instance running
- [ ] Database `PokerLeague` created with all tables
- [ ] Seed data loaded (19 players, 1 season, tournament types)
- [ ] `local.settings.json` configured with connection string
- [ ] API running on `http://localhost:7071`
- [ ] Web server running on `http://localhost:8000`
- [ ] Can login to web app (PIN: 1234)
- [ ] Can fetch players from API
- [ ] Can create events and record games

---

## ?? **Next Steps**

1. Test all API endpoints locally
2. Verify data access layer separation
3. Test web app with live API (set `useApi: true`)
4. Add integration tests
5. Deploy to Azure when ready

**All systems ready for development!** ??
