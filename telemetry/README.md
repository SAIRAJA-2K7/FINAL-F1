# Telemetry Integration Proxy

This helper bridges the F1 Race Replay telemetry TCP stream to the browser.

## Setup

1. Install the proxy dependency:
   ```bash
   python -m pip install -r telemetry/requirements.txt
   ```

2. Run the F1 Race Replay telemetry stream from the cloned repository:
   ```bash
   cd f1-race-replay
   python main.py --telemetry
   ```

3. Start the browser proxy in a separate terminal:
   ```bash
   python telemetry/proxy.py
   ```

4. Serve the dashboard website from the `cloud` folder:
   ```bash
   cd c:\Users\mekas\Downloads\cloud
   python -m http.server 8000
   ```

5. Open the site in your browser:
   ```text
   http://127.0.0.1:8000/index.html
   ```

6. Use the top navigation `Telemetry` button to open the integrated telemetry page.

## Notes

- The proxy listens on `ws://127.0.0.1:8765` and forwards live telemetry to the web dashboard.
- If the stream is unavailable, the telemetry page will show the overlay and the homepage chart will simply remain in fallback mode.
