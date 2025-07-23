@echo off
echo ===================================================
echo ESCASHOP DEPLOYMENT TESTING SCRIPT
echo ===================================================
echo Starting servers and running comprehensive tests...
echo.

REM Kill any existing processes on ports 3000 and 5000
echo 🛑 Cleaning up existing processes...
netstat -ano | findstr :5000 > nul
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /f /pid %%a > nul 2>&1
)

netstat -ano | findstr :3000 > nul
if %errorlevel% equ 0 (
    for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a > nul 2>&1
)

echo ✅ Cleanup complete
echo.

REM Start backend server in background
echo 🚀 Starting backend server...
cd backend
start "Backend Server" cmd /c "npm run migrate:dev && npm run dev"
cd ..

echo ⏳ Waiting for backend to start...
timeout /t 15 > nul

REM Start frontend server in background
echo 🚀 Starting frontend server...
cd frontend
start "Frontend Server" cmd /c "npm start"
cd ..

echo ⏳ Waiting for frontend to start...
timeout /t 20 > nul

echo.
echo 🧪 Starting comprehensive deployment tests...
echo.

REM Run the comprehensive test suite
node comprehensive-deployment-test.js

echo.
echo 🛑 Shutting down servers...

REM Kill servers
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5000') do taskkill /f /pid %%a > nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000') do taskkill /f /pid %%a > nul 2>&1

echo ✅ Servers stopped
echo ===================================================
echo TESTING COMPLETE
echo ===================================================

pause
