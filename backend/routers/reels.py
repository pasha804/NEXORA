from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Dict
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

def _enrich_reel(reel: models.Reel, current_user: models.User, db: Session):
    is_liked = db.query(models.ReelLike).filter(
        models.ReelLike.user_id == current_user.id,
        models.ReelLike.reel_id == reel.id
    ).first() is not None
    is_saved = db.query(models.ReelSave).filter(
        models.ReelSave.user_id == current_user.id,
        models.ReelSave.reel_id == reel.id
    ).first() is not None
    reel.is_liked = is_liked
    reel.is_saved = is_saved
    return reel

@router.get("/feed", response_model=List[schemas.Reel])
def get_feed(skip: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user: models.User = Depends(auth_module.get_current_user)):
    reels = db.query(models.Reel).order_by(models.Reel.created_at.desc()).offset(skip).limit(limit).all()
    for reel in reels:
        _enrich_reel(reel, current_user, db)
    return reels

@router.get("/user/{user_id}", response_model=List[schemas.Reel])
def get_user_reels(user_id: int, skip: int = 0, limit: int = 20, db: Session = Depends(get_db), current_user: models.User = Depends(auth_module.get_current_user)):
    reels = db.query(models.Reel).filter(models.Reel.creator_id == user_id).order_by(models.Reel.created_at.desc()).offset(skip).limit(limit).all()
    for reel in reels:
        _enrich_reel(reel, current_user, db)
    return reels

@router.get("/{reel_id}", response_model=schemas.Reel)
def get_reel(reel_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth_module.get_current_user)):
    reel = db.query(models.Reel).filter(models.Reel.id == reel_id).first()
    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")
    return _enrich_reel(reel, current_user, db)

@router.post("/upload", response_model=schemas.Reel, status_code=201)
def upload_reel(reel: schemas.ReelCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth_module.get_current_user)):
    db_reel = models.Reel(
        id=str(uuid.uuid4()),
        **reel.model_dump(),
        creator_id=current_user.id
    )
    db.add(db_reel)
    if current_user.stats:
        current_user.stats.reels_count = (current_user.stats.reels_count or 0) + 1
    db.commit()
    db.refresh(db_reel)
    return _enrich_reel(db_reel, current_user, db)

@router.post("/{reel_id}/like", response_model=Dict[str, bool])
def like_reel(reel_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth_module.get_current_user)):
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
    return {"liked": liked}

@router.post("/{reel_id}/save", response_model=Dict[str, bool])
def save_reel(reel_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth_module.get_current_user)):
    existing_save = db.query(models.ReelSave).filter(models.ReelSave.user_id == current_user.id, models.ReelSave.reel_id == reel_id).first()
    reel = db.query(models.Reel).filter(models.Reel.id == reel_id).first()
    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")
    if existing_save:
        db.delete(existing_save)
        reel.saves_count = max(0, reel.saves_count - 1)
        saved = False
    else:
        new_save = models.ReelSave(user_id=current_user.id, reel_id=reel_id)
        db.add(new_save)
        reel.saves_count += 1
        saved = True
    db.commit()
    return {"saved": saved}

@router.get("/{reel_id}/comments", response_model=List[schemas.ReelCommentResponse])
def get_comments(reel_id: str, skip: int = 0, limit: int = 50, db: Session = Depends(get_db), current_user: models.User = Depends(auth_module.get_current_user)):
    reel = db.query(models.Reel).filter(models.Reel.id == reel_id).first()
    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")
    comments = db.query(models.ReelComment).options(joinedload(models.ReelComment.user)).filter(
        models.ReelComment.reel_id == reel_id
    ).order_by(models.ReelComment.created_at.desc()).offset(skip).limit(limit).all()
    result = []
    for c in comments:
        is_liked = False
        result.append({
            "id": c.id,
            "reel_id": c.reel_id,
            "user_id": c.user_id,
            "content": c.content,
            "likes_count": c.likes_count,
            "created_at": c.created_at,
            "user": c.user,
            "is_liked": is_liked,
        })
    return result

@router.post("/{reel_id}/comments", response_model=schemas.ReelCommentResponse, status_code=201)
def create_comment(reel_id: str, comment: schemas.ReelCommentCreate, db: Session = Depends(get_db), current_user: models.User = Depends(auth_module.get_current_user)):
    reel = db.query(models.Reel).filter(models.Reel.id == reel_id).first()
    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")
    db_comment = models.ReelComment(
        reel_id=reel_id,
        user_id=current_user.id,
        content=comment.content
    )
    db.add(db_comment)
    reel.comments_count += 1
    db.commit()
    db.refresh(db_comment)
    return {
        "id": db_comment.id,
        "reel_id": db_comment.reel_id,
        "user_id": db_comment.user_id,
        "content": db_comment.content,
        "likes_count": db_comment.likes_count,
        "created_at": db_comment.created_at,
        "user": current_user,
        "is_liked": False,
    }

@router.delete("/{reel_id}", status_code=204)
def delete_reel(reel_id: str, db: Session = Depends(get_db), current_user: models.User = Depends(auth_module.get_current_user)):
    reel = db.query(models.Reel).filter(models.Reel.id == reel_id).first()
    if not reel:
        raise HTTPException(status_code=404, detail="Reel not found")
    if reel.creator_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized to delete this reel")
    db.delete(reel)
    if current_user.stats:
        current_user.stats.reels_count = max(0, (current_user.stats.reels_count or 1) - 1)
    db.commit()
