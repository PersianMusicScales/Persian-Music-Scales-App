@echo off
setlocal
set "PYTHONUTF8=1"
set "V4_ARCHIVE="
if /i "%~x1"==".zip" goto archive
if not "%~1"=="" set "V4_RESEARCH_ROOT=%~1"
if not defined V4_RESEARCH_ROOT set "V4_RESEARCH_ROOT=%USERPROFILE%\Desktop\Scale detection"
if exist "%V4_RESEARCH_ROOT%\radif_discovery_lab\.venv\Scripts\python.exe" goto ready
goto fresh

:archive
set "V4_ARCHIVE=%~f1"
:fresh
echo Starting V4 from the KDC archive or a previously rebuilt reference.
set "V4_SETUP=%~dp0experimental\v4_comparison\windows_setup.py"
py -3 -c "import sys; sys.exit(sys.version_info[:2] < (3,10))" >nul 2>nul
if not errorlevel 1 goto runpy
python -c "import sys; sys.exit(sys.version_info[:2] < (3,10))" >nul 2>nul
if not errorlevel 1 goto runpython
echo Install 64-bit Python 3.11 or newer from python.org, then reopen this launcher.
pause
exit /b 1

:runpy
py -3 "%V4_SETUP%" "%V4_ARCHIVE%"
goto finish

:runpython
python "%V4_SETUP%" "%V4_ARCHIVE%"
goto finish

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
:finish
if not errorlevel 1 exit /b 0
echo.
echo See experimental\v4_comparison\README.md for setup and source-hash options.
pause
exit /b 1
