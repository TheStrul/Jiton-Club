# Jiton Club Poker League - Next Steps Action Plan
**Date:** January 19, 2025  
**Phase:** Complete Data Access Layer & Start Backend

**NOTE:** The interface and DTOs files were removed due to build conflicts with existing code.
The old `SqlRepository.cs` pattern will be used initially, then refactored.

---

## ?? **OBJECTIVE**

Start Azure Functions locally with existing `SqlRepository.cs`, verify backend works, then optionally refactor to clean Repository Pattern later.

---

## ?? **PHASE 1: Get Backend Running (Simplified)**

### **Task 1.1: Create local.settings.json**
**File:** `api/PokerLeague.Api/local.settings.json`

**Content:**
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

**Important:**
- This file contains secrets
- Should be in `.gitignore`
- Update connection string if using different SQL Server instance

---

### **Task 1.2: Verify Existing Repository Works**
**File:** `api/PokerLeague.Api/Data/SqlRepository.cs`

**Existing methods work:**
```csharp
Task<int> CreateEventAsync()
Task<dynamic?> GetEventAsync()
Task<int> RsvpAsync()
Task<int> UpsertAttendanceAsync()
Task<int> SaveResultsAsync()
Task<IEnumerable<dynamic>> GetStandingsAsync()
Task<IEnumerable<dynamic>> GetActivePlayersAsync()
```

**These are sufficient for initial testing!**
