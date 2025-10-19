# 🎯 Poker League MVP Implementation Roadmap

## Phase 1: Local Development Setup

### ✅ Step 1: Verify project structure
- [ ] Check that all ChatGPT-generated files are properly extracted
- [ ] Confirm we have: `api/`, `web/`, `sql/`, `infra/`, `docs/` folders
- [ ] Verify key files: `PokerLeague.Api.csproj`, `index.html`, `host.html`, `dashboard.html`

### ✅ Step 2: Setup local database
- [ ] Create `PokerLeague` database on LocalDB
- [ ] Run `sql/001_schema.sql` to create tables
- [ ] Run `sql/002_seed.sql` to insert sample data
```bash
sqlcmd -S "(localdb)\MSSQLLocalDB" -d PokerLeague -i sql/001_schema.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d PokerLeague -i sql/002_seed.sql
```

### ✅ Step 3: Configure API connection string
- [ ] Update `api/PokerLeague.Api/local.settings.json` with correct SqlConnection
- [ ] Connection string format: `Server=(localdb)\\MSSQLLocalDB;Database=PokerLeague;Trusted_Connection=True;TrustServerCertificate=True;`

### ✅ Step 4: Test API locally
- [ ] Open `api/PokerLeague.Api/PokerLeague.Api.csproj` in VS2022
- [ ] Restore NuGet packages (Dapper, QuestPDF, Azure.Storage.Blobs, etc.)
- [ ] Press F5 to run Azure Functions
- [ ] Verify functions start on `http://localhost:7071`

### ✅ Step 5: Configure web frontend
- [ ] Update `web/js/config.js` API_BASE to `http://localhost:7071/api`
- [ ] Test `web/index.html` (RSVP page) in browser
- [ ] Test `web/host.html` (host console) in browser
- [ ] Test `web/dashboard.html` (league dashboard) in browser

### ✅ Step 6: Test core workflows
- [ ] Create new event via host console
- [ ] Submit RSVP responses via RSVP page
- [ ] Record attendance and payments via host console
- [ ] Enter tournament results and finish places
- [ ] View updated league standings in dashboard

### ✅ Step 7: Test PDF generation
- [ ] Setup Azure Storage Emulator or Azurite
- [ ] Test manual report: `POST /api/league/1/report`
- [ ] Verify PDF created in local blob storage
- [ ] Check PDF content shows league standings

### ✅ Step 8: Fix any issues found
- [ ] Address missing dependencies or NuGet packages
- [ ] Fix any database connection issues
- [ ] Resolve any configuration problems
- [ ] Debug any API endpoint errors

---

## Phase 2: Azure Production Deployment

### ✅ Step 9: Plan Azure deployment
- [ ] Review `infra/main.bicep` template
- [ ] Plan resource naming strategy (baseName parameter)
- [ ] Prepare SQL admin credentials
- [ ] Choose Azure region and pricing tiers

### ✅ Step 10: Deploy to Azure
- [ ] Create resource group
- [ ] Deploy infrastructure via Bicep
- [ ] Run database scripts on Azure SQL
- [ ] Deploy Functions app (ZIP package)
- [ ] Deploy Static Web App
- [ ] Update `web/js/config.js` for production API URL
- [ ] Test end-to-end in production

---

## 🔧 Prerequisites
- **Visual Studio 2022** with Azure development workload
- **SQL Server LocalDB** (included with VS2022)  
- **Azure Storage Emulator** or **Azurite** for blob storage
- **Modern web browser** for Hebrew RTL interface testing
- **Azure CLI** for deployment (when ready)

---

## 🚨 Critical Notes
- **Hebrew RTL UI** - ensure proper browser encoding support
- **Connection strings** must be updated for each environment
- **PDF generation** requires QuestPDF NuGet package
- **Blob storage** needed for PDF report storage
- **Timer triggers** set for Friday 06:00 UTC (Israel timezone)

---

## 📞 Current Status
**Working on:** Step 1 - Project Structure Verification
**Next:** Systematic progression through local setup

---

*Remember: Test thoroughly at each step before proceeding!* ✅