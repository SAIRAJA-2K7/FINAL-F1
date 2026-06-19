import { createWebSocketClient } from '../hooks/websocket-hook.js';
import { createLineChart, createSteppedChart, updateChart } from '../charts/chart-factory.js';
import { normalizeTelemetryFrame, getDriverTimeline, buildTrackBounds, getPrimaryDriverSeries, formatSessionStatus } from '../utils/telemetry-helpers.js';

const DEFAULT_SOCKET = 'ws://127.0.0.1:8765/telemetry';

export class TelemetryDashboard {
    constructor() {
        this.frameHistory = [];
        this.maxHistory = 48;
        this.stream = createWebSocketClient({
            url: DEFAULT_SOCKET,
            onOpen: () => this.onStreamOpen(),
            onMessage: payload => this.onTelemetryFrame(payload),
            onError: error => this.onStreamError(error),
            onClose: () => this.onStreamClose()
        });
        this.statusEl = document.getElementById('stream-status');
        this.speedChart = this.buildSpeedChart();
        this.powerChart = this.buildPowerChart();
        this.gearChart = this.buildGearChart();
        this.compareChart = this.buildComparisonChart();
        this.trackMapCanvas = document.getElementById('track-map');
        this.summaryList = document.getElementById('driver-summary');
        this.controls = document.querySelectorAll('[data-control]');
        this.sessionRows = document.getElementById('session-metrics');
        this.noDataOverlay = document.getElementById('no-telemetry-overlay');

        this.bindControls();
        this.stream.connect();
        this.setStatus('Connecting…');
    }

    bindControls() {
        this.controls.forEach(button => {
            button.addEventListener('click', () => {
                const action = button.dataset.control;
                this.handleControl(action);
            });
        });
    }

    handleControl(action) {
        if (action === 'refresh') {
            this.setStatus('Reconnecting…');
            this.stream.connect();
            return;
        }

        const controlStatus = document.getElementById('control-state');
        controlStatus.textContent = action === 'pause' ? 'Paused' : action === 'resume' ? 'Live' : `${action.toUpperCase()}x`;
    }

    onStreamOpen() {
        this.setStatus('Live feed active');
        this.noDataOverlay?.classList.add('hidden');
    }

    onStreamError(error) {
        this.setStatus('Stream unavailable');
        console.warn('Telemetry stream error', error);
    }

    onStreamClose() {
        this.setStatus('Disconnected');
    }

    onTelemetryFrame(rawFrame) {
        const frame = normalizeTelemetryFrame(rawFrame);
        this.frameHistory.push(frame);
        if (this.frameHistory.length > this.maxHistory) {
            this.frameHistory.shift();
        }
        this.renderFrame(frame);
    }

    renderFrame(frame) {
        this.updateSessionBanner(frame);
        this.updateDriverCards(frame);
        this.updateCharts(frame);
        this.paintTrackMap(frame);
    }

    updateSessionBanner(frame) {
        document.getElementById('event-lap').textContent = `Lap ${frame.lap}`;
        document.getElementById('event-leader').textContent = frame.leader;
        document.getElementById('event-speed').textContent = `${Math.round(frame.drivers[0]?.speed ?? 0)} km/h`;
        document.getElementById('event-status').textContent = formatSessionStatus(frame);
    }

    updateDriverCards(frame) {
        if (!this.summaryList) return;
        this.summaryList.innerHTML = '';
        getPrimaryDriverSeries(frame, 3).forEach(driver => {
            const item = document.createElement('li');
            item.className = 'telemetry-driver-item';
            item.innerHTML = `
                <span class="meta-label">${driver.code}</span>
                <div class="telemetry-driver-stats">
                    <span>${Math.round(driver.speed)} km/h</span>
                    <span>G${driver.gear}</span>
                </div>`;
            this.summaryList.appendChild(item);
        });
    }

    updateCharts(frame) {
        const labels = this.frameHistory.map(item => item.timestamp.toFixed ? item.timestamp.toFixed(1) : item.timestamp);
        const speedData = this.frameHistory.map(item => item.drivers[0]?.speed ?? 0);
        const throttleData = this.frameHistory.map(item => item.drivers[0]?.throttle ?? 0);
        const brakeData = this.frameHistory.map(item => item.drivers[0]?.brake ?? 0);
        const gearData = this.frameHistory.map(item => item.drivers[0]?.gear ?? item.drivers[0]?.n_gear ?? 0);

        updateChart(this.speedChart, labels, [{ index: 0, data: speedData }]);
        updateChart(this.powerChart, labels, [
            { index: 0, data: throttleData },
            { index: 1, data: brakeData }
        ]);
        updateChart(this.gearChart, labels, [{ index: 0, data: gearData }]);

        const driverLabels = this.frameHistory.map((item, index) => `${index + 1}`);
        const datasets = frame.drivers.slice(0, 2).map((driver, index) => ({
            index,
            data: this.frameHistory.map(history => {
                const match = history.drivers.find(d => d.code === driver.code);
                return match?.speed ?? 0;
            })
        }));
        updateChart(this.compareChart, driverLabels, datasets);
    }

