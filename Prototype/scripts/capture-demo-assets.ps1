param(
  [string]$BaseUrl = "http://127.0.0.1:4173",
  [string]$OutputDir = "c:\Users\DELL\yeti-login\DriveMate\Prototype\docs\assets"
)

$browserCandidates = @(
  "C:\Program Files\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
  "C:\Program Files\Google\Chrome\Application\chrome.exe",
  "C:\Program Files (x86)\Google\Chrome\Application\chrome.exe"
)

$browserPath = $browserCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1

if (-not $browserPath) {
  Write-Error "No supported Chromium browser found. Install Edge or Chrome, then rerun npm run capture:assets."
  exit 1
}

New-Item -ItemType Directory -Force -Path $OutputDir | Out-Null

$targets = @(
  @{ Name = "home-hero"; Url = "$BaseUrl/?tab=home&scenario=fuel-hike" },
  @{ Name = "routes-hero"; Url = "$BaseUrl/?tab=routes&scenario=fuel-hike" },
  @{ Name = "assistant-hero"; Url = "$BaseUrl/?tab=assistant&scenario=fuel-hike" },
  @{ Name = "wallet-hero"; Url = "$BaseUrl/?tab=wallet&scenario=fuel-hike" },
  @{ Name = "home-fallback"; Url = "$BaseUrl/?tab=home&scenario=fallback" }
)

foreach ($target in $targets) {
  $outputPath = Join-Path $OutputDir "$($target.Name).png"
  & $browserPath `
    --headless `
    --disable-gpu `
    --window-size=430,932 `
    --run-all-compositor-stages-before-draw `
    --virtual-time-budget=3000 `
    --screenshot=$outputPath `
    $target.Url | Out-Null

  Write-Host "Captured $outputPath"
}
