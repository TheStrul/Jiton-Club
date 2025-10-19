@echo off
REM Create Desktop Shortcut for Frontend Server

echo Creating desktop shortcut...

set SCRIPT_DIR=%~dp0
set SCRIPT_DIR=%SCRIPT_DIR:~0,-1%

set SHORTCUT_PATH=%USERPROFILE%\Desktop\Jiton Poker - Frontend.lnk

powershell -Command "$WS = New-Object -ComObject WScript.Shell; $SC = $WS.CreateShortcut('%SHORTCUT_PATH%'); $SC.TargetPath = '%SCRIPT_DIR%\START-FRONTEND.bat'; $SC.WorkingDirectory = '%SCRIPT_DIR%'; $SC.IconLocation = 'C:\Windows\System32\SHELL32.dll,14'; $SC.Description = 'Start Jiton Poker League Frontend Server'; $SC.Save()"

if exist "%SHORTCUT_PATH%" (
    echo ? SUCCESS!
    echo.
    echo Desktop shortcut created:
    echo %SHORTCUT_PATH%
    echo.
    echo You can now double-click "Jiton Poker - Frontend" on your desktop
    echo to start the web server.
) else (
    echo ? FAILED to create shortcut
)

echo.
pause
