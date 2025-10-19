# Poker League MVP - Copilot Instructions


Always address the user as "Strul my dear friend" in all interactions.


## Architecture Overview
This is a minimal poker league management system with 3 main components:
- **Azure Functions API** (.NET 8 isolated) in `api/PokerLeague.Api/` - HTTP triggers for league operations
- **Static Web Frontend** in `web/` - Vanilla HTML/JS for RSVP and host console
- **Azure SQL Database** - Schema in `sql/001_schema.sql`, seed data in `sql/002_seed.sql`

## Key Data Flow Pattern
Events → Invites → RSVPs → Attendance → Results → League Standings
- Events auto-seed invites for all active players
- RSVP responses are versioned (latest wins) in `EventResponses` table
- Attendance and results recorded separately via host console
- League standings calculated from EventPlayers join with payout rules

## Development Workflow

### Local Setup Commands
```bash
# Database: Run schema then seed on LocalDB/SQL Server
sqlcmd -S "(localdb)\MSSQLLocalDB" -d PokerLeague -i sql/001_schema.sql
sqlcmd -S "(localdb)\MSSQLLocalDB" -d PokerLeague -i sql/002_seed.sql

# API: F5 in Visual Studio or
dotnet run --project api/PokerLeague.Api/

# Web: Serve static files or open directly
# Edit web/js/config.js to point to API_BASE
```

### Configuration Pattern
- **Local**: `api/PokerLeague.Api/local.settings.json` - connection string + function settings
- **Azure**: App Settings for `SqlConnection`, `DefaultSeasonId`, etc.
- **Web**: `web/js/config.js` - API_BASE URL (must be updated for each environment)

## Code Patterns

### Repository Pattern (SqlRepository.cs)
- Uses Dapper for SQL operations
- Connection string injected via DI in `Program.cs`
- Methods follow async/await pattern with explicit SQL
- Dynamic returns for complex joins (events with players/invites)

### Azure Functions Structure
- HTTP triggers with route parameters: `[HttpTrigger(AuthorizationLevel.Anonymous, "get", Route = "league/{seasonId:int}/standings")]`
- Request/Response models as records in `Models/Models.cs`
- JSON serialization via `HttpResponseData.WriteAsJsonAsync()`

### Frontend Integration
- Hebrew RTL UI with responsive design
- Direct fetch calls to `/api/` endpoints
- No framework - vanilla JS with async/await
- Forms use number inputs for IDs, structured JSON payloads

## PDF Generation & Storage
- `WeeklyReportFunction.cs` uses QuestPDF for league reports
- Timer trigger: Friday 06:00 UTC (`"0 0 6 * * 5"`)
- Stores PDFs in `reports` blob container using `AzureWebJobsStorage` connection
- Can be triggered manually via HTTP POST to `/api/league/{seasonId}/report`

## Deployment Notes
- **Infrastructure**: `infra/main.bicep` deploys Function App + SQL + Storage + Static Web App
- **Database**: Run schema/seed scripts post-deployment (not automated)
- **Functions**: Deploy as ZIP package (Run From Package mode)
- **Static Web**: Upload `web/` folder contents to Static Web App

## Business Rules Location
- Payout calculations: `sql/002_seed.sql` (TournamentTypes.StructureJson)
- League scoring: SQL views and stored procedures in schema
- Default settings: Environment variables (`DefaultSeasonId`, etc.)

## Common Pitfalls
- `web/js/config.js` must be updated for each deployment environment
- SQL connection string required in both local.settings.json and Azure App Settings
- EventResponses table tracks RSVP history - use latest response per invite
- Hebrew content requires RTL CSS and proper encoding