@echo off
REM Automatically start the Vapi Interactive Demo frontend (Next.js)
cd /d "%~dp0"
call npm run dev
