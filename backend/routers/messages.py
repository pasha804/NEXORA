from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import or_
from typing import List, Optional
from pydantic import BaseModel

from common.database import get_db
from common.models import User, ChatRoom, Message, Notification
import auth as auth_module
from common.social_utils import can_users_message, get_messaging_status, are_users_connected, get_user_skill_names
from common.realtime_utils import emit_realtime_notification
import schemas

router = APIRouter(prefix="/messages", tags=["Messages"])

class MessageCreate(BaseModel):
    recipient_id: int
    text: str
    message_type: str = "text"

class RoomCreate(BaseModel):
    recipient_id: int

@router.post("/room/get_or_create")
async def get_or_create_room(
    data: RoomCreate,
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    # Rule check
    if not can_users_message(db, current_user.id, data.recipient_id):
        raise HTTPException(
            status_code=403, 
            detail="You must share a skill or be connected to message this user."
        )

    # Check for existing room
    room = db.query(ChatRoom).filter(
        ((ChatRoom.user1_id == current_user.id) & (ChatRoom.user2_id == data.recipient_id)) |
        ((ChatRoom.user1_id == data.recipient_id) & (ChatRoom.user2_id == current_user.id))
    ).first()

    if not room:
        room = ChatRoom(user1_id=current_user.id, user2_id=data.recipient_id)
        db.add(room)
        db.commit()
        db.refresh(room)

    return room

@router.get("/rooms")
async def get_chat_rooms(
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    rooms = db.query(ChatRoom).filter(
        or_(ChatRoom.user1_id == current_user.id, ChatRoom.user2_id == current_user.id)
    ).order_by(ChatRoom.last_message_at.desc().nullslast()).all()
    
    results = []
    for r in rooms:
        recipient_id = r.user2_id if r.user1_id == current_user.id else r.user1_id
        recipient = db.query(User).filter(User.id == recipient_id).first()
        if not recipient:
            continue
        
        last_msg = db.query(Message).filter(Message.room_id == r.id).order_by(Message.created_at.desc()).first()
        unread = db.query(Message).filter(
            Message.room_id == r.id,
            Message.receiver_id == current_user.id,
            Message.is_read == False
        ).count()
        
        # Determine category
        if are_users_connected(db, current_user.id, recipient_id):
            category = "friends"
        elif get_user_skill_names(db, current_user.id) & get_user_skill_names(db, recipient_id):
            category = "skill-matches"
        else:
            category = "all"

        results.append({
            "room_id": r.id,
            "category": category,
            "recipient": {
                "id": recipient.id,
                "username": recipient.username,
                "display_name": recipient.display_name or recipient.username,
                "avatar_url": recipient.avatar_url,
                "online_status": getattr(recipient, "online_status", "offline")
            },
            "last_message": last_msg.message_text if last_msg else None,
            "last_message_time": last_msg.created_at.isoformat() if last_msg else None,
            "unread_count": unread
        })
        
    return results

@router.get("/{room_id}")
async def get_message_history(
    room_id: int,
    skip: int = 0,
    limit: int = 50,
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    room = db.query(ChatRoom).filter(ChatRoom.id == room_id).first()
    if not room or (room.user1_id != current_user.id and room.user2_id != current_user.id):
        raise HTTPException(status_code=404, detail="Room not found")

    messages = db.query(Message).filter(Message.room_id == room_id).order_by(Message.created_at.desc()).offset(skip).limit(limit).all()
    
    # Mark as read
    db.query(Message).filter(
        (Message.room_id == room_id) & (Message.receiver_id == current_user.id)
    ).update({"is_read": True})
    db.commit()

    return list(reversed(messages))

@router.post("/send")
async def send_message(
    data: MessageCreate,
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    # Rule check
    if not can_users_message(db, current_user.id, data.recipient_id):
        raise HTTPException(
            status_code=403, 
            detail="Forbidden: No skill overlap or connection."
        )

    # Get room
    room = db.query(ChatRoom).filter(
        ((ChatRoom.user1_id == current_user.id) & (ChatRoom.user2_id == data.recipient_id)) |
        ((ChatRoom.user1_id == data.recipient_id) & (ChatRoom.user2_id == current_user.id))
    ).first()

    if not room:
        room = ChatRoom(user1_id=current_user.id, user2_id=data.recipient_id)
        db.add(room)
        db.flush()

    new_msg = Message(
        room_id=room.id,
        sender_id=current_user.id,
        receiver_id=data.recipient_id,
        message_text=data.text,
        message_type=data.message_type
    )
    db.add(new_msg)
    
    # Notification for recipient
    notification = Notification(
        user_id=data.recipient_id,
        type="NEW_MESSAGE",
        title="New Message",
        message=f"New message from {current_user.display_name or current_user.username}",
        related_id=str(room.id)
    )
    db.add(notification)
    
    db.commit()
    db.refresh(notification)
    await emit_realtime_notification(notification)
    return new_msg

@router.get("/status/{user_id}")
async def get_messaging_status_endpoint(
    user_id: int,
    current_user: User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get messaging status with another user.
    
    Returns:
    - can_message: boolean
    - reason: why messaging is allowed/not
    - shared_skills: skills both users share (if any)
    """
    if current_user.id == user_id:
        return {
            "can_message": True,
            "reason": "self_message"
        }
    
    return get_messaging_status(db, current_user.id, user_id)
