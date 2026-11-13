@echo off
cd /d "%~dp0"
title AutoCare Insight
call npm run doctor
if errorlevel 1 (
  echo.
  echo Database check failed. Check .env.local and the MySQL80 / MongoDB services.
  echo See VIVA_GUIDE.md for help.
  pause
  exit /b 1
)
echo.
echo Open the Local URL printed below in your browser. Keep this window open.
call npm run dev
pause
