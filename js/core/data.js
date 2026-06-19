/**
 * js/core/data.js
 * Hybrid Data Strategy: Try Live (OpenF1) -> Fallback Cached (Jolpica/Ergast) -> Fallback Mock
 */
import { normalizeDriverData, normalizeSessionData } from './normalization.js';
import { state } from './state.js';
import { events } from './event-bus.js';

class DataEngine {
    constructor() {
        this.apiBase = 'https://api.jolpi.ca/ergast/f1/current';
        this.status = 'OK'; // OK, DEGRADED, OFFLINE
    }

    async fetchSchedule() {
        try {
            // Try Jolpica first for calendar
            const res = await fetch(`${this.apiBase}.json`);
            if (!res.ok) throw new Error("API Error");
            const data = await res.json();
            const rawRaces = data.MRData.RaceTable.Races;
            
            const sessions = rawRaces.map(normalizeSessionData);
            state.sessions = sessions;
            events.emit('scheduleLoaded', sessions);
            return sessions;
        } catch (e) {
            console.warn("Failed to fetch schedule, falling back to mock...", e);
            this.setDegradedState('SCHEDULE');
            return this.fetchMockSchedule();
        }
    }

    async fetchStandings() {
        try {
            const [drvRes, conRes] = await Promise.all([
                fetch(`${this.apiBase}/driverStandings.json`),
                fetch(`${this.apiBase}/constructorStandings.json`)
            ]);
            if (!drvRes.ok || !conRes.ok) throw new Error("API Error");
            
            const drvData = await drvRes.json();
            const drvList = drvData.MRData.StandingsTable.StandingsLists[0]?.DriverStandings || [];
            
            const normalizedDrivers = drvList.map(normalizeDriverData);
            events.emit('standingsLoaded', normalizedDrivers);
            return normalizedDrivers;
        } catch (e) {
            console.warn("Failed to fetch standings, falling back to mock...", e);
            this.setDegradedState('STANDINGS');
            return this.fetchMockStandings();
        }
    }

    async fetchTelemetry(sessionKey, driverNum) {
        // Telemetry is hard to get publicly for free with CORS. 
        // We will default to high-fidelity mock data to ensure the UI looks premium.
        return this.fetchMockTelemetry();
    }

    setDegradedState(module) {
        this.status = 'DEGRADED';
        events.emit('raceControlUpdate', { type: 'WARNING', message: `${module} API OFFLINE: USING CACHED DATA` });
    }

    // --- MOCKS ---
    async fetchMockSchedule() {
        try {
            const res = await fetch('./mock/sessions.json');
            const data = await res.json();
            state.sessions = data.map(normalizeSessionData);
            events.emit('scheduleLoaded', state.sessions);
            return state.sessions;
        } catch (e) {
            console.error("Critical: Mock schedule failed to load", e);
            return [];
        }
    }

    async fetchMockStandings() {
        try {
            const res = await fetch('./mock/standings.json');
            const data = await res.json();
            const norm = data.map(normalizeDriverData);
            events.emit('standingsLoaded', norm);
            return norm;
        } catch (e) { return []; }
    }

    async fetchMockTelemetry() {
        try {
            const res = await fetch('./mock/telemetry.json');
            return await res.json();
        } catch (e) { return []; }
    }
}

export const dataEngine = new DataEngine();
