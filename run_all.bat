@echo off
REM Try to start backend, but do not block if it fails
start "Backend" "Interactive Demo\vapi-demo-backend\vapi-demo-backend\run_backend.bat"
REM Always start frontend
start "Frontend" "Interactive Demo\vapi-interactive-demo-frontend\vapi-interactive-demo\run_frontend.bat"
REM Wait 8 seconds for servers to start
ping 127.0.0.1 -n 8 > nul
REM Open browser to landing page
start "" http://localhost:3000
REM Script never blocks on backend errors
