export function formatDriverLabel(code, position) {
    return `${position}. ${code}`;
}

export function normalizeTelemetryFrame(frame) {
    const timestamp = frame?.frame?.t ?? frame?.timestamp ?? 0;
    const lap = frame?.frame?.lap ?? frame?.session_data?.lap ?? 0;
    const leader = frame?.frame?.drivers?.[frame?.session_data?.leader]?.position ?? null;
    const rawDrivers = frame?.frame?.drivers ?? {};
    const drivers = Object.keys(rawDrivers).map(code => ({
        code,
        ...rawDrivers[code]
    })).sort((a, b) => (a.position ?? 999) - (b.position ?? 999));

    return {
        timestamp,
        lap,
        leader: frame?.session_data?.leader ?? '---',
        playbackSpeed: frame?.playback_speed ?? 1,
        isPaused: frame?.is_paused ?? false,
        trackStatus: frame?.track_status ?? 'UNKNOWN',
        weather: frame?.frame?.weather ?? {},
        drivers,
        frameData: frame?.frame ?? {},
        raw: frame
    };
}

export function getDriverTimeline(frame) {
    return frame.drivers.map(driver => ({
        code: driver.code,
        speed: driver.speed ?? 0,
        throttle: driver.throttle ?? 0,
        brake: driver.brake ?? 0,
        gear: driver.gear ?? driver.n_gear,
        x: driver.x ?? 0,
        y: driver.y ?? 0,
        position: driver.position ?? 0
    }));
}

export function buildTrackBounds(drivers) {
    if (!drivers.length) {
        return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
    }

    return drivers.reduce((bounds, driver) => {
        const x = driver.x ?? 0;
        const y = driver.y ?? 0;
        return {
            minX: Math.min(bounds.minX, x),
            maxX: Math.max(bounds.maxX, x),
            minY: Math.min(bounds.minY, y),
            maxY: Math.max(bounds.maxY, y)
        };
    }, { minX: Infinity, maxX: -Infinity, minY: Infinity, maxY: -Infinity });
}

export function getPrimaryDriverSeries(frame, count = 2) {
    return frame.drivers.slice(0, count).map(driver => ({
        code: driver.code,
        speed: driver.speed ?? 0,
        gear: driver.gear ?? driver.n_gear,
        throttle: driver.throttle ?? 0,
        brake: driver.brake ?? 0
    }));
}

export function formatSessionStatus(frame) {
    if (!frame) return 'Awaiting data';
    const sessionStatus = frame.trackStatus;
    if (sessionStatus === '4' || sessionStatus === 'SC') return 'Safety Car';
    if (sessionStatus === '3') return 'Virtual Safety Car';
    return 'Racing';
}
