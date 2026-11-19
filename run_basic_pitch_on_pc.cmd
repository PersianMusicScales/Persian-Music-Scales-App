@echo off
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0run_basic_pitch_on_pc.ps1"
if errorlevel 1 pause
