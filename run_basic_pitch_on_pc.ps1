# Run inside the new experiment branch checkout (not main).
$ErrorActionPreference = 'Stop'
$root = $PSScriptRoot
Set-Location $root
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'Node.js/npm not found. Install Node.js LTS and reopen PowerShell.' }
if (-not (Get-Command python -ErrorAction SilentlyContinue)) { throw 'Python not found. Install Python 3 or use py -m http.server 8000.' }
Write-Host 'Installing local browser model dependencies (first run needs internet)…'
& npm install
if ($LASTEXITCODE -ne 0) { throw 'npm install failed' }
& npm run basic-pitch:build
if ($LASTEXITCODE -ne 0) { throw 'Basic Pitch build failed' }
Write-Host 'Open http://127.0.0.1:8000/ then open the audio analyzer.'
Write-Host 'On a recording, run the regular analyzer, then press Try neural microtonal detection.'
& python -m http.server 8000 --bind 127.0.0.1
