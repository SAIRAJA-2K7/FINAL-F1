/**
 * js/components/topbar.js
 * Elegant FIA broadcast style ribbon, avoiding terminal brackets.
 */
import { state } from '../core/state.js';
import { events } from '../core/event-bus.js';

export class TopBar {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        if (!this.container) return;
        this.render();
        this.bindEvents();
    }

    bindEvents() {
        events.on('statusChanged', () => this.updateStatus());
        events.on('weatherUpdated', () => this.updateWeather());
        setInterval(() => this.updateClock(), 1000);
    }

    updateStatus() {
        const statusEl = this.container.querySelector('.tb-status');
        if (statusEl) {
            statusEl.textContent = `STATUS: ${state.status.replace('_', ' ')}`;
        }
    }

    updateWeather() {
        const weatherEl = this.container.querySelector('.tb-weather');
        if (weatherEl) {
            weatherEl.textContent = `AIR ${state.weather.airTemp}° TRACK ${state.weather.trackTemp}°`;
        }
    }

    updateClock() {
        const localEl = this.container.querySelector('.tb-local');
        const utcEl = this.container.querySelector('.tb-utc');
        if (localEl && utcEl) {
            const now = new Date();
            localEl.textContent = `LOCAL ${now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}`;
            utcEl.textContent = `UTC ${now.toISOString().substring(11, 16)}`;
        }
    }

    render() {
        const page = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
        const isTelemetry = page === 'telemetry';
        const isHome = page === 'index' || page === '';

        this.container.innerHTML = `
            <div class="topbar-ribbon">
                <div class="topbar-meta">
                    <span class="meta-label" style="color: var(--live-red)">LIVE SESSION — ${state.currentSession || 'FP2'}</span>
                    <span class="meta-label" style="color: var(--border-soft); margin: 0 var(--space-1)">|</span>
                    <span class="meta-label tb-status">STATUS: ${state.status.replace('_', ' ')}</span>
                    <span class="meta-label" style="color: var(--border-soft); margin: 0 var(--space-1)">|</span>
                    <span class="meta-label tb-weather">AIR --° TRACK --°</span>
                    <span class="meta-label" style="color: var(--border-soft); margin: 0 var(--space-1)">|</span>
                    <span class="timing-number tb-local" style="font-size: 0.8125rem">LOCAL --:--</span>
                    <span class="meta-label" style="color: var(--border-soft); margin: 0 var(--space-1)">|</span>
                    <span class="timing-number tb-utc" style="font-size: 0.8125rem; color: var(--ink-3)">UTC --:--</span>
                </div>
                <div class="topbar-actions">
                    <a href="./index.html" class="topbar-pill ${isHome ? 'active' : ''}">Overview</a>
                    <a href="./telemetry.html" class="topbar-pill ${isTelemetry ? 'active' : ''}">Telemetry</a>
                </div>
            </div>
        `;
        this.updateStatus();
        this.updateWeather();
        this.updateClock();
    }
}
