from fastapi import FastAPI, Request
from sse_starlette.sse import EventSourceResponse
import asyncio
import redis.asyncio as redis
import os
import json

app = FastAPI(root_path="/notifications")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

@app.get("/health")
def health():
    return {"status": "ok", "service": "notifications"}

@app.get("/stream/{user_id}")
async def message_stream(request: Request, user_id: int):
    """
    SSE Endpoint that streams notifications to the user
    Listens to Redis Channel: 'notifications:{user_id}'
    """
    async def event_generator():
        r = redis.from_url(REDIS_URL)
        pubsub = r.pubsub()
        await pubsub.subscribe(f"notifications:{user_id}")
        
        try:
            async for message in pubsub.listen():
                if await request.is_disconnected():
                    break
                
                if message["type"] == "message":
                    yield {
                        "event": "notification",
                        "data": message["data"].decode("utf-8")
                    }
        finally:
            await r.close()

    return EventSourceResponse(event_generator())
