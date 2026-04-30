from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from common.database import get_db
from common.models import Post, User, UserActivity
from typing import List, Optional
import random

app = FastAPI(title="Nexora Recommendation Service", root_path="/recommendation")

@app.get("/health")
def health():
    return {"status": "ok", "service": "recommendation"}

@app.post("/rank")
def rank_posts(user_id: int, post_ids: List[int], db: Session = Depends(get_db)):
    """
    Rank a list of posts for a specific user.
    Uses:
    - User skill vector
    - Engagement history
    - Reputation score
    - Social graph
    """
    # Placeholder for AI ranking logic
    # For now, return post_ids in random order as a "ranking"
    ranked_ids = list(post_ids)
    random.shuffle(ranked_ids)
    
    return {
        "user_id": user_id,
        "ranked_post_ids": ranked_ids,
        "algorithm": "placeholder_random"
    }

@app.get("/suggested_people")
def suggest_people(user_id: int, db: Session = Depends(get_db)):
    """Suggest potential collaborators and mentors."""
    # Placeholder
    return {
        "collaborators": [],
        "mentors": []
    }
