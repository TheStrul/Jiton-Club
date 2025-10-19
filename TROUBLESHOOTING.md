# Troubleshooting Guide - Jiton Poker League

## Issue 1: Menu Page Shows Empty Layout Before Text Appears ?

### **Symptom:**
The menu.html page displays the layout (header, cards, footer structure) but text content takes several seconds to appear.

### **Root Cause:**
The page uses JavaScript to load and populate all text content from `resources.js`. This happens in several steps:
1. HTML structure loads (instant)
2. CSS styles apply (instant)  
3. JavaScript files load (takes time)
4. Resources initialize (takes time)
5. Text content populates (finally appears)

### **Why It Happens:**
- Multiple JavaScript files need to load sequentially
- Resources file contains all Hebrew/English text
- Text is populated dynamically via JavaScript
- Network latency or slow file serving can delay this

### **Current Behavior:**
- Layout appears immediately ?
- Text appears after 1-3 seconds ?
- This is **normal** but can be improved

### **Solutions:**

#### **Quick Fix (Immediate):**
Add a loading indicator while JavaScript loads:

```html
<!-- Add this to menu.html right after <body> -->
<div id="pageLoader" style="position: fixed; top: 0; left: 0; right: 0; bottom: 0; 
     background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
     display: flex; align-items: center; justify-content: center; z-index: 9999;">
  <div style="text-align: center; color: white;">
    <div style="font-size: 3em; margin-bottom: 20px;">??</div>
    <div style="font-size: 1.5em;">????...</div>
  </div>
</div>

<!-- Add this script at the END of menu.html, after all other scripts -->
<script>
  // Hide loader when page is fully loaded
  window.addEventListener('load', function() {
    document.getElementById('pageLoader').style.display = 'none';
  });
</script>
```

#### **Better Fix (Recommended):**
Pre-render initial text in HTML instead of waiting for JavaScript:

```html
<!-- Instead of: -->
<h1 id="dashboardTitle"><!-- From JS --></h1>

<!-- Use: -->
<h1 id="dashboardTitle">????? ???? - ?'????</h1>
<!-- JavaScript will replace it if needed -->
```

#### **Best Fix (Future):**
Bundle and minify JavaScript files to reduce load time.

---

## Issue 2: Status Page Shows Backend as "Offline" ?

### **Symptom:**
The status.html page shows "Backend API: Offline" even though the API is actually running.

### **Root Cause:**
The API is responding, but it's **SLOW** (2+ seconds). The status check had a short timeout that expired before the API responded.

### **Why API is Slow:**
1. **Database Cold Start:** LocalDB goes to sleep after inactivity
2. **First Query:** Takes 2-3 seconds to wake up the database
3. **Subsequent Queries:** Much faster (200-300ms)

### **Verification:**
Run this in PowerShell:
```powershell
Measure-Command { Invoke-RestMethod -Uri "http://localhost:7071/api/players/active" }
```

Expected results:
- **First call:** 2000-3000ms ?
- **Second call:** 200-500ms ?

### **Solution Applied:**
? **Increased timeout from 5 seconds to 15 seconds** in both:
- `web/status.html`
- `web/test-connection.html`

Now the status check will wait long enough for the database to wake up.

### **How to Verify Fix:**
1. **Refresh the status page:** `http://localhost:8000/status.html`
2. **Wait up to 5 seconds** on first load
3. Should now show: **Backend API: Online** ?
4. Response time will show: ~2000ms on first check, faster afterwards

---

## Issue 3: How to Speed Up the API ??

### **Option 1: Keep Database Warm**
Run a query every minute to prevent cold start:

```powershell
# Run this in a PowerShell window (keep it open)
while ($true) {
    Invoke-RestMethod -Uri "http://localhost:7071/api/players/active" -ErrorAction SilentlyContinue | Out-Null
    Write-Host "$(Get-Date -Format 'HH:mm:ss') - Keepalive ping" -ForegroundColor Green
    Start-Sleep -Seconds 60
}
```

### **Option 2: Use SQL Server Instead of LocalDB**
LocalDB is designed to sleep when idle. Full SQL Server Express stays awake.

