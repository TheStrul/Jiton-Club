# ?? GitHub Pages Setup - Step by Step

## ? Status: Repository Ready!

Your code is committed locally. Now let's push to GitHub!

---

## ?? **Steps to Deploy:**

### **1?? Create GitHub Repository**

1. Go to: https://github.com/new
2. Repository name: `jiton-poker-club`
3. Description: `Jiton Poker Club - League Management & Tournament Recorder`
4. **Keep it PRIVATE** (for now)
5. **DON'T** initialize with README (we already have one)
6. Click **"Create repository"**

---

### **2?? Push Code to GitHub**

GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/YOUR-USERNAME/jiton-poker-club.git
git branch -M main
git push -u origin main
```

**Replace `YOUR-USERNAME` with your actual GitHub username!**

Or run this if you know your username:

```powershell
# Example:
git remote add origin https://github.com/avistrul/jiton-poker-club.git
git branch -M main
git push -u origin main
```

---

### **3?? Enable GitHub Pages**

1. Go to your repo: `https://github.com/YOUR-USERNAME/jiton-poker-club`
2. Click **Settings** (top right)
3. Click **Pages** (left sidebar)
4. Under **Source**:
   - Branch: `main`
   - Folder: `/` (root) or `/web` if you want just web files
5. Click **Save**

? Wait 1-2 minutes...

---

### **4?? Get Your URL!**

GitHub will show:
```
Your site is published at https://YOUR-USERNAME.github.io/jiton-poker-club/
```

Your poker form will be at:
```
https://YOUR-USERNAME.github.io/jiton-poker-club/web/easy-game-recorder.html
```

?? **Open this on your iPhone!**

---

## ?? **Quick Commands (Copy-Paste)**

Assuming your GitHub username is in the commands below. **Edit before running!**

```powershell
# 1. Add remote (EDIT YOUR-USERNAME!)
git remote add origin https://github.com/YOUR-USERNAME/jiton-poker-club.git

# 2. Push to GitHub
git branch -M main
git push -u origin main

# Done! Now enable GitHub Pages in the web interface (step 3 above)
```

---

## ?? **After Deploy:**

### **Test on iPhone:**

1. Open Safari
2. Go to: `https://YOUR-USERNAME.github.io/jiton-poker-club/web/easy-game-recorder.html`
3. Bookmark it or **Add to Home Screen**:
   - Tap Share button
   - Scroll down ? "Add to Home Screen"
   - Name it: "?'????"
   - Tap Add

Now you have an app! ??

---

## ?? **Update After Changes:**

Every time you edit the form:

```powershell
git add web/easy-game-recorder.html
git commit -m "Updated poker form"
git push
```

? Wait ~1 minute ? Refresh iPhone ? Done!

---

## ?? **Optional: Custom Domain**

If you want: `poker.jitonclub.com` instead of GitHub URL:

1. Buy domain
2. Add CNAME record pointing to: `YOUR-USERNAME.github.io`
3. In GitHub Pages settings, add custom domain

(We can do this later!)

---

## ?? **Keep It Private?**

GitHub Pages on private repos requires **GitHub Pro** ($4/month)

**Alternatives:**
1. Make repo **public** (free GitHub Pages)
2. Use **Azure Storage** instead (you already have it)
3. Pay for GitHub Pro

**My recommendation:** Make it public OR use Azure Storage.

---

## ? **Ready to Push?**

Run these commands (edit YOUR-USERNAME first!):

```powershell
git remote add origin https://github.com/YOUR-USERNAME/jiton-poker-club.git
git push -u origin main
```

Then enable GitHub Pages in settings!

---

**What's your GitHub username, Strul my dear friend?** I'll give you the exact commands! ??
