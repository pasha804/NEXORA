import httpx
import os
import asyncio
from typing import Optional, Dict, Any

# Service URLs from Environment
SERVICES = {
    "auth": os.getenv("AUTH_SERVICE_URL", "http://auth_service:8000"),
    "profile": os.getenv("PROFILE_SERVICE_URL", "http://profile_service:8000"),
    "matchmaking": os.getenv("MATCHMAKING_SERVICE_URL", "http://matchmaking_service:8000"),
    "battle": os.getenv("BATTLE_ENGINE_URL", "http://battle_engine_service:8000"),
    "realtime": os.getenv("REALTIME_SERVICE_URL", "http://realtime_service:8000"),
}

async def call_service(
    service_name: str, 
    endpoint: str, 
    method: str = "GET", 
    data: Optional[Dict[str, Any]] = None, 
    headers: Optional[Dict[str, Any]] = None,
    retries: int = 3,
    timeout: float = 5.0
):
    """
    Generic internal service caller with retry logic.
    """
    base_url = SERVICES.get(service_name)
    if not base_url:
        raise ValueError(f"Service {service_name} not found in discovery.")

    url = f"{base_url}/{endpoint.lstrip('/')}"
    
    async with httpx.AsyncClient(timeout=timeout) as client:
        for attempt in range(retries):
            try:
                response = await client.request(method, url, json=data, headers=headers)
                response.raise_for_status()
                return response.json()
            except (httpx.HTTPStatusError, httpx.RequestError) as e:
                if attempt == retries - 1:
                    raise e
                await asyncio.sleep(1 * (attempt + 1)) # Exponential backoff
    
    return None
