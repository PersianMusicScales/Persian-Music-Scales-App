@echo off
setlocal
cd /d "%~dp0"
echo.
echo ===============================================
echo  Persian Music Scales - Local Avaz Diagnostics
echo ===============================================
echo.
if not exist "tools\local_diagnostics_server.py" (
  echo ERROR: Could not find tools\local_diagnostics_server.py
  echo Extract the complete PR #37 ZIP, then run this file again.
  pause
  exit /b 1
)
where py >nul 2>nul
if not errorlevel 1 (
  py tools\local_diagnostics_server.py
  goto finish
)
where python >nul 2>nul
if not errorlevel 1 (
  python tools\local_diagnostics_server.py
  goto finish
)
echo ERROR: Python was not found.
echo Install Python or verify that it is available in PATH.
:finish
echo.
echo Local diagnostic program has stopped.
pause
