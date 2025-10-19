# Poker League MVP (Azure Functions + Web + Azure SQL)

A minimal, phone-friendly MVP to run your weekly poker league:
- Web RSVP (no WhatsApp integration yet)
- Host console to record buy-ins, rebuys, results, keeper, host, tournament type
- Automatic league table calculation
- Azure Functions (.NET 8 isolated) + Azure SQL schema
- Static Web App frontend (vanilla HTML/JS)

## Quick start (local dev)
1. **Database**
   - Create a SQL Server DB (LocalDB or Azure SQL).
   - Execute `sql/001_schema.sql` then `sql/002_seed.sql`.
   - Copy your connection string and set it in `api/PokerLeague.Api/local.settings.json` under `SqlConnection`.

2. **API (Azure Functions)**
   - Open `api/PokerLeague.Api/PokerLeague.Api.csproj` in VS2022.
   - Press F5 to run (Functions host). Endpoints are under `/api/...`

3. **Web**
   - Open `web/index.html` and `web/host.html` directly, or serve the folder with any static server.
   - Edit `web/js/config.js` and set `API_BASE` (default `http://localhost:7071/api`).

## Deploy (Azure)
- Create Azure SQL + run schema/seed.
- Deploy Functions app (consumption plan) targeting .NET 8 isolated.
- Deploy `web/` to Azure Static Web Apps.

## Main endpoints
- `POST /api/events/create?seasonId={id}` – create event for a given date (defaults to next Thursday if not provided).
- `GET  /api/events/{eventId}` – fetch event details & players list
- `POST /api/events/{eventId}/rsvp` – body `{ playerId, response }`
- `POST /api/events/{eventId}/attendance` – body `[ { playerId, buyIns, rebuys } ]`
- `POST /api/events/{eventId}/results` – body `[ { playerId, finishPlace } ]`
- `GET  /api/league/{seasonId}/standings` – league table
- `GET  /api/league/{seasonId}/ledger` – league pot movements

> NOTE: This MVP keeps the business rules simple. Adjust payout/points in `sql/002_seed.sql` and `Data/LeagueService.cs`.


## Dashboard & Weekly PDF
- **Dashboard:** `web/dashboard.html` (Chart.js) מציג טבלת ליגה + גרף עמודות.
- **Weekly PDF:** פונקציות `WeeklyReportTimer` (כרון שישי 06:00 UTC) ו-`WeeklyReportHttp` (ידנית).
  - ה-PDF נשמר ב-Blob container בשם `reports` בחשבון ה-Storage של ה-Function App.
  - לשינוי עונה ברירת־מחדל: `DefaultSeasonId` בהגדרות האפליקציה.

## Deploy with Bicep
- קובץ: `infra/main.bicep`
- פרמטרים חובה: `baseName`, `sqlAdminLogin`, `sqlAdminPassword`.
- לאחר פריסה: הרץ את הסכמות `sql/001_schema.sql` ו-`sql/002_seed.sql` על ה-DB שנוצר.
- העלה את תיקיית `web/` ל-Static Web App (או פרוס דרך CI).
- ארוז את ה-Functions כ-ZIP ופרוס ל-Function App (Run From Package).

