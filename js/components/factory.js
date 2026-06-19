/**
 * js/components/factory.js
 * Programmatic generation of DOM elements maintaining the luxury editorial visual pacing.
 */

export function createSessionCard(session) {
    const card = document.createElement('div');
    // We use the light theme for standard cards to maintain the beige editorial pacing
    card.className = 'session-card';
    card.style.border = 'var(--border-soft)';
    card.style.padding = 'var(--space-3)';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.gap = 'var(--space-2)';
    
    // Using explicit semantic classes, no utility soup
    card.innerHTML = `
        <div class="flex-between border-bottom" style="padding-bottom: var(--space-1); border-color: var(--border-soft)">
            <span class="session-title">${session.name}</span>
            <span class="micro-label" style="color: ${session.status === 'LIVE' ? 'var(--live-red)' : 'var(--ink-3)'}">${session.status}</span>
        </div>
        <div class="session-countdown flex-row" style="margin-top: var(--space-2)">
            <span class="timing-number cd-d">00</span><span class="micro-label">D</span>
            <span class="timing-number cd-h">00</span><span class="micro-label">H</span>
            <span class="timing-number cd-m">00</span><span class="micro-label">M</span>
            <span class="timing-number cd-s">00</span><span class="micro-label">S</span>
        </div>
        <div class="session-leader" style="margin-top: var(--space-2)">
            <!-- Populated via telemetry/state later -->
            <span class="meta-label">P1</span>
            <span class="timing-number" style="margin-left: var(--space-1); font-size: 0.875rem">VER 1:28.450</span>
        </div>
    `;
    return card;
}

export function createRaceControlAlert(alert) {
    const el = document.createElement('div');
    el.className = `rc-alert flex-row`;
    el.style.borderBottom = 'var(--border-dark-panel)';
    el.style.padding = 'var(--space-1) 0';
    
    // In dark-panel, text color is handled by base.css overrides
    el.innerHTML = `
        <span class="micro-label" style="color: var(--yellow-flag)">[${alert.type}]</span>
        <span class="ticker-text" style="color: var(--paper-2)">${alert.message}</span>
    `;
    return el;
}

export function createDriverRow(driver) {
    const row = document.createElement('div');
    row.className = 'flex-row border-bottom';
    row.style.padding = 'var(--space-1) 0';
    row.style.borderColor = 'var(--border-dark-panel)';
    
    const teamColor = `var(--${driver.team.toLowerCase().replace(' ', '')})`;
    
    row.innerHTML = `
        <div class="timing-number" style="width: 20px; font-size: 0.875rem; color: var(--paper-2)">${driver.position}</div>
        <div class="flex-row" style="flex: 1">
            <span style="display:inline-block; width: 3px; height: 12px; background: ${teamColor}; border-radius: 2px"></span>
            <span class="meta-label" style="color: var(--paper)">${driver.code}</span>
        </div>
        <div class="timing-number" style="font-size: 0.875rem">${driver.points}</div>
    `;
    return row;
}