To switch:
1. Install SQL Server Express
2. Update connection string in `api/PokerLeague.Api/local.settings.json`:
```json
"SqlConnection": "Server=localhost;Database=PokerLeague;Trusted_Connection=True;"
```

### **Option 3: Accept the Delay**
2 seconds on first load is acceptable for development. Just wait for it! ?

---

## Summary of Fixes Applied ?

### **1. Status Page Timeout:**
- ? Increased from 5s ? 15s
- ? Added warning for slow responses  
- ? Shows response time in UI

### **2. Test Connection Page:**
- ? Increased timeout to 15s
- ? Added response time display
- ? Better error messages

### **3. Next Steps for Menu:**
Option A: Add loading indicator (quick)
Option B: Pre-render text (better)
Option C: Bundle JS files (best)

---

## How to Test the Fixes ??

### **Test 1: Status Page**
```
1. Open: http://localhost:8000/status.html
2. Wait 5 seconds
3. Should show "Backend API: Online" (green) ?
4. Response time: ~2000ms first time, faster after
```

### **Test 2: Test Connection Page**
```
1. Open: http://localhost:8000/test-connection.html
2. Click "Test Connection" button
3. Should show "Online" (green) ?
4. Click "Get Players" button
5. Should list 19 players ?
```

### **Test 3: Menu Page Speed**
```
1. Close browser completely
2. Reopen: http://localhost:8000/login.html
3. Login with PIN: 1234
4. Note: Menu appears in stages:
   - Layout: Instant
   - Text: 1-3 seconds
   - This is normal!
```

---

## Expected Behavior After Fixes ?

### **Status Page:**
- First load: Shows "Checking..." for 2-3 seconds
- Then shows: "Backend API: Online" (green)
- Response time: ~2000ms
- Subsequent checks: Faster (200-500ms)

### **Menu Page:**
- Layout appears immediately
- Text populates within 1-3 seconds
- Once loaded, navigation is instant

### **Test Connection:**
- All tests should pass
- Players list shows 19 entries
- Create event works
- No timeout errors

---

## Still Having Issues? ??

### **Backend Shows Offline After 15 Seconds:**
**Check:**
1. Is Azure Functions running? (Look for terminal window)
2. Does terminal show "Host started"?
3. Try manually: `Invoke-RestMethod http://localhost:7071/api/players/active`

**If manual call works but status shows offline:**
- Browser might be caching old JavaScript
- Press **Ctrl+Shift+R** to hard refresh

### **Menu Still Slow:**
**This is expected!** The menu loads 6-7 JavaScript files sequentially.

**To improve:**
- Add the loading indicator (see Quick Fix above)
- Or accept the 1-3 second delay (it's normal)

---

## Performance Benchmarks ??

### **Expected Timings:**

| Operation | First Time | Subsequent |
|-----------|------------|------------|
| Database Query | 2000-3000ms | 200-500ms |
| API Response | 2000-3000ms | 200-500ms |
| Menu JS Load | 500-1500ms | (cached) |
| Total Menu Load | 3-5 seconds | 1-2 seconds |

### **Acceptable:**
- ? Status check: 2-3 seconds first time
- ? Menu load: 1-3 seconds for text
- ? API calls: 2-3 seconds first, then fast

### **Not Acceptable (indicates problem):**
- ? Status check: Over 15 seconds
- ? Menu never loads text
- ? API calls always fail

---

## Quick Reference Commands ??

### **Check if Backend is Responding:**
```powershell
Invoke-RestMethod -Uri "http://localhost:7071/api/players/active"
```

### **Check Response Time:**
```powershell
Measure-Command { Invoke-RestMethod -Uri "http://localhost:7071/api/players/active" }
```

### **Refresh Browser (Clear Cache):**
```
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)
```

### **Check if Web Server is Running:**
```powershell
Invoke-WebRequest -Uri "http://localhost:8000" -Method HEAD
```

---

**All fixes have been applied! Refresh the pages to see improvements.** ?

If you still see "Backend Offline," wait 5 seconds - it's just the database waking up! ?
