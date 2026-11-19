@echo off
cd /d "%~dp0"
start "" /min node server.js
timeout /t 1 /nobreak >nul
start "" chrome --app=http://localhost:4777 --window-size=480,720 --window-position=40,40
