# Reset and Start System
# Drops database, rebuilds API with DatabaseInitializer, and starts everything
# Uses sqlcmd exit codes for reliable verification

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  Poker League - Reset and Start" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Drop existing database
Write-Host "[1/4] Dropping existing database..." -ForegroundColor Yellow
sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "DROP DATABASE IF EXISTS PokerLeague;" -b | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "      FAILED to drop database" -ForegroundColor Red
    exit 1
}
Write-Host "      Database dropped successfully" -ForegroundColor Green
Write-Host ""

# Step 2: Rebuild API
Write-Host "[2/4] Rebuilding API..." -ForegroundColor Yellow
Push-Location "api\PokerLeague.Api"
dotnet build --no-incremental -v quiet | Out-Null
$buildResult = $LASTEXITCODE
Pop-Location

if ($buildResult -ne 0) {
    Write-Host "      FAILED to build API" -ForegroundColor Red
    exit 1
}
Write-Host "      API rebuilt successfully" -ForegroundColor Green
Write-Host ""

# Step 3: Create database
Write-Host "[3/4] Setting up database..." -ForegroundColor Yellow

# Create database
sqlcmd -S "(localdb)\MSSQLLocalDB" -Q "CREATE DATABASE PokerLeague" -b | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "      FAILED to create database" -ForegroundColor Red
    exit 1
}
Write-Host "      Database created" -ForegroundColor Green

# Run schema
sqlcmd -S "(localdb)\MSSQLLocalDB" -d PokerLeague -i "sql\001_schema.sql" -b | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "      FAILED to run schema script" -ForegroundColor Red
    Write-Host "      Check sql/001_schema.sql for errors" -ForegroundColor Yellow
    exit 1
}
Write-Host "      Schema created successfully" -ForegroundColor Green

# Run seed
sqlcmd -S "(localdb)\MSSQLLocalDB" -d PokerLeague -i "sql\002_seed.sql" -b | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "      FAILED to run seed script" -ForegroundColor Red
    Write-Host "      Check sql/002_seed.sql for errors" -ForegroundColor Yellow
    exit 1
}
Write-Host "      Seed data loaded successfully" -ForegroundColor Green
Write-Host ""

# Step 4: Start system
Write-Host "[4/4] Starting system..." -ForegroundColor Yellow
Write-Host "      Database ready - API and web server starting" -ForegroundColor Green
Write-Host ""
Write-Host "Default Login:" -ForegroundColor Cyan
Write-Host "  Admin:   admin / PokerLeague2024!" -ForegroundColor White
Write-Host "  Players: [nickname] / Poker123!" -ForegroundColor White
Write-Host "  Example: strul / Poker123!" -ForegroundColor Gray
Write-Host ""

& .\START-ALL.ps1
