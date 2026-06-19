import asyncio
import json
import socket
from pathlib import Path
import websockets

TELEMETRY_TCP_HOST = '127.0.0.1'
TELEMETRY_TCP_PORT = 9999
WEBSOCKET_HOST = '127.0.0.1'
WEBSOCKET_PORT = 8765

async def websocket_handler(websocket):
    print('Client connected to telemetry websocket')
    try:
        while True:
            await asyncio.sleep(1)
    except websockets.ConnectionClosed:
        pass

async def tcp_reader(queue):
    while True:
        try:
            print(f'Connecting to telemetry source at {TELEMETRY_TCP_HOST}:{TELEMETRY_TCP_PORT}')
            reader, _ = await asyncio.open_connection(TELEMETRY_TCP_HOST, TELEMETRY_TCP_PORT)
            print('Connected to F1 Race Replay telemetry stream')
            while True:
                line = await reader.readline()
                if not line:
                    raise ConnectionError('Telemetry source closed the connection')
                try:
                    message = line.decode('utf-8').strip()
                    if message:
                        data = json.loads(message)
                        await queue.put(json.dumps(data))
                except json.JSONDecodeError:
                    continue
        except Exception as exc:
            print(f'Telemetry proxy error: {exc}')
            await asyncio.sleep(3)

async def broadcaster(queue, connected):
    while True:
        message = await queue.get()
        if connected:
            tasks = [asyncio.create_task(ws.send(message)) for ws in set(connected)]
            if tasks:
                await asyncio.gather(*tasks, return_exceptions=True)

async def main():
    connected = set()
    queue = asyncio.Queue()

    async def handler(websocket):
        connected.add(websocket)
        try:
            async for _ in websocket:
                pass
        finally:
            connected.remove(websocket)

    start_server = await websockets.serve(handler, WEBSOCKET_HOST, WEBSOCKET_PORT)
    print(f'WebSocket telemetry proxy running at ws://{WEBSOCKET_HOST}:{WEBSOCKET_PORT}/')

    await asyncio.gather(
        tcp_reader(queue),
        broadcaster(queue, connected)
    )

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print('Telemetry proxy stopped')
