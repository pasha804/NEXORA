from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from common.database import get_db
from common.models import User, UserPresence
import auth as auth_module
import schemas

router = APIRouter(prefix="/presence", tags=["Presence"])

@router.get("/{user_id}", response_model=schemas.PresenceResponse)
async def get_user_presence(
    user_id: int,
    db: Session = Depends(get_db)
):
    presence = db.query(UserPresence).filter(UserPresence.user_id == user_id).first()
    
    if not presence:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            return {"user_id": user_id, "is_online": False, "last_seen": None}
        
        return {
            "user_id": user_id,
            "is_online": user.online_status == "online",
            "last_seen": user.last_seen
        }
    
    return presence

@router.post("/online")
async def set_online(
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    current_user.online_status = "online"
    
    presence = db.query(UserPresence).filter(UserPresence.user_id == current_user.id).first()
    if not presence:
        presence = UserPresence(user_id=current_user.id, is_online=True)
        db.add(presence)
    else:
        presence.is_online = True
        presence.last_seen = datetime.utcnow()
    
    db.commit()
    return {"status": "online"}

@router.post("/offline")
async def set_offline(
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    current_user.online_status = "offline"
    
    presence = db.query(UserPresence).filter(UserPresence.user_id == current_user.id).first()
    if presence:
        presence.is_online = False
        presence.last_seen = datetime.utcnow()
    
    db.commit()
    return {"status": "offline"}

@router.post("/away")
async def set_away(
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    current_user.online_status = "away"
    db.commit()
    return {"status": "away"}
