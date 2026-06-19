/**
 * js/core/state.js
 * Central Session Engine defining global state and session transitions.
 */
import { events } from './event-bus.js';

export const SESSION_STATES = {
    PRE_SESSION: 'PRE_SESSION',
    GREEN_FLAG: 'GREEN_FLAG',
    YELLOW_FLAG: 'YELLOW_FLAG',
    RED_FLAG: 'RED_FLAG',
    SAFETY_CAR: 'SAFETY_CAR',
    CHEQUERED: 'CHEQUERED',
    POST_SESSION: 'POST_SESSION'
};

class WeekendState {
    constructor() {
        this.currentRound = null;
        this.currentSession = null;
        this.nextSession = null;
        this.sessions = [];
        this.status = SESSION_STATES.PRE_SESSION;
        this.timezone = 'UTC';
        this.weather = { trackTemp: 0, airTemp: 0, rainProb: 0, humidity: 0, windSpeed: 0 };
        this.liveTiming = [];
        this.circuitInfo = {};
        this.theme = 'default';
        this.isSprint = false;
        
        // Caching
        this.loadCache();
    }

    loadCache() {
        try {
            const cached = sessionStorage.getItem('f1_weekend_state');
            if (cached) {
                const data = JSON.parse(cached);
                // Hydrate critical fields safely
                if (data.currentRound) this.currentRound = data.currentRound;
                if (data.status) this.status = data.status;
            }
        } catch (e) {
            console.warn("Failed to load state cache");
        }
    }

    saveCache() {
        try {
            sessionStorage.setItem('f1_weekend_state', JSON.stringify({
                currentRound: this.currentRound,
                status: this.status
            }));
        } catch (e) { }
    }

    updateStatus(newStatus) {
        if (this.status !== newStatus && Object.values(SESSION_STATES).includes(newStatus)) {
            const oldStatus = this.status;
            this.status = newStatus;
            this.saveCache();
            events.emit('statusChanged', { oldStatus, newStatus });
            events.emit('raceControlUpdate', { type: 'STATUS', message: `TRACK STATUS: ${newStatus.replace('_', ' ')}` });
        }
    }

    setTheme(theme) {
        this.theme = theme;
        document.documentElement.setAttribute('data-team-theme', theme);
        events.emit('themeChanged', theme);
    }

    updateWeather(weatherData) {
        this.weather = { ...this.weather, ...weatherData };
        events.emit('weatherUpdated', this.weather);
    }
}

export const state = new WeekendState();
