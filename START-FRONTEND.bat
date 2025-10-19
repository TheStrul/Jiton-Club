@echo off
REM Jiton Poker League - Frontend Server Launcher
REM Double-click this file to start the web server

echo ========================================
echo  Jiton Poker League - Frontend Server
echo ========================================
echo.
echo Starting Python web server...
echo.
echo Server will start on: http://localhost:8000
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

cd /d "%~dp0web"
python server.py

pause
