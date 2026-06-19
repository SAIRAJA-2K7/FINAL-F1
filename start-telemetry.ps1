$base = Split-Path -Parent $MyInvocation.MyCommand.Path
$replayDir = Join-Path $base 'f1-race-replay'
$proxyDir = $base
$serverDir = $base

function Launch-Terminal($folder, $command) {
    Start-Process powershell -ArgumentList "-NoExit", "-Command cd '$folder'; $command"
}

Launch-Terminal $replayDir "& '.\\.venv\\Scripts\\Activate.ps1'; python .\\.venv\\Scripts\\python.exe main.py --telemetry"
Start-Sleep -Seconds 3
Launch-Terminal $proxyDir "& '.\\.venv\\Scripts\\Activate.ps1'; python telemetry/proxy.py"
Start-Sleep -Seconds 2
Launch-Terminal $serverDir "& '.\\.venv\\Scripts\\Activate.ps1'; python -m http.server 8000"