    buildSpeedChart() {
        const canvas = document.getElementById('speed-trace');
        return createLineChart(canvas, {
            labels: [],
            datasets: [{
                label: 'Speed',
                data: [],
                borderColor: 'rgba(55, 113, 198, 0.92)',
                backgroundColor: 'rgba(55, 113, 198, 0.15)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true,
                tension: 0.3
            }]
        });
    }

    buildPowerChart() {
        const canvas = document.getElementById('power-bands');
        return createLineChart(canvas, {
            labels: [],
            datasets: [
                {
                    label: 'Throttle',
                    data: [],
                    borderColor: 'rgba(212, 160, 23, 0.9)',
                    backgroundColor: 'rgba(212, 160, 23, 0.18)',
                    borderWidth: 1.5,
                    pointRadius: 0,
                    tension: 0.35
                },
                {
                    label: 'Brake',
                    data: [],
                    borderColor: 'rgba(232, 0, 45, 0.9)',
                    backgroundColor: 'rgba(232, 0, 45, 0.14)',
                    borderWidth: 1.5,
                    pointRadius: 0,
                    tension: 0.35
                }
            ]
        });
    }

    buildGearChart() {
        const canvas = document.getElementById('gear-stream');
        return createSteppedChart(canvas, {
            labels: [],
            datasets: [{
                label: 'Gear',
                data: [],
                borderColor: 'rgba(242,236,224,0.92)',
                backgroundColor: 'rgba(242,236,224,0.15)',
                borderWidth: 2,
                pointRadius: 0,
                fill: true
            }]
        });
    }

    buildComparisonChart() {
        const canvas = document.getElementById('driver-comparison');
        return createLineChart(canvas, {
            labels: [],
            datasets: [
                {
                    label: 'Lead',
                    data: [],
                    borderColor: 'rgba(55, 113, 198, 0.9)',
                    borderWidth: 1.75,
                    pointRadius: 0,
                    tension: 0.35
                },
                {
                    label: 'Chaser',
                    data: [],
                    borderColor: 'rgba(212,160,23,0.9)',
                    borderWidth: 1.75,
                    pointRadius: 0,
                    tension: 0.35
                }
            ]
        });
    }

    paintTrackMap(frame) {
        const canvas = this.trackMapCanvas;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        ctx.clearRect(0, 0, width, height);
        ctx.fillStyle = 'rgba(242,236,224,0.98)';
        ctx.fillRect(0, 0, width, height);

        const drivers = getDriverTimeline(frame);
        const bounds = buildTrackBounds(drivers);
        const margin = 18;
        const scaleX = (width - margin * 2) / Math.max(1, bounds.maxX - bounds.minX);
        const scaleY = (height - margin * 2) / Math.max(1, bounds.maxY - bounds.minY);
        const scale = Math.min(scaleX, scaleY);

        const normalize = (value, min) => (value - min) * scale + margin;
        drivers.forEach(driver => {
            const x = normalize(driver.x, bounds.minX);
            const y = height - normalize(driver.y, bounds.minY);
            ctx.beginPath();
            ctx.arc(x, y, driver.position === 1 ? 6.5 : 4.5, 0, Math.PI * 2);
            ctx.fillStyle = driver.position === 1 ? 'rgba(55,113,198,0.98)' : 'rgba(10,10,10,0.88)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(242,236,224,0.85)';
            ctx.lineWidth = 1.25;
            ctx.stroke();
        });

        const safetyCar = frame.raw?.frame?.safety_car;
        if (safetyCar && safetyCar.x != null && safetyCar.y != null) {
            const scx = normalize(safetyCar.x, bounds.minX);
            const scy = height - normalize(safetyCar.y, bounds.minY);
            ctx.beginPath();
            ctx.arc(scx, scy, 10, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(255, 172, 10, 0.18)';
            ctx.fill();
            ctx.strokeStyle = 'rgba(255, 172, 10, 0.9)';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }

    setStatus(text) {
        if (this.statusEl) this.statusEl.textContent = text;
    }
}
