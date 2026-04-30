from fastapi import FastAPI, Depends
from sqlalchemy.orm import Session
from common.database import get_db
from common.models import UserActivity, Post
from pydantic import BaseModel
from typing import Optional

app = FastAPI(title="Nexora Activity Service", root_path="/activity")

class ActivityCreate(BaseModel):
    user_id: int
    activity_type: str
    reference_id: Optional[str] = None

@app.get("/health")
def health():
    return {"status": "ok", "service": "activity"}

@app.post("/record")
def record_activity(activity: ActivityCreate, db: Session = Depends(get_db)):
    """Record a user activity and potentially update engagement counts."""
    db_activity = UserActivity(
        user_id=activity.user_id,
        activity_type=activity.activity_type,
        reference_id=activity.reference_id
    )
    db.add(db_activity)
    
    # Update post engagement if applicable
    if activity.activity_type in ["like", "comment"] and activity.reference_id:
        post = db.query(Post).filter(Post.id == int(activity.reference_id)).first()
        if post:
            if activity.activity_type == "like":
                post.likes_count += 1
            elif activity.activity_type == "comment":
                post.comments_count += 1
    
    db.commit()
    db.refresh(db_activity)
    return db_activity

@app.get("/user/{user_id}")
def get_user_activities(user_id: int, db: Session = Depends(get_db)):
    activities = db.query(UserActivity).filter(UserActivity.user_id == user_id).all()
    return activities
