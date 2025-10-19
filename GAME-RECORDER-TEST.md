# Game Recorder End-to-End Test Guide
## Jiton Club Poker League

### ?? **Test Objective**
Verify that the game recorder loads players from the database and saves games via API.

---

## ? **Pre-Test Checklist**

Before testing, ensure:
- [ ] Backend API running on `http://localhost:7071`
- [ ] Frontend server running on `http://localhost:8000`
- [ ] `config.js` has `useApi: true`
- [ ] Browser cache cleared (Ctrl+Shift+R)

**Quick Status Check:**
```powershell
# Check backend
Invoke-RestMethod -Uri "http://localhost:7071/api/players/active"

# Check frontend
Invoke-WebRequest -Uri "http://localhost:8000" -Method HEAD
```

---

## ?? **Test Steps**

### **Step 1: Open Game Recorder**
1. Open browser to: `http://localhost:8000/easy-game-recorder.html`
2. If redirected to login, use PIN: `1234`

**Expected:**
- Page loads with layout
- Loading spinner appears briefly (if on menu)
- Player dropdown should populate

### **Step 2: Verify Players Loaded from API**
1. Click the player dropdown (select box at bottom)
2. Check browser console (F12)

**Expected Console Output:**
```
? Using API Service - Connected to backend
```

**Expected Dropdown:**
- Should show 19+ players from database
- Names like: Arik Fridman, Avi Strul, Danny Silberstein, etc.
- Option to add guest

**If you see "Using Mock Service":**
- Check `config.js` ? `useApi` should be `true`
- Hard refresh: Ctrl+Shift+R

### **Step 3: Add Players to Game**
1. Select "Arik Fridman" from dropdown
2. Click "?? Add Result Entry" button
3. Enter position: `1`
4. Enter payment: `200`
5. Repeat for 2-3 more players with different positions

**Expected:**
- Players appear in "Results List" section
- Summary updates: Total Players, Total Entries, Total Money

### **Step 4: Add Rebuys**
1. Select a player who already has a result
2. Click "?? Add Rebuy Entry" button  
3. Select rebuy type: Regular/House/Dotke
4. Enter payment amount

**Expected:**
- Rebuy appears in "Rebuy List" section
- Summary updates with new totals

### **Step 5: Save Game**
1. Click "???? - ????" (Finish - Save) button at bottom
2. Watch browser console for API calls

**Expected Console Output:**
```
Saving game via API: {players: Array(4), rebuys: Array(2), ...}
Created event: 4
Recorded attendance for 4 players
Submitted results for 4 players
```

**Expected UI:**
- Success message appears
- WhatsApp export option (optional)
- Data should be saved

### **Step 6: Verify in Database**
Run these commands in PowerShell to verify data was saved:

```powershell
# Check if new event was created
sqlcmd -S "(localdb)\MSSQLLocalDB" -d PokerLeague -Q "SELECT TOP 5 EventId, EventDate, Notes FROM Events ORDER BY EventId DESC"

# Check if players were added to event
sqlcmd -S "(localdb)\MSSQLLocalDB" -d PokerLeague -Q "SELECT TOP 10 ep.EventPlayerId, ep.EventId, p.FullName, ep.BuyIns, ep.Rebuys, ep.FinishPlace FROM EventPlayers ep JOIN Players p ON ep.PlayerId = p.PlayerId ORDER BY ep.EventPlayerId DESC"

# Check league standings updated
Invoke-RestMethod -Uri "http://localhost:7071/api/league/2/standings" | Select-Object -First 5
```

**Expected Results:**
- New event in Events table
- EventPlayers records with correct buy-ins, rebuys, and positions
- Standings show updated points for players

---

## ?? **Troubleshooting**

### **Issue 1: Dropdown is Empty / No Players**

**Check Console:**
```javascript
// Should see:
? Using API Service - Connected to backend
// If you see:
?? Using Mock Service - ...
```

**Solutions:**
1. Verify `config.js`:
```javascript
features: {
    useApi: true  // Must be true
}
```

2. Hard refresh browser: `Ctrl+Shift+R`

3. Check API is responding:
```powershell
Invoke-RestMethod -Uri "http://localhost:7071/api/players/active"
```

---

### **Issue 2: "Failed to fetch" Error**

**Cause:** Backend API not running or wrong URL

