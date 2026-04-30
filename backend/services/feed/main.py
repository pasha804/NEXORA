import os
from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from common.database import get_db
from common.models import Post, User, UserActivity
from pydantic import BaseModel
from datetime import datetime

from redis import asyncio as aioredis
import json

app = FastAPI(title="Nexora Feed Service", root_path="/feed")

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

class PostResponse(BaseModel):
    id: int
    author_id: int
    post_type: str
    content: str
    media_url: Optional[str] = None
    skill_tags: List[str] = []
    likes_count: int
    comments_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class FeedResponse(BaseModel):
    posts: List[PostResponse]
    count: int

@app.get("/health")
def health():
    return {"status": "ok", "service": "feed"}

@app.get("/", response_model=FeedResponse)
def get_feed(
    limit: int = 20,
    offset: int = 0,
    user_id: Optional[int] = None,
    db: Session = Depends(get_db)
):
    """
    Fetch the social feed. 
    In the future, this will use the AI recommendation-service to rank posts.
    """
    # Simple implementation: fetch latest posts
    query = db.query(Post).order_by(Post.created_at.desc())
    
    total = query.count()
    posts = query.offset(offset).limit(limit).all()
    
    return {
        "posts": posts,
        "count": total
    }

@app.post("/create", response_model=PostResponse)
def create_post(
    author_id: int,
    content: str,
    post_type: str = "text",
    media_url: Optional[str] = None,
    skill_tags: List[str] = [],
    db: Session = Depends(get_db)
):
    new_post = Post(
        author_id=author_id,
        content=content,
        post_type=post_type,
        media_url=media_url,
        skill_tags=skill_tags
    )
    db.add(new_post)
    db.commit()
    db.refresh(new_post)

    # Emit skill-related content event for XP and trending
    if skill_tags:
        try:
            redis = aioredis.from_url(REDIS_URL, decode_responses=True)
            payload = {
                "event": "content_created",
                "data": {
                    "user_id": author_id,
                    "skill_tags": skill_tags,
                },
            }
            # Use fire-and-forget publish (no await in sync endpoint)
            import asyncio

            asyncio.create_task(redis.publish("nexora_events", json.dumps(payload)))
        except Exception as exc:
            # Non-fatal: logging only
            print(f"[feed] failed to publish content_created event: {exc}")

    return new_post

@app.post("/{post_id}/like")
def like_post(post_id: int, user_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    
    # Check if already liked (implementing simplified version)
    post.likes_count += 1
    
    # Record activity
    activity = UserActivity(
        user_id=user_id,
        activity_type="like",
        reference_id=str(post_id)
    )
    db.add(activity)
    db.commit()
    
    return {"status": "success", "likes": post.likes_count}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
