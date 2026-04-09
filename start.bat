@echo off
echo Starting AtticRadar + Storm Grid dev environment...
echo.

:: Rebuild the AtticRadar bundle and watch for changes
start "AtticRadar - Watcher" cmd /k "cd /d %~dp0 && npm run serve"

:: Start the Node.js server (serves AtticRadar + proxies API routes)
start "AtticRadar - Server" cmd /k "cd /d %~dp0 && node server.cjs"

:: Wait a moment then open the app
timeout /t 3 >nul
start http://localhost:3333
