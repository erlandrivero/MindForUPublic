@echo off
REM Automatically start the Flask backend server
cd /d "%~dp0"
set FLASK_APP=src/main.py
python -m flask run
