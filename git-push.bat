@echo off
echo Running Git Push Script for MindForUPublic
echo ==========================================

echo.
echo Checking current status...
git status

echo.
echo Adding all files except those in .gitignore...
git add .

echo.
echo Committing changes...
set /p commit_msg="Enter commit message (or press Enter for default message): "
if "%commit_msg%"=="" (
  git commit -m "Default commit message"
) else (
  git commit -m "%commit_msg%"
)

echo.
set /p confirm="Are you sure you want to push to origin? (Y/N): "
if /i "%confirm%"=="Y" (
  echo Pushing to origin...
  git push -u origin main
) else (
  echo Push canceled.
  exit /b 1
)

echo.
echo Done!
echo ==========================================
