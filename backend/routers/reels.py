from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from common.database import get_db
from common import models
import schemas
import auth as auth_module

router = APIRouter(
    prefix="/reels",
    tags=["reels"],
    responses={404: {"description": "Not found"}},
)

@router.get("/feed", response_model=List[schemas.Reel])
def get_feed(skip: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user: models.User = Depends(auth_module.get_current_user)):
    # Simple feed logic: Get all reels sorted by date DESC with creator joined
    reels = db.query(models.Reel).order_by(models.Reel.created_at.desc()).offset(skip).limit(limit).all()
    
    # Manually check if the current user has liked each reel
    for reel in reels:
        is_liked = db.query(models.ReelLike).filter(
            models.ReelLike.user_id == current_user.id,
            models.ReelLike.reel_id == reel.id
        ).first() is not None
        reel.is_liked = is_liked
        
    return reels

@router.post("/upload", response_model=schemas.Reel)
def upload_reel(reel: schemas.ReelCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth_module.get_current_user)):
    # In a real app, video_url would come from S3 upload (handled by frontend or separate endpoint)
    # We assume frontend passes the URL here
    db_reel = models.Reel(
        id=str(uuid.uuid4()),
        **reel.model_dump(),
        creator_id=current_user.id
    )
    db.add(db_reel)
    db.commit()
    db.refresh(db_reel)
    return db_reel

@router.post("/{reel_id}/like", response_model=bool)
def like_reel(reel_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth_module.get_current_user)):
    # Check if already liked
    existing_like = db.query(models.ReelLike).filter(models.ReelLike.user_id == current_user.id, models.ReelLike.reel_id == reel_id).first()
    
    reel = db.query(models.Reel).filter(models.Reel.id == reel_id).first()
    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")

    if existing_like:
        db.delete(existing_like)
        reel.likes_count = max(0, reel.likes_count - 1)
        liked = False
    else:
        new_like = models.ReelLike(user_id=current_user.id, reel_id=reel_id)
        db.add(new_like)
        reel.likes_count += 1
        liked = True
        
    db.commit()
    return liked
