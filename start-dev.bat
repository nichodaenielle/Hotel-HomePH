@echo off
echo ==========================================
echo  Hotel at Home - Development Servers
echo ==========================================
echo.
echo Starting Backend (Port 4000) and Frontend (Port 3000)...
echo.
echo Press Ctrl+C in each window to stop servers
echo.
echo ==========================================
echo.

:: Start Backend Server
echo [1/2] Starting Backend Server...
cd backend
start "Backend Server - Port 4000" cmd /k "npm run dev"
cd ..

:: Wait a moment for backend to initialize
timeout /t 2 /nobreak > nul

:: Start Frontend Server
echo [2/2] Starting Frontend Server...
cd frontend
start "Frontend Server - Port 3000" cmd /k "npm run dev"
cd ..

echo.
echo ==========================================
echo  Both servers started successfully!
echo ==========================================
echo.
echo Backend:  http://localhost:4000
echo Frontend: http://localhost:3000
echo.
echo Admin Dashboard: http://localhost:4000/admin-dashboard
echo.
pause
