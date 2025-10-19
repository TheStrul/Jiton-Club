# Test API Endpoints for Poker League
# Run this script to verify the Azure Functions are working

Write-Host "?? Testing Poker League API at http://localhost:7071" -ForegroundColor Cyan
Write-Host ""
Write-Host "??  Make sure Azure Functions are running!" -ForegroundColor Yellow
Write-Host "   Option 1: Press F5 in Visual Studio" -ForegroundColor Gray
Write-Host "   Option 2: Run 'func start' from api/PokerLeague.Api directory" -ForegroundColor Gray
Write-Host ""

# Wait a moment for connection
Start-Sleep -Seconds 1

# Test 1: Get Active Players
Write-Host "1?? Testing GET /api/players/active" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:7071/api/players/active" -Method GET -TimeoutSec 5
    Write-Host "   ? SUCCESS - Found $($response.Count) active players" -ForegroundColor Green
    $response | Select-Object -First 5 | Format-Table PlayerId, FullName, NickName, PhoneNumber
} catch {
    Write-Host "   ? FAILED: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Tip: Make sure Functions are running and database is accessible" -ForegroundColor Gray
}
Write-Host ""

# Test 2: Get League Standings (Season 2)
Write-Host "2?? Testing GET /api/league/2/standings" -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:7071/api/league/2/standings" -Method GET -TimeoutSec 5
    if ($response.Count -eq 0) {
        Write-Host "   ??  No standings yet (no games recorded)" -ForegroundColor Cyan
    } else {
        Write-Host "   ? SUCCESS - Found $($response.Count) players in standings" -ForegroundColor Green
        $response | Select-Object -First 5 | Format-Table PlayerId, FullName, TotalPoints
    }
} catch {
    Write-Host "   ? FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 3: Create a Test Event
Write-Host "3?? Testing POST /api/events/create" -ForegroundColor Yellow
$eventData = @{
    SeasonId = 2  # Updated to match actual database
    EventDate = (Get-Date).AddDays(7).ToString("yyyy-MM-dd")
    HostPlayerId = 9  # Tomer Lidor
    TournamentTypeId = 3  # Hold'em
    BuyInAmount = 200
    RebuyLimit = 3
    LeagueKeeperPlayerId = 9
    Notes = "Test event from API validation script"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:7071/api/events/create" -Method POST -Body $eventData -ContentType "application/json" -TimeoutSec 5
    Write-Host "   ? SUCCESS - Created event with ID: $($response.EventId)" -ForegroundColor Green
    Write-Host "   Event Date: $($response.EventDate)" -ForegroundColor Gray
    
    # Save event ID for next test
    $script:testEventId = $response.EventId
} catch {
    Write-Host "   ? FAILED: $($_.Exception.Message)" -ForegroundColor Red
}
Write-Host ""

# Test 4: Get Event Details (if we created one)
if ($script:testEventId) {
    Write-Host "4?? Testing GET /api/events/$($script:testEventId)" -ForegroundColor Yellow
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:7071/api/events/$($script:testEventId)" -Method GET -TimeoutSec 5
        Write-Host "   ? SUCCESS - Retrieved event details" -ForegroundColor Green
        Write-Host "   Event Date: $($response.evt.EventDate)" -ForegroundColor Gray
        Write-Host "   Invites sent: $($response.invites.Count)" -ForegroundColor Gray
        Write-Host "   Tournament Type: $($response.evt.TournamentTypeName)" -ForegroundColor Gray
    } catch {
        Write-Host "   ? FAILED: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "? API Testing Complete!" -ForegroundColor Cyan
Write-Host ""
Write-Host "?? Available Endpoints:" -ForegroundColor White
Write-Host "   GET  /api/players/active" -ForegroundColor Gray
Write-Host "   GET  /api/league/{seasonId}/standings" -ForegroundColor Gray
Write-Host "   POST /api/events/create" -ForegroundColor Gray
Write-Host "   GET  /api/events/{eventId}" -ForegroundColor Gray
Write-Host "   POST /api/events/{eventId}/rsvp" -ForegroundColor Gray
Write-Host "   POST /api/events/{eventId}/attendance" -ForegroundColor Gray
Write-Host "   POST /api/events/{eventId}/results" -ForegroundColor Gray
Write-Host "   POST /api/league/{seasonId}/report" -ForegroundColor Gray
Write-Host ""
Write-Host "?? Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Stop the Functions (Ctrl+C or stop debugging)" -ForegroundColor Gray
Write-Host "   2. Rebuild: dotnet build api/PokerLeague.Api" -ForegroundColor Gray
Write-Host "   3. Restart: F5 in Visual Studio or 'func start'" -ForegroundColor Gray
Write-Host "   4. Run this script again to test" -ForegroundColor Gray
