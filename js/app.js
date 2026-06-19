/**
 * js/app.js
 * Main entry point for Elite F1 Command Center
 */
import { Dashboard } from './core/orchestrator.js';
import { state } from './core/state.js';
import { events } from './core/event-bus.js';
import { createSessionCard, createRaceControlAlert } from './components/factory.js';

document.addEventListener('DOMContentLoaded', () => {
    
    Dashboard.init().catch(err => {
        console.error("Critical Failure during Dashboard Initialization:", err);
    });

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            events.emit('systemPause');
        } else {
            events.emit('systemResume');
        }
    });

    // Populate editorial modules once dashboard is ready
    events.on('dashboardReady', () => {
        // Populate Practice Cards
        const practiceCards = document.getElementById('practice-cards');
        if (practiceCards) {
            const fp1 = createSessionCard({ id: 'fp1', name: 'Practice 1', status: 'FINISHED' });
            const fp2 = createSessionCard({ id: 'fp2', name: 'Practice 2', status: 'LIVE' });
            practiceCards.appendChild(fp1);
            practiceCards.appendChild(fp2);
        }

        // Populate Race Control Feed
        const rcFeed = document.getElementById('rc-feed');
        if (rcFeed) {
            const alert1 = createRaceControlAlert({ type: 'YELLOW SECTOR 1', message: 'DEBRIS REPORTED' });
            const alert2 = createRaceControlAlert({ type: 'INVESTIGATION', message: 'CAR 81 TRACK LIMITS' });
            rcFeed.appendChild(alert1);
            rcFeed.appendChild(alert2);
        }
    });
});
