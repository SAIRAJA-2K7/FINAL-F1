import { TopBar } from '../js/components/topbar.js';
import { TelemetryDashboard } from '../components/telemetry-dashboard.js';

window.addEventListener('DOMContentLoaded', () => {
    new TopBar('topbar');
    new TelemetryDashboard();
});
