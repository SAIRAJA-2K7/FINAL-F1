# F1 Insights Complete System Launcher
# Starts race replay, telemetry proxy, local server, and opens dashboards.

param(
    [switch]$Stop,
    [switch]$Restart
)

$baseDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$replayDir = Join-Path $baseDir "f1-race-replay"
$mainVenvPy = Join-Path $baseDir ".venv\Scripts\python.exe"
$replayVenvPy = Join-Path $replayDir ".venv\Scripts\python.exe"
$replayMain = Join-Path $replayDir "main.py"
$proxyMain = Join-Path $baseDir "telemetry\proxy.py"

function Get-F1ManagedProcesses {
    $targets = @(
        "main.py --telemetry",
        "telemetry\proxy.py",
        "-m http.server 8000"
    )

    Get-CimInstance Win32_Process -ErrorAction SilentlyContinue | Where-Object {
        $cmd = $_.CommandLine
        if (-not $cmd) { return $false }

        foreach ($target in $targets) {
            if ($cmd -like "*$target*") {
                return $true
            }
        }
        return $false
    }
}

function Stop-F1System {
    Write-Host "Stopping F1 Insights system..." -ForegroundColor Yellow
    $managed = Get-F1ManagedProcesses

    if (-not $managed) {
        Write-Host "No managed F1 processes found." -ForegroundColor DarkYellow
        return
    }

    foreach ($proc in $managed) {
        try {
            Stop-Process -Id $proc.ProcessId -Force -ErrorAction Stop
            Write-Host "Stopped PID $($proc.ProcessId)" -ForegroundColor Green
        } catch {
            Write-Host "Could not stop PID $($proc.ProcessId): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

function Start-F1System {
    Write-Host "Starting F1 Insights complete system..." -ForegroundColor Green

    if (-not (Test-Path $replayVenvPy)) {
        throw "Missing replay Python at $replayVenvPy"
    }
    if (-not (Test-Path $mainVenvPy)) {
        throw "Missing main Python at $mainVenvPy"
    }

    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "& '$replayVenvPy' '$replayMain' --telemetry"
    ) | Out-Null
    Start-Sleep -Seconds 4

    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "& '$mainVenvPy' '$proxyMain'"
    ) | Out-Null
    Start-Sleep -Seconds 2

    Start-Process powershell -ArgumentList @(
        "-NoExit",
        "-Command",
        "Set-Location '$baseDir'; & '$mainVenvPy' -m http.server 8000"
    ) | Out-Null
    Start-Sleep -Seconds 1

    Start-Process "http://localhost:8000/f1-personalized.html"
    Start-Process "http://localhost:8000/telemetry.html"

    Write-Host "F1 dashboards opened." -ForegroundColor Green
    Write-Host "Use '.\f1-insights.ps1 -Stop' to stop all managed processes." -ForegroundColor Cyan
}

if ($Stop) {
    Stop-F1System
    exit 0
}

if ($Restart) {
    Stop-F1System
    Start-Sleep -Seconds 1
    Start-F1System
    exit 0
}

$running = Get-F1ManagedProcesses
if ($running) {
    Write-Host "F1 services already running. Reopening dashboards..." -ForegroundColor DarkYellow
    Start-Process "http://localhost:8000/f1-personalized.html"
    Start-Process "http://localhost:8000/telemetry.html"
} else {
    Start-F1System
}
