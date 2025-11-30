@echo off
echo Starting application in development mode...
echo Client will be at:
echo   - Local:   http://localhost:8080
echo   - Network: http://%COMPUTERNAME%:8080
echo Server will be at http://localhost:3000
call npm run dev
