@echo off
setlocal
if not "%~1"=="" set "V4_RESEARCH_ROOT=%~1"
if not defined V4_RESEARCH_ROOT set "V4_RESEARCH_ROOT=%USERPROFILE%\Desktop\Scale detection"
if exist "%V4_RESEARCH_ROOT%\radif_discovery_lab\.venv\Scripts\python.exe" goto ready
echo Choose the existing Scale detection research folder.
set /p "V4_RESEARCH_ROOT=Folder path: "
set "V4_RESEARCH_ROOT=%V4_RESEARCH_ROOT:"=%"
if exist "%V4_RESEARCH_ROOT%\radif_discovery_lab\.venv\Scripts\python.exe" goto ready
echo The radif_discovery_lab virtual environment was not found in that folder.
pause
exit /b 1

:ready
set "V4_PYTHON=%V4_RESEARCH_ROOT%\radif_discovery_lab\.venv\Scripts\python.exe"
set "V4_COMPARE=%~dp0experimental\v4_comparison\compare_server.py"
set "V4_CACHE_ARG="
if exist "%V4_RESEARCH_ROOT%\radif_release_v1\frozen.json" goto launch
if exist "%V4_RESEARCH_ROOT%\radif_release_v1\model.joblib" goto launch
echo No existing frozen V4 model was found.
echo V4 can be rebuilt in memory from your cached development features.
echo This checks the historical V4 scores before opening the listening page.
choice /c YN /n /m "Use the development caches for this session? [Y/N] "
if errorlevel 2 exit /b 0
if errorlevel 1 set "V4_CACHE_ARG=--from-cache"

:launch
"%V4_PYTHON%" "%V4_COMPARE%" --root "%V4_RESEARCH_ROOT%" --open %V4_CACHE_ARG%
if not errorlevel 1 exit /b 0
echo.
echo See experimental\v4_comparison\README.md for setup and source-hash options.
pause
exit /b 1
