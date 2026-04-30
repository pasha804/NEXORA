from celery import Celery
import os

# Get Redis connection from environment
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

# Initialize Celery app
celery_app = Celery(
    "nexora_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL
)

# Optional configuration
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    timezone="UTC",
    enable_utc=True,
)

# Tasks registration (usually done via imports in each service)
# celery_app.autodiscover_tasks(['services.notifications', 'services.gamification'])
