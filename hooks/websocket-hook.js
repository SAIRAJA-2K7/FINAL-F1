export function createWebSocketClient({ url, onOpen, onMessage, onError, onClose }) {
    let socket = null;
    let reconnectTimer = null;
    let reconnectAttempts = 0;

    const connect = () => {
        if (socket && socket.readyState === WebSocket.OPEN) return;
        socket = new WebSocket(url);

        socket.addEventListener('open', () => {
            reconnectAttempts = 0;
            if (typeof onOpen === 'function') onOpen();
        });

        socket.addEventListener('message', event => {
            try {
                const payload = JSON.parse(event.data);
                if (typeof onMessage === 'function') onMessage(payload);
            } catch (error) {
                if (typeof onError === 'function') onError(error);
            }
        });

        socket.addEventListener('error', event => {
            if (typeof onError === 'function') onError(new Error('WebSocket connection error'));
        });

        socket.addEventListener('close', () => {
            if (typeof onClose === 'function') onClose();
            if (reconnectTimer) clearTimeout(reconnectTimer);
            reconnectAttempts += 1;
            const delay = Math.min(3000 + reconnectAttempts * 500, 9000);
            reconnectTimer = window.setTimeout(connect, delay);
        });
    };

    const send = (message) => {
        if (socket && socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify(message));
        }
    };

    const close = () => {
        if (reconnectTimer) clearTimeout(reconnectTimer);
        if (socket) socket.close();
    };

    return { connect, send, close };
}
