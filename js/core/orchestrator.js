/**
 * js/core/orchestrator.js
 * Central Orchestrator managing initialization and render loops.
 */
import { state, SESSION_STATES } from './state.js';
import { events } from './event-bus.js';
// We'll import data adapters and modules later

class DashboardOrchestrator {
    constructor() {
        this.renderLayers = {
            CRITICAL: [],
            REALTIME: [],
            PASSIVE: [],
            DEFERRED: []
        };
        this.rafId = null;
        this.lastRender = 0;
    }

    async init() {
        console.log("Elite F1 Command Center Initializing...");
        
        // 1. Mount structural modules
        this.mountModules();

        // 2. Initial Data Sync
        await this.syncState();

        // 3. Start render loop
        this.startRenderLoop();
        
        events.emit('dashboardReady');
    }

    mountModules() {
        // Register modules into their render layers based on priority
        // e.g., this.renderLayers.REALTIME.push(tickerModule)
        events.on('registerRenderable', ({ module, layer }) => {
            if (this.renderLayers[layer]) {
                this.renderLayers[layer].push(module);
            }
        });
    }

    async syncState() {
        events.emit('raceControlUpdate', { type: 'SYSTEM', message: 'SYNCING HYBRID DATA...' });
        // Call data.js fetching logic here...
    }

    handleSessionTransition(newSession) {
        state.nextSession = newSession;
        events.emit('sessionTransition', newSession);
    }

    startRenderLoop() {
        const loop = (timestamp) => {
            const dt = timestamp - this.lastRender;
            
            // Execute CRITICAL immediately (countdowns)
            this.renderLayers.CRITICAL.forEach(m => m.render(timestamp, dt));

            // Execute REALTIME at approx 120ms intervals (~8fps for telemetry/tickers so it feels mechanical but not resource intensive)
            if (dt > 120) {
                this.renderLayers.REALTIME.forEach(m => m.render(timestamp, dt));
                this.lastRender = timestamp;
            }
            
            // Execute PASSIVE via intervals outside of strict RAF if needed, but we can call it here less frequently
            // DEFERRED relies on IntersectionObserver logic usually, not strict RAF.

            this.rafId = requestAnimationFrame(loop);
        };
        this.rafId = requestAnimationFrame(loop);
    }
}

export const Dashboard = new DashboardOrchestrator();
