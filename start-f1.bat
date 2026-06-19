@echo off
cd /d "%~dp0"
powershell -ExecutionPolicy RemoteSigned -File "f1-insights.ps1" %*
