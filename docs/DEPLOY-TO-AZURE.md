# ?? Deploy to Azure - Quick Guide

## ?? Goal
Get the poker form on Azure so you can access it from your iPhone!

---

## ?? **Method 1: Azure Storage (Recommended - 2 minutes!)**

### **Prerequisites:**
- Azure Storage Account (you probably have one)
- Azure CLI installed

### **Steps:**

1. **Find your Storage Account name:**
   - Go to Azure Portal
   - Find your storage account
   - Copy the name (e.g., `jitonstorage`)

2. **Run the deployment script:**
```powershell
.\deploy-to-azure.ps1 -StorageAccountName "YOUR_STORAGE_NAME"
```

3. **Done!** 
   - Script gives you a URL
   - Open it on your iPhone
   - Bookmark it or add to home screen!

---

## ?? **Using on iPhone:**

### **Add to Home Screen (Makes it feel like an app!):**
1. Open the URL in Safari
2. Tap the **Share** button (square with arrow)
3. Scroll down ? **"Add to Home Screen"**
4. Name it: "?'???? ??????"
5. Tap **"Add"**

Now you have an app icon on your iPhone! ??

---

## ?? **Update After Changes:**

Every time you edit the form:
```powershell
.\deploy-to-azure.ps1 -StorageAccountName "YOUR_STORAGE_NAME"
```

Refresh the page on your iPhone - done!

---

## ?? **Alternative: GitHub Pages (Also Free!)**

If you prefer GitHub:

1. **Push to GitHub:**
```bash
git add web/easy-game-recorder.html
git commit -m "Add easy game recorder"
git push
```

2. **Enable GitHub Pages:**
   - Go to repo ? Settings ? Pages
   - Source: `main` branch
   - Folder: `/web`
   - Save

3. **Your URL:**
```
https://YOUR-USERNAME.github.io/poker-league-mvp/easy-game-recorder.html
```

---

## ?? **Alternative: Azure Static Web Apps**

If you want the full production setup:

1. **Create Static Web App in Azure Portal**
2. **Connect to GitHub**
3. **Deploy automatically on push**

This is overkill for testing but great for production!

---

## ?? **What I Recommend for NOW:**

Use **Azure Storage** (Method 1):
- ? Super fast (2 minutes)
- ? Works immediately
- ? Easy to update
- ? You probably already have storage
- ? No build process needed

---

## ?? **Example:**

```powershell
# If your storage account is called "jitonstorage"
.\deploy-to-azure.ps1 -StorageAccountName "jitonstorage"

# Output:
# ? SUCCESS! Your poker form is now online!
# ?? URL for iPhone:
# https://jitonstorage.blob.core.windows.net/poker-forms/easy-game-recorder.html
```

Copy that URL, open on iPhone, done! ????

---

## ?? **Troubleshooting:**

### **"Azure CLI not found":**
Install it: `winget install Microsoft.AzureCLI`

### **"Permission denied":**
Run: `az login` first

### **"Storage account not found":**
Check the name in Azure Portal

---

## ?? **After Deploy:**

1. **Open URL on iPhone**
2. **Test the form**:
   - Click "? ??? ???" ? See all 19 players
   - Uncheck a few
   - Change payment amounts
   - Enter positions
   - Click "?????? - ????"
   - See WhatsApp open!

3. **Add to home screen** for easy access during games

---

**Ready to deploy, Strul my dear friend?** ??

Just tell me your Azure Storage Account name and we'll get it online!
