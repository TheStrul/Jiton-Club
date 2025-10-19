# Jiton Poker League - Complete System Launcher
# Starts both Backend API and Frontend Server

$Host.UI.RawUI.WindowTitle = "Jiton Poker - System Launcher"

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  Jiton Poker League - Complete System Launcher" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Check if backend is already running
Write-Host "[1/2] Checking Backend API..." -ForegroundColor Yellow
try {
    $backendCheck = Invoke-RestMethod -Uri "http://localhost:7071/api/players/active" -TimeoutSec 3 -ErrorAction Stop
    Write-Host "      Backend is already running ($($backendCheck.Count) players available)" -ForegroundColor Green
    $backendRunning = $true
} catch {
    Write-Host "      Backend is not running" -ForegroundColor Gray
    $backendRunning = $false
}

# Start backend if not running
if (-not $backendRunning) {
    Write-Host "      Starting Backend API in new window..." -ForegroundColor Cyan
    
    $apiPath = Join-Path $PSScriptRoot "api\PokerLeague.Api"
    $apiCommand = "cd '$apiPath'; Write-Host 'Starting Azure Functions...' -ForegroundColor Cyan; func start"
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $apiCommand
    
    Write-Host "      Waiting 10 seconds for backend to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
} else {
    Write-Host "      Backend: Already running" -ForegroundColor Green
}

Write-Host ""

# Check if frontend is already running
Write-Host "[2/2] Checking Frontend Server..." -ForegroundColor Yellow
try {
    $frontendCheck = Invoke-WebRequest -Uri "http://localhost:8000" -Method HEAD -TimeoutSec 3 -ErrorAction Stop
    Write-Host "      Frontend is already running" -ForegroundColor Green
    $frontendRunning = $true
} catch {
    Write-Host "      Frontend is not running" -ForegroundColor Gray
    $frontendRunning = $false
}

# Start frontend if not running
if (-not $frontendRunning) {
    Write-Host "      Starting Frontend Server using START-FRONTEND.ps1..." -ForegroundColor Cyan
    
    # Use START-FRONTEND.ps1 instead of duplicating code
    $frontendScript = Join-Path $PSScriptRoot "START-FRONTEND.ps1"
    Start-Process powershell -ArgumentList "-NoExit", "-File", "`"$frontendScript`""
    
    Write-Host "      Waiting 3 seconds for frontend to start..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
} else {
    Write-Host "      Frontend: Already running" -ForegroundColor Green
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Gray
Write-Host ""

# Final status check
Write-Host "System Status:" -ForegroundColor Cyan
Write-Host ""

# Check backend again
try {
    $api = Invoke-RestMethod -Uri "http://localhost:7071/api/players/active" -TimeoutSec 5
    Write-Host "   Backend API:    http://localhost:7071 ($($api.Count) players)" -ForegroundColor Green
} catch {
    Write-Host "   Backend API:    OFFLINE - Check the Functions terminal" -ForegroundColor Red
}

# Check frontend again
try {
    $web = Invoke-WebRequest -Uri "http://localhost:8000" -Method HEAD -TimeoutSec 3
    Write-Host "   Frontend:       http://localhost:8000" -ForegroundColor Green
} catch {
    Write-Host "   Frontend:       OFFLINE - Check the web server terminal" -ForegroundColor Red
}

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Gray
Write-Host ""

# Open browser to login page
Write-Host "Opening browser to login page..." -ForegroundColor Cyan
Start-Sleep -Seconds 1
Start-Process "http://localhost:8000/login.html"

Write-Host ""
Write-Host "System ready!" -ForegroundColor Green
Write-Host ""
Write-Host "Quick Links:" -ForegroundColor Cyan
Write-Host "   Login:          http://localhost:8000/login.html" -ForegroundColor White
Write-Host "   Menu:           http://localhost:8000/menu.html" -ForegroundColor White
Write-Host "   Game Recorder:  http://localhost:8000/easy-game-recorder.html" -ForegroundColor White
Write-Host "   API:            http://localhost:7071/api" -ForegroundColor White
Write-Host ""
Write-Host "Default Login:" -ForegroundColor Yellow
Write-Host "   Username: admin" -ForegroundColor White
Write-Host "   Password: PokerLeague2024!" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this launcher..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
