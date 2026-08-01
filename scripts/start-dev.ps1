$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $projectRoot "back\db"
$frontendDir = Join-Path $projectRoot "front"

if (-not (Test-Path (Join-Path $backendDir "app\main.py"))) {
  throw "Backend entrypoint not found: $backendDir\app\main.py"
}

if (-not (Test-Path (Join-Path $frontendDir "package.json"))) {
  throw "Frontend package.json not found: $frontendDir\package.json"
}

$backendCommand = "Set-Location -LiteralPath '$backendDir'; python -m uvicorn app.main:app --reload"
$frontendCommand = "Set-Location -LiteralPath '$frontendDir'; npm.cmd run dev"

Start-Process powershell.exe -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy", "Bypass",
  "-Command", $backendCommand
) -WorkingDirectory $backendDir

Start-Sleep -Seconds 2

Start-Process powershell.exe -ArgumentList @(
  "-NoExit",
  "-ExecutionPolicy", "Bypass",
  "-Command", $frontendCommand
) -WorkingDirectory $frontendDir

Write-Host "BizMate dev servers are starting."
Write-Host "Backend:  http://localhost:8000"
Write-Host "Frontend: http://localhost:3000"
