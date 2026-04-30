from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from typing import List, Optional

from common.database import get_db
from common.models import Post, UserSocialStats, CreatorMetrics, UserActivity
from pydantic import BaseModel

app = FastAPI(title="Nexora Growth Engine", root_path="/growth")

# --- Schemas ---
class ViralityScoreResponse(BaseModel):
    post_id: int
    score: float
    breakdown: dict

# --- Logic ---

def calculate_virality_score(post_id: int, db: Session):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        return 0.0, {}
    
    # 1. Engagement Rate (35%)
    # Simplified: (likes + comments) / views (or total reach)
    likes = post.likes_count
    # comments = len(post.comments) # Assuming comments exist
    engagement_rate = (likes * 1.0) / 100 # Placeholder total impressions
    
    # 2. Skill Relevance (20%)
    # Placeholder: higher if it has trending skill tags
    skill_relevance = 0.5 
    
    # 3. Creator Reputation (15%)
    creator_stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == post.author_id).first()
    reputation = (creator_stats.reputation_score / 1000.0) if creator_stats else 0.5
    
    # 4. PvP Performance (15%)
    # Placeholder factor if the post is related to a PvP win
    pvp_perf = 0.0
    if "pvp" in post.skill_tags:
        pvp_perf = 1.0
        
    # 5. Trend Velocity (15%)
    # Engagement growth over last hour
    hour_ago = datetime.utcnow() - timedelta(hours=1)
    recent_activity = db.query(UserActivity).filter(
        UserActivity.post_id == post_id,
        UserActivity.created_at >= hour_ago
    ).count()
    trend_velocity = min(1.0, recent_activity / 50.0)
    
    score = (
        (engagement_rate * 0.35) +
        (skill_relevance * 0.20) +
        (reputation * 0.15) +
        (pvp_perf * 0.15) +
        (trend_velocity * 0.15)
    )
    
    breakdown = {
        "engagement": engagement_rate,
        "skill": skill_relevance,
        "reputation": reputation,
        "pvp": pvp_perf,
        "velocity": trend_velocity
    }
    
    return score, breakdown

# --- Endpoints ---

@app.get("/health")
def health():
    return {"status": "ok", "service": "growth-engine"}

@app.get("/score/{post_id}", response_model=ViralityScoreResponse)
def get_post_score(post_id: int, db: Session = Depends(get_db)):
    score, breakdown = calculate_virality_score(post_id, db)
    return {"post_id": post_id, "score": score, "breakdown": breakdown}

@app.get("/trending/posts")
def get_trending_posts(limit: int = 10, db: Session = Depends(get_db)):
    """Rank posts by virality score."""
    # In a real app, this would be cached in Redis
    posts = db.query(Post).order_by(Post.created_at.desc()).limit(100).all()
    
    scored_posts = []
    for post in posts:
        score, _ = calculate_virality_score(post.id, db)
        scored_posts.append({"post_id": post.id, "score": score})
        
    scored_posts.sort(key=lambda x: x["score"], reverse=True)
    return scored_posts[:limit]

@app.get("/rising_creators")
def get_rising_creators(db: Session = Depends(get_db)):
    """Identify creators whose engagement is spiking."""
    creators = db.query(CreatorMetrics).order_by(CreatorMetrics.viral_velocity.desc()).limit(5).all()
    return creators

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
