@echo off
echo Starting Flood Characteristics Prototype...
echo.

echo 1. Starting Backend Server...
cd backend
start "Backend Server" cmd /k "npm start"

echo 2. Waiting for backend to start...
timeout /t 5 /nobreak > nul

echo 3. Starting Frontend...
cd ../frontend
start "Frontend Server" cmd /k "npm run dev"

echo.
echo Prototype started successfully!
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit...
pause > nul
