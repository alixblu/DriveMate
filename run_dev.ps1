# DriveMate - Start Development Stack
# This script starts both backend services in separate windows and the frontend in the current window.

Write-Host "--- DriveMate AI: Starting All Services ---" -ForegroundColor Cyan

$repoRoot = $PSScriptRoot
$venvPython = Join-Path $repoRoot ".venv\Scripts\python.exe"

# 1. Check prerequisites
if (-not (Test-Path $venvPython)) {
    Write-Host "ERROR: Python virtual environment (.venv) not found!" -ForegroundColor Red
    Write-Host "Please run the setup steps first (python -m venv .venv)" -ForegroundColor Yellow
    exit 1
}

if (-not (Test-Path (Join-Path $repoRoot "MVP\node_modules"))) {
    Write-Host "Installing frontend dependencies..." -ForegroundColor Yellow
    Push-Location (Join-Path $repoRoot "MVP")
    npm install
    Pop-Location
}

# 2. Start TimesFM Service (New Window)
#    Launch from repo root using module notation so relative imports resolve correctly.
Write-Host "[1/3] Starting TimesFM Service (Port 8008)..." -ForegroundColor Green
$timesfmCmd = @"
Write-Host 'Starting TimesFM...' -ForegroundColor Cyan
`$env:PYTHONPATH = '$repoRoot'
Set-Location '$repoRoot'
& '$venvPython' -m uvicorn timesfm_service.app:app --host 127.0.0.1 --port 8008
"@
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", $timesfmCmd

# 3. Start Assistant Service (New Window)
Write-Host "[2/3] Starting Assistant Service (Port 8009)..." -ForegroundColor Green
$assistantCmd = @"
Write-Host 'Starting Assistant...' -ForegroundColor Cyan
`$env:PYTHONPATH = '$repoRoot'
Set-Location '$repoRoot'
& '$venvPython' -m uvicorn assistant_service.app:app --host 127.0.0.1 --port 8009
"@
Start-Process powershell.exe -ArgumentList "-NoExit", "-Command", $assistantCmd

# 4. Start Frontend (Current Window)
Write-Host "[3/3] Starting Frontend (Port 4173)..." -ForegroundColor Green
Push-Location (Join-Path $repoRoot "MVP")
npm run dev
Pop-Location
