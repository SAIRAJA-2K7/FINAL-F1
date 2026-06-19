/**
 * js/components/telemetry.js
 * Broadcast-grade telemetry using Chart.js with optional live stream fallback.
 */
import { events } from '../core/event-bus.js';
import { createWebSocketClient } from '../../hooks/websocket-hook.js';

export class TelemetryChart {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded, cannot initialize telemetry');
            return;
        }

        this.initChart();
        events.emit('registerRenderable', { module: this, layer: 'DEFERRED' });
        this.stream = createWebSocketClient({
            url: 'ws://127.0.0.1:8765/telemetry',
            onOpen: () => this.onStreamOpen(),
            onMessage: payload => this.updateDataFromStream(payload),
            onError: error => this.onStreamError(error),
            onClose: () => this.onStreamClose()
        });
        this.stream.connect();
    }

    initChart() {
        Chart.defaults.color = 'rgba(242, 236, 224, 0.65)';
        Chart.defaults.font.family = "'JetBrains Mono', monospace";
        Chart.defaults.font.size = 10;

        this.chart = new Chart(this.canvas, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: 'Speed (km/h)',
                    data: [],
                    borderColor: 'rgba(55, 113, 198, 0.95)',
                    borderWidth: 1.5,
                    pointRadius: 0,
                    tension: 0.25,
                    fill: true,
                    backgroundColor: 'rgba(55, 113, 198, 0.14)'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                animation: false,
                interaction: {
                    mode: 'index',
                    intersect: false,
                },
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(10,10,10,0.9)',
                        titleColor: '#f2ece0',
                        bodyColor: '#f2ece0'
                    }
                },
                scales: {
                    x: {
                        display: false,
                        grid: { display: false }
                    },
                    y: {
                        display: true,
                        position: 'right',
                        grid: {
                            color: 'rgba(242, 236, 224, 0.05)',
                            drawBorder: false
                        },
                        border: { display: false },
                        ticks: {
                            maxTicksLimit: 4,
                            padding: 8,
                            color: 'rgba(242, 236, 224, 0.7)'
                        }
                    }
                }
            }
        });
    }

    onStreamOpen() {
        console.info('Telemetry stream connected');
    }

    onStreamError(error) {
        console.warn('Telemetry stream failed', error);
    }

    onStreamClose() {
        console.info('Telemetry stream disconnected');
    }

    updateDataFromStream(frame) {
        const telemetryData = Array.isArray(frame) ? frame : frame?.raw?.frame ? [frame] : [];
        if (!telemetryData.length) return;
        this.chart.data.labels = telemetryData.map(d => d.timestamp || d.frame?.t || '0.0');
        this.chart.data.datasets[0].data = telemetryData.map(d => d.speed ?? d.frame?.drivers?.[0]?.speed ?? 0);
        this.chart.update();
    }

    updateData(telemetryData) {
        if (!this.chart || !telemetryData || telemetryData.length === 0) return;

        this.chart.data.labels = telemetryData.map(d => d.timestamp);
        this.chart.data.datasets[0].data = telemetryData.map(d => d.speed);
        this.chart.update();
    }

    render(timestamp, dt) {
        // Render loop logic if lazy rendering is activated
    }
}
