# Jiton Poker League - Frontend Server Launcher
# Run this script to start the web server with automatic browser opening

$Host.UI.RawUI.WindowTitle = "Jiton Poker - Frontend Server"

Write-Host ""
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "  Jiton Poker League - Frontend Server" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host ""

# Change to web directory
$webDir = Join-Path $PSScriptRoot "web"
Set-Location $webDir

Write-Host "Working Directory: $webDir" -ForegroundColor Yellow
Write-Host ""
Write-Host "Starting Python web server..." -ForegroundColor Green
Write-Host ""
Write-Host "   Server URL: http://localhost:8000" -ForegroundColor White
Write-Host ""
Write-Host "   Available Pages:" -ForegroundColor Cyan
Write-Host "   - Login:         http://localhost:8000/login.html" -ForegroundColor Gray
Write-Host "   - Main Menu:     http://localhost:8000/menu.html" -ForegroundColor Gray
Write-Host "   - Game Recorder: http://localhost:8000/easy-game-recorder.html" -ForegroundColor Gray
Write-Host "   - Dashboard:     http://localhost:8000/dashboard.html" -ForegroundColor Gray
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""
Write-Host "=====================================================" -ForegroundColor Gray
Write-Host ""

# Wait a moment then open browser
Start-Sleep -Seconds 2
Start-Process "http://localhost:8000/login.html"

# Start the server (server.py handles UTF-8 encoding properly)
python server.py
