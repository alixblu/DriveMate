$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$prototypeRoot = (Resolve-Path (Join-Path $scriptRoot '..')).Path
$repoRoot = (Resolve-Path (Join-Path $prototypeRoot '..')).Path
$pythonExe = Join-Path $repoRoot '.venv\Scripts\python.exe'
$timesfmUrl = 'http://127.0.0.1:8008'
$assistantUrl = 'http://127.0.0.1:8009'
$logDir = Join-Path $repoRoot 'services_logs'

if (-not (Test-Path $pythonExe)) {
  Write-Host "Creating Python virtual environment..." -ForegroundColor Cyan
  Push-Location $repoRoot
  python -m venv .venv
  & $pythonExe -m pip install --upgrade pip
  & $pythonExe -m pip install fastapi uvicorn[standard] numpy pydantic python-dotenv torch httpx
  Pop-Location
}

if (-not (Test-Path (Join-Path $prototypeRoot 'node_modules'))) {
  Write-Host "Installing NPM dependencies in MVP folder..." -ForegroundColor Cyan
  Push-Location $prototypeRoot
  npm install
  Pop-Location
}

New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$timesfmLog = Join-Path $logDir 'timesfm.log'
$assistantLog = Join-Path $logDir 'assistant.log'
Remove-Item -LiteralPath $timesfmLog, $assistantLog -ErrorAction SilentlyContinue

$env:VITE_TIMESFM_SERVICE_URL = $timesfmUrl
$env:VITE_ASSISTANT_SERVICE_URL = $assistantUrl

Write-Host "Starting TimesFM sidecar at $timesfmUrl ..." -ForegroundColor Green
$timesfmProc = Start-Process `
  -FilePath $pythonExe `
  -ArgumentList '-m', 'uvicorn', 'timesfm_service.app:app', '--port', '8008' `
  -WorkingDirectory $repoRoot `
  -PassThru `
  -RedirectStandardError $timesfmLog

Write-Host "Starting Assistant sidecar at $assistantUrl ..." -ForegroundColor Green
$assistantProc = Start-Process `
  -FilePath $pythonExe `
  -ArgumentList '-m', 'uvicorn', 'assistant_service.app:app', '--port', '8009' `
  -WorkingDirectory $repoRoot `
  -PassThru `
  -RedirectStandardError $assistantLog

# Wait for health checks
Write-Host "Warming up services..." -ForegroundColor Yellow
$healthOk = $false
for ($attempt = 1; $attempt -le 30; $attempt += 1) {
  Start-Sleep -Seconds 1
  try {
    $tHealth = Invoke-RestMethod "$timesfmUrl/health" -TimeoutSec 1
    $aHealth = Invoke-RestMethod "$assistantUrl/health" -TimeoutSec 1
    if ($tHealth -and $aHealth) { $healthOk = $true; break }
  } catch {}
}

if ($healthOk) {
  Write-Host "All backend services reachable." -ForegroundColor Green
} else {
  Write-Warning "Some backend services are still warming up or unreachable. The frontend will use fallback data if needed."
}

Write-Host "Launching Vite dev server..." -ForegroundColor Green
Push-Location $prototypeRoot
try {
  npm run dev
} finally {
  Pop-Location
  Write-Host "Stopping background services..." -ForegroundColor Gray
  if ($timesfmProc -and -not $timesfmProc.HasExited) { Stop-Process -Id $timesfmProc.Id -Force }
  if ($assistantProc -and -not $assistantProc.HasExited) { Stop-Process -Id $assistantProc.Id -Force }
}
