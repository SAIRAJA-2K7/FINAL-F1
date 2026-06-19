import asyncio
import websockets

async def main():
    uri = 'ws://127.0.0.1:8765/telemetry'
    try:
        async with websockets.connect(uri) as ws:
            print('connect_ok')
    except Exception as e:
        print('connect_error', e)

asyncio.run(main())
