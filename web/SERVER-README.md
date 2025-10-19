# Jiton Club Poker League - Web Development Server

## ?? Quick Start

### Option 1: Custom Python Server (Recommended)
Ensures proper UTF-8 encoding for Hebrew content:

```powershell
cd web
python server.py
```

**Access:** http://localhost:8000

### Option 2: Custom Port
```powershell
python server.py 3000
```

**Access:** http://localhost:3000

### Option 3: Basic Python Server (Not Recommended)
May have encoding issues:

```powershell
cd web
python -m http.server 8000
```

---

## ?? Features of Custom Server

? **UTF-8 Encoding** - Proper Hebrew character support
? **Custom Headers** - Content-Type with charset=utf-8
? **Color Logs** - Easier to read console output
? **Hot Reload** - Just refresh browser to see changes

---

## ?? File Structure

```
web/
??? server.py              # Custom UTF-8 server (use this!)
??? .htaccess              # Apache config (for production)
??? staticwebapp.config.json  # Azure Static Web App config
??? index.html             # Old RSVP page
??? login.html             # Login page
??? menu.html              # Main menu (after login)
??? easy-game-recorder.html # Game recorder
??? js/
?   ??? config.js          # Configuration
?   ??? resources.js       # All Hebrew strings
?   ??? utils/
?   ?   ??? auth.js        # Authentication
?   ?   ??? helpers.js     # UI helpers
?   ?   ??? storage.js     # LocalStorage wrapper
?   ??? data/
?   ?   ??? DataService.js
?   ?   ??? MockService.js
?   ?   ??? ApiService.js
?   ??? models/
?       ??? Player.js
?       ??? Rebuy.js
??? css/
    ??? main.css           # CSS variables
    ??? layout.css         # Page layout
    ??? components.css     # Component styles
```

---

## ?? Default Login

**PIN:** `1234`

Change in `web/js/config.js`:
```javascript
auth: {
  enabled: true,
  pin: '5678' // Your custom PIN
}
```

---

## ?? URLs

| Page | URL |
|------|-----|
| Login | http://localhost:8000/login.html |
| Main Menu | http://localhost:8000/menu.html |
| Game Recorder | http://localhost:8000/easy-game-recorder.html |

---

## ?? Troubleshooting

### Hebrew characters show as `?`
- **Solution:** Use `python server.py` instead of `python -m http.server`

### Port already in use
```powershell
# Try different port
python server.py 3000
```

### Server won't start
```powershell
# Check Python version (needs 3.x)
python --version

# Try with python3 command
python3 server.py
```

---

## ?? Development Notes

- All text in `resources.js` (no hardcoded strings)
- All styles in CSS files (no inline styles)
- Hebrew RTL layout throughout
- Auto-save to localStorage
- Session-based authentication

---

## ?? Production Deployment

### Azure Static Web Apps
Uses `staticwebapp.config.json` for UTF-8 headers

### Apache Server
Uses `.htaccess` for UTF-8 encoding

### Manual Files
Ensure all files are saved as **UTF-8** encoding
