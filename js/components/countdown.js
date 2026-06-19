/**
 * js/components/countdown.js
 * Reusable GPU-safe countdown component.
 */
import { events } from '../core/event-bus.js';

export class Countdown {
    constructor(elementId, targetDateString) {
        this.container = document.getElementById(elementId);
        if (!this.container) return;
        
        this.targetTime = new Date(targetDateString).getTime();
        this.elements = {
            d: this.container.querySelector('.cd-d'),
            h: this.container.querySelector('.cd-h'),
            m: this.container.querySelector('.cd-m'),
            s: this.container.querySelector('.cd-s')
        };
        
        // Register to CRITICAL render layer
        events.emit('registerRenderable', { module: this, layer: 'CRITICAL' });
    }

    pad(n) {
        return String(n).padStart(2, '0');
    }

    render(timestamp) {
        if (!this.container) return;
        
        const diff = this.targetTime - Date.now();
        if (diff <= 0) {
            if (this.elements.d) this.elements.d.textContent = '00';
            if (this.elements.h) this.elements.h.textContent = '00';
            if (this.elements.m) this.elements.m.textContent = '00';
            if (this.elements.s) this.elements.s.textContent = '00';
            return;
        }

        const d = this.pad(Math.floor(diff / 86400000));
        const h = this.pad(Math.floor((diff % 86400000) / 3600000));
        const m = this.pad(Math.floor((diff % 3600000) / 60000));
        const s = this.pad(Math.floor((diff % 60000) / 1000));

        // Only update DOM if changed to prevent layout thrashing
        if (this.elements.d && this.elements.d.textContent !== d) this.elements.d.textContent = d;
        if (this.elements.h && this.elements.h.textContent !== h) this.elements.h.textContent = h;
        if (this.elements.m && this.elements.m.textContent !== m) this.elements.m.textContent = m;
        if (this.elements.s && this.elements.s.textContent !== s) this.elements.s.textContent = s;
    }
}
