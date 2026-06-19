/**
 * js/core/normalization.js
 * Normalizes data from Ergast/Jolpica/OpenF1/Mocks into a consistent internal format.
 */

export function normalizeDriverData(raw) {
    // Assuming Jolpica/Ergast format for drivers
    if (!raw) return null;
    return {
        id: raw.Driver?.driverId || 'unknown',
        code: raw.Driver?.code || 'UNK',
        number: raw.Driver?.permanentNumber || '00',
        firstName: raw.Driver?.givenName || '',
        lastName: raw.Driver?.familyName || '',
        team: raw.Constructor?.name || 'Unknown',
        points: parseFloat(raw.points) || 0,
        position: parseInt(raw.position, 10) || 0,
        wins: parseInt(raw.wins, 10) || 0
    };
}

export function normalizeSessionData(raw) {
    if (!raw) return null;
    return {
        id: raw.round || '0',
        name: raw.raceName || 'Unknown Grand Prix',
        circuit: raw.Circuit?.circuitName || 'Unknown Circuit',
        country: raw.Circuit?.Location?.country || 'Unknown',
        city: raw.Circuit?.Location?.locality || 'Unknown',
        date: raw.date || '',
        time: raw.time || '00:00:00Z',
        // Extract practice/sprint/qualy times if available
        fp1: raw.FirstPractice ? `${raw.FirstPractice.date}T${raw.FirstPractice.time}` : null,
        fp2: raw.SecondPractice ? `${raw.SecondPractice.date}T${raw.SecondPractice.time}` : null,
        fp3: raw.ThirdPractice ? `${raw.ThirdPractice.date}T${raw.ThirdPractice.time}` : null,
        quali: raw.Qualifying ? `${raw.Qualifying.date}T${raw.Qualifying.time}` : null,
        sprint: raw.Sprint ? `${raw.Sprint.date}T${raw.Sprint.time}` : null
    };
}

export function normalizeTelemetry(raw) {
    // Expected to normalize OpenF1 or Mock arrays
    if (!Array.isArray(raw)) return [];
    return raw.map(point => ({
        timestamp: point.date || point.timestamp,
        speed: point.speed || 0,
        throttle: point.throttle || 0,
        brake: point.brake || 0,
        gear: point.n_gear || 0,
        rpm: point.rpm || 0,
        drs: point.drs || 0
    }));
}
