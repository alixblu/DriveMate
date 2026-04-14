$ErrorActionPreference = 'Stop'

$scriptRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$prototypeRoot = (Resolve-Path (Join-Path $scriptRoot '..')).Path
$repoRoot = (Resolve-Path (Join-Path $prototypeRoot '..')).Path
$pythonExe = Join-Path $repoRoot '.venv\Scripts\python.exe'
$serviceUrl = 'http://127.0.0.1:8008'
$logDir = Join-Path $repoRoot 'timesfm_service\.logs'
$stdoutLog = Join-Path $logDir 'uvicorn.stdout.log'
$stderrLog = Join-Path $logDir 'uvicorn.stderr.log'

if (-not (Test-Path $pythonExe)) {
  throw "Python venv not found at $pythonExe. Create it first with 'python -m venv .venv' from the repo root."
}

New-Item -ItemType Directory -Force -Path $logDir | Out-Null
Remove-Item -LiteralPath $stdoutLog, $stderrLog -ErrorAction SilentlyContinue

$env:VITE_TIMESFM_SERVICE_URL = $serviceUrl
if (-not $env:VITE_TIMESFM_TIMEOUT_MS) {
  $env:VITE_TIMESFM_TIMEOUT_MS = '12000'
}

Write-Host "Starting TimesFM sidecar at $serviceUrl ..."
$sidecar = Start-Process `
  -FilePath $pythonExe `
  -ArgumentList '-m', 'uvicorn', 'timesfm_service.app:app', '--port', '8008' `
  -WorkingDirectory $repoRoot `
  -PassThru `
  -RedirectStandardOutput $stdoutLog `
  -RedirectStandardError $stderrLog

$health = $null

for ($attempt = 1; $attempt -le 45; $attempt += 1) {
  Start-Sleep -Seconds 1

  if ($sidecar.HasExited) {
    break
  }

  try {
    $health = Invoke-RestMethod "$serviceUrl/health" -TimeoutSec 2
    break
  } catch {
  }
}

if ($health) {
  Write-Host "TimesFM sidecar reachable. Status: $($health.status)"
  Write-Host "Model load can take a short warm-up. The frontend will retry until live forecasts are ready."
} else {
  Write-Warning "TimesFM sidecar did not answer within the warm-up window. The frontend will still start and use fallback payloads if needed."

  if (Test-Path $stderrLog) {
    Write-Host "Recent sidecar logs:"
    Get-Content -LiteralPath $stderrLog -Tail 20
  }
}

Write-Host "Launching Vite dev server from $prototypeRoot ..."

Push-Location $prototypeRoot

try {
  npm run dev
} finally {
  Pop-Location

  if ($sidecar -and -not $sidecar.HasExited) {
    Write-Host "Stopping TimesFM sidecar ..."
    Stop-Process -Id $sidecar.Id -Force
  }
}
