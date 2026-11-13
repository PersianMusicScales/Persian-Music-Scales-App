param(
    [ValidateSet('freeze','final-test','serve','status')]
    [string]$Action = 'status',
    [string]$Root = "$HOME\Desktop\Scale detection"
)
$ErrorActionPreference = 'Stop'
$python = Join-Path $Root 'radif_discovery_lab\.venv\Scripts\python.exe'
$script = Join-Path $PSScriptRoot 'radif_release.py'
if (!(Test-Path $python)) { throw "Python environment not found: $python" }
& $python $script $Action --root $Root
if ($LASTEXITCODE -ne 0) { throw "Action $Action failed, Python exit code $LASTEXITCODE" }