**Check:**
```javascript
// In config.js:
API_BASE: 'http://localhost:7071'  // Should match Azure Functions URL
```

**Solutions:**
1. Start Azure Functions if not running
2. Wait 10-15 seconds for Functions to fully initialize
3. Check port 7071 is not blocked by firewall

---

### **Issue 3: Save Button Does Nothing**

**Check Console for Errors:**
- Look for API call failures
- Check network tab in DevTools (F12)

**Common Causes:**
- API endpoint not implemented
- Database connection issues
- Missing SeasonId in request

**Verify API Works:**
```powershell
# Test create event endpoint
$body = @{
    seasonId = 2
    tournamentTypeId = 3
    buyInAmount = 200
    rebuyLimit = 3
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:7071/api/events/create" -Method POST -Body $body -ContentType "application/json"
```

---

### **Issue 4: Database Shows No Data**

**Possible Causes:**
1. Save failed silently
2. Wrong SeasonId
3. API endpoint not saving to database

**Debug Steps:**
1. Check console for error messages
2. Check Azure Functions terminal for SQL errors
3. Verify EventId was returned from create event call

---

## ?? **Expected API Call Sequence**

When you click "Save Game", the following should happen:

```
1. POST /api/events/create
   ? Returns: { EventId: 4, EventDate: "2025-10-26" }

2. POST /api/events/4/attendance
   ? Body: [
       { playerId: 17, buyIns: 1, rebuys: 0 },
       { playerId: 20, buyIns: 1, rebuys: 1 },
       ...
     ]
   ? Returns: { Updated: 4 }

3. POST /api/events/4/results
   ? Body: [
       { playerId: 17, finishPlace: 1 },
       { playerId: 20, finishPlace: 2 },
       ...
     ]
   ? Returns: { Saved: true }
```

**Check Network Tab in DevTools:**
- All 3 calls should return 200 OK
- No 400/500 errors

---

## ? **Success Criteria**

Test is successful if:
- ? Players load from API (19+ in dropdown)
- ? Can add players to game
- ? Can add rebuys
- ? Save button creates event in database
- ? EventPlayers records created
- ? No console errors
- ? Standings update with new points

---

## ?? **Test Variations**

### **Variation 1: Guest Player**
1. Click "???? ????" (Add Guest) in dropdown
2. Enter guest name: "Test Guest"
3. Add to game
4. Save

**Expected:** Guest appears with ?? icon, saves as temporary player

### **Variation 2: Multiple Rebuys**
1. Add same player twice with different rebuy types
2. Save

**Expected:** Single EventPlayer record with summed rebuys

### **Variation 3: No Results (Just Attendance)**
1. Add players
2. Don't enter positions
3. Save

**Expected:** EventPlayer records created without FinishPlace

---

## ?? **Debug Commands**

### **Check Last Created Event:**
```powershell
sqlcmd -S "(localdb)\MSSQLLocalDB" -d PokerLeague -Q "SELECT TOP 1 * FROM Events ORDER BY EventId DESC"
```

### **Check Last EventPlayers:**
```powershell
sqlcmd -S "(localdb)\MSSQLLocalDB" -d PokerLeague -Q "SELECT TOP 10 ep.*, p.FullName FROM EventPlayers ep JOIN Players p ON ep.PlayerId = p.PlayerId ORDER BY ep.EventPlayerId DESC"
```

### **Check API Response Time:**
```powershell
Measure-Command { Invoke-RestMethod -Uri "http://localhost:7071/api/players/active" }
```

### **Check Console Logs:**
Open DevTools (F12) ? Console tab
- Should see: "Using API Service"
- Should see: "Saving game via API"
- Should NOT see: "Using Mock Service"

---

## ?? **After Successful Test**

Once the test passes:
1. Record a real game with actual players
2. Check standings to see updated points
3. Test WhatsApp export (optional)
4. Try loading the same page again (data should persist)

---

## ?? **Mobile Testing**

After desktop test works:
1. Open on mobile device: `http://<your-ip>:8000/easy-game-recorder.html`
2. Verify responsive design works
3. Test touch interactions
4. Check Hebrew text displays correctly

---

**Happy Testing, Strul my dear friend!** ??

If you encounter any issues during the test, check the troubleshooting section or run the debug commands above.
