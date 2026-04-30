from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from redis import asyncio as aioredis
import asyncio
import json
import os

app = FastAPI(root_path="/realtime")

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []
        self.redis = None

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                self.disconnect(connection)

manager = ConnectionManager()

@app.on_event("startup")
async def startup_event():
    manager.redis = await aioredis.from_url(REDIS_URL, decode_responses=True)
    asyncio.create_task(redis_listener())

async def redis_listener():
    pubsub = manager.redis.pubsub()
    await pubsub.subscribe("nexora_events")
    async for message in pubsub.listen():
        if message["type"] == "message":
            await manager.broadcast(message["data"])

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
            # Keep alive or handle upstream messages if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)
