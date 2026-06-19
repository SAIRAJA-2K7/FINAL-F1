# F1 Insights Complete System

A comprehensive F1 telemetry and dashboard system featuring live race replay integration, real-time telemetry graphs, and luxury editorial presentation.

## 🚀 Quick Start

### Single Command Launch
```bash
# Start everything (F1 Replay + Telemetry + Server + Browsers)
.\f1-insights.ps1

# Or use the batch file (Windows)
start-f1.bat

# Best single recovery command (works whether running or stopped)
.\f1-insights.ps1 -Restart
```

### Control Commands
```bash
# Stop all systems
.\f1-insights.ps1 -Stop

# Restart everything
.\f1-insights.ps1 -Restart
```

## 📊 What Gets Started

1. **F1 Race Replay** - Main telemetry source with live race data
2. **Telemetry Proxy** - WebSocket bridge for browser access
3. **HTTP Server** - Local web server (port 8000)
4. **Personalized Dashboard** - Main F1 luxury editorial page
5. **Telemetry Dashboard** - Live graphs and race data

## 🌐 Access Points

- **Main Dashboard**: http://localhost:8000/f1-personalized.html
- **Telemetry Page**: http://localhost:8000/telemetry.html
- **WebSocket Endpoint**: ws://localhost:8765/telemetry

## 🎯 Features

- **Live Telemetry**: Real-time speed, gear, throttle/brake data
- **Interactive Graphs**: Speed traces, power bands, gear flow
- **Track Map**: Live driver positions
- **Luxury Design**: Premium beige/white F1 aesthetic
- **Auto-Update**: No page refreshes needed

## 🛠️ System Requirements

- Python 3.8+
- PySide6 (Qt for F1 Race Replay)
- WebSocket libraries
- Modern web browser

## 📁 Project Structure

```
cloud/
├── f1-insights.ps1      # Main launcher script
├── start-f1.bat         # Windows batch launcher
├── f1-personalized.html # Main dashboard
├── telemetry.html       # Telemetry page
├── telemetry/
│   └── proxy.py         # WebSocket proxy
├── styles/
│   └── telemetry.css    # Dashboard styling
└── js/
    └── telemetry-dashboard.js # Live charts
```

## 🔧 Troubleshooting

### System Won't Start
1. Ensure virtual environments are set up:
   ```bash
   # Main environment
   python -m venv .venv
   .\.venv\Scripts\activate
   pip install websockets

   # F1 Replay environment
   cd f1-race-replay
   python -m venv .venv
   .\.venv\Scripts\activate
   pip install PySide6
   ```

### Telemetry Not Updating
1. Check F1 Race Replay is running with `--telemetry` flag
2. Verify proxy is connected (check terminal output)
3. Refresh telemetry page

### Port Conflicts
- HTTP Server: Port 8000
- WebSocket Proxy: Port 8765
- Change ports in scripts if needed

## 🎮 Usage Tips

- Use the telemetry page for live race analysis
- Replay controls work with F1 Race Replay
- All data updates automatically
- Close browser tabs and run `-Stop` to clean shutdown

## 📞 Support

If issues persist:
1. Run `.\f1-insights.ps1 -Stop` to clean shutdown
2. Check terminal outputs for error messages
3. Restart with `.\f1-insights.ps1 -Restart`
