from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Optional

from common.database import get_db
from common.models import CreatorMetrics, UserSocialStats, User
from pydantic import BaseModel

app = FastAPI(title="Nexora Creator Economy Service", root_path="/creator")

# --- Schemas ---
class CreatorScoreResponse(BaseModel):
    creator_id: int
    score: float
    rank: str

# --- Logic ---

def calculate_creator_score(creator_id: int, db: Session):
    metrics = db.query(CreatorMetrics).filter(CreatorMetrics.creator_id == creator_id).first()
    stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == creator_id).first()
    
    if not metrics or not stats:
        return 0.0
    
    # Formula: 
    # (Content Quality × 0.40) + (Engagement Rate × 0.25) + 
    # (Reputation Score × 0.20) + (Skill Authority × 0.15)
    
    quality = metrics.content_quality_score or 0.5
    engagement = metrics.engagement_score or 0.1
    reputation = (stats.reputation_score / 10000.0) if stats.reputation_score else 0.5
    authority = (metrics.authority_level / 100.0)
    
    score = (
        (quality * 0.40) +
        (engagement * 0.25) +
        (reputation * 0.20) +
        (authority * 0.15)
    )
    
    return score

# --- Endpoints ---

@app.get("/health")
def health():
    return {"status": "ok", "service": "creator-economy"}

@app.get("/ranking", response_model=List[dict])
def get_creator_ranking(category: Optional[str] = None, db: Session = Depends(get_db)):
    """Fetch top creators ranked by Creator Score."""
    # Simplified: get all creators and rank them
    creators = db.query(CreatorMetrics).all()
    
    ranked = []
    for m in creators:
        score = calculate_creator_score(m.creator_id, db)
        ranked.append({"creator_id": m.creator_id, "score": score})
        
    ranked.sort(key=lambda x: x["score"], reverse=True)
    return ranked[:20]

@app.get("/mentorship/suggested")
def suggest_mentors(user_id: int, skill: Optional[str] = None, db: Session = Depends(get_db)):
    """Suggest mentors based on high creator score and matching skills."""
    # Placeholder: Filter by high authority level and reputation
    mentors = db.query(CreatorMetrics).filter(CreatorMetrics.authority_level >= 50).limit(5).all()
    return mentors

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
