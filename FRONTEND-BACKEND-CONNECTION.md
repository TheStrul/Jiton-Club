# Frontend-Backend Connection Guide

## ? Current Status (as of Phase 1 Complete)

### Backend API (Azure Functions)
- **Status:** ? Running locally
- **URL:** `http://localhost:7071`
- **Endpoints Working:**
  - ? `GET /api/players/active` - Returns 19 active players
  - ? `GET /api/league/{seasonId}/standings` - Returns league standings
  - ? `POST /api/events/create` - Creates new events
  - ? `GET /api/events/{eventId}` - Retrieves event details
  - ?? `POST /api/events/{eventId}/rsvp` - Ready (not tested)
  - ?? `POST /api/events/{eventId}/attendance` - Ready (not tested)
  - ?? `POST /api/events/{eventId}/results` - Ready (not tested)

### Frontend Configuration
- **Config File:** `web/js/config.js`
- **API Connection:** ? ENABLED (`useApi: true`)
- **API Base URL:** `http://localhost:7071`
- **Season ID:** `2` (matches database)

---

## ?? How to Start Both Servers

### Terminal 1: Start Backend (Azure Functions)
```powershell
# Make sure you're in the project root
cd C:\Users\avist\source\repos\GitHubLocal\Customers\JitonClub\poker-league-mvp

# Start Azure Functions
cd api\PokerLeague.Api
func start
# OR press F5 in Visual Studio

# Functions will start on: http://localhost:7071
```

### Terminal 2: Start Frontend (Web Server)
```powershell
# In a NEW terminal window
cd C:\Users\avist\source\repos\GitHubLocal\Customers\JitonClub\poker-league-mvp

# Start Python web server with UTF-8 support
cd web
python server.py

# Web server will start on: http://localhost:8000
```

---

## ?? Test the Connection

### Option 1: Connection Test Page
1. Open browser to: `http://localhost:8000/test-connection.html`
2. Click the buttons to test each API endpoint
3. Verify green ? success messages

### Option 2: Manual Test
```powershell
# Test players endpoint
Invoke-RestMethod -Uri "http://localhost:7071/api/players/active"

# Test standings endpoint
Invoke-RestMethod -Uri "http://localhost:7071/api/league/2/standings"
```

---

## ?? Access the Application

### Main Pages:
- **Login:** `http://localhost:8000/login.html`
  - PIN: `1234`
  
- **Main Menu:** `http://localhost:8000/menu.html`
  
- **Game Recorder:** `http://localhost:8000/easy-game-recorder.html`
  - Now connected to real database!
  - Players loaded from SQL database
  - Games saved to database via API

- **Connection Test:** `http://localhost:8000/test-connection.html`

---

## ?? Data Flow (Connected Mode)

```
User Browser (http://localhost:8000)
    ?
Python Web Server (serves HTML/CSS/JS)
    ?
JavaScript Runs in Browser
    ?
config.js: useApi = true
    ?
ApiService.js (makes fetch calls)
    ?
Azure Functions API (http://localhost:7071)
    ?
SqlRepository.cs (Dapper queries)
    ?
SQL Server LocalDB
    ?
PokerLeague Database
```

---

## ?? What Changed

### Before (MockService):
```javascript
// web/js/config.js
features: {
    useApi: false  // ? Using localStorage
}

// Data stored in browser only
localStorage.setItem('gameData', ...)
```

### After (ApiService):
```javascript
// web/js/config.js
features: {
    useApi: true  // ? Using real API
}

// Data saved to SQL database
fetch('http://localhost:7071/api/events/create', ...)
```

---

## ?? Database Configuration

### Current Database Settings:
- **Server:** `(localdb)\MSSQLLocalDB`
- **Database:** `PokerLeague`
- **Season ID:** `2` (League Table Season 31)
- **Players:** 19 active players
- **Tournament Types:** 4 (Hold'em, Omaha, Stud, Special)

### Key Configuration File:
```json
// api/PokerLeague.Api/local.settings.json
{
  "Values": {
    "SqlConnection": "Server=(localdb)\\MSSQLLocalDB;Database=PokerLeague;...",
    "DefaultSeasonId": "2"
  }
}
```

---

## ??? Troubleshooting

### Issue: "Failed to fetch" or Connection Refused

**Solution 1:** Make sure Azure Functions are running
```powershell
# Check if Functions are running
curl http://localhost:7071/api/players/active
```

**Solution 2:** Check firewall/antivirus
- Allow Python and Azure Functions through firewall

---

### Issue: Empty player list in frontend

**Solution:** Check config.js
```javascript
// Make sure this is set to true
features: {
    useApi: true
}
```

---

### Issue: 500 Internal Server Error

**Solution:** Check Azure Functions logs in the terminal
- Look for SQL errors
- Verify database connection
- Check SeasonId is correct (2, not 1)

---

### Issue: CORS errors in browser console

**Solution:** Azure Functions should allow localhost origins
```csharp
// Already configured in Azure Functions (isolated worker mode)
// No action needed for local development
```

---

## ? Verification Checklist

Before using the application, verify:

- [ ] Azure Functions running on `http://localhost:7071`
- [ ] Python web server running on `http://localhost:8000`
- [ ] `config.js` has `useApi: true`
- [ ] Test connection page shows all green checkmarks
- [ ] Can fetch 19 players from API
- [ ] Can create test event successfully
- [ ] Database has SeasonId = 2

---

## ?? Ready to Use!

Once both servers are running and tests pass:

1. Open `http://localhost:8000/login.html`
2. Login with PIN: `1234`
3. Go to "Record Game"
4. Players will load from database
5. Record a game
6. Data will be saved to SQL database
7. Check standings to see results!

---

## ?? Support

If you encounter issues:
1. Check both terminals for error messages
2. Run the connection test page
3. Verify database connection with sqlcmd
4. Check that SeasonId = 2 in database

**Happy Poker League Management!** ????
