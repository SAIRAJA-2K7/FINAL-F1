/**
 * js/core/event-bus.js
 * Centralized Event Bus for decoupled module communication.
 */
class EventBus {
    constructor() {
        this.listeners = {};
    }

    on(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    off(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    }

    emit(event, payload = null) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => {
            try {
                callback(payload);
            } catch (err) {
                console.error(`Error in event listener for ${event}:`, err);
            }
        });
    }
}

export const events = new EventBus();
