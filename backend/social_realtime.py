from battle_realtime import sio
from common.database import SessionLocal
from common.models import User, Message, ChatRoom, Notification
from sqlalchemy.orm import Session
from datetime import datetime
import json

# ──────────────────────────────────────────────────
# Social Real-Time Handlers
# ──────────────────────────────────────────────────

def _get_db():
    db = SessionLocal()
    try:
        return db
    except Exception:
        db.close()
        raise

@sio.on('connect', namespace='/social')
async def social_connect(sid, environ, auth=None):
    print(f"[SOCIAL] Client connected: {sid}")
    # Handle identification (auth token check)
    user_id = None
    if auth and isinstance(auth, dict):
        user_id = auth.get("user_id")
    
    if user_id:
        await sio.save_session(sid, {"user_id": user_id}, namespace='/social')
        # Join personal room for notifications
        await sio.enter_room(sid, f"user_{user_id}", namespace='/social')
        
        # Update user status to online
        db = _get_db()
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.online_status = "online"
                user.last_active = datetime.utcnow()
                db.commit()
                # Broadcast status to everyone? (Or just connections - for now simple broadcast)
                await sio.emit('USER_STATUS', {"user_id": user_id, "status": "online"}, namespace='/social')
        finally:
            db.close()

@sio.on('disconnect', namespace='/social')
async def social_disconnect(sid):
    session = await sio.get_session(sid, namespace='/social')
    user_id = session.get("user_id")
    print(f"[SOCIAL] Client disconnected: {sid} (user={user_id})")
    
    if user_id:
        db = _get_db()
        try:
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.online_status = "offline"
                user.last_active = datetime.utcnow()
                db.commit()
                await sio.emit('USER_STATUS', {"user_id": user_id, "status": "offline"}, namespace='/social')
        finally:
            db.close()

@sio.on('join_chat', namespace='/social')
async def join_chat(sid, data):
    room_id = data.get("room_id")
    if room_id:
        await sio.enter_room(sid, f"chat_room_{room_id}", namespace='/social')
        print(f"[SOCIAL] User joined chat_room_{room_id}")

@sio.on('send_message', namespace='/social')
async def handle_social_message(sid, data):
    """
    data: { room_id, recipient_id, text, type }
    """
    session = await sio.get_session(sid, namespace='/social')
    sender_id = session.get("user_id")
    room_id = data.get("room_id")
    recipient_id = data.get("recipient_id")
    text = data.get("text")
    msg_type = data.get("type", "text")
    
    if not sender_id or not room_id or not text:
        return

    db = _get_db()
    try:
        # Get sender for notification
        sender = db.query(User).filter(User.id == sender_id).first()
        sender_name = sender.display_name or sender.username if sender else f"user {sender_id}"

        # Save message to DB
        new_msg = Message(
            room_id=room_id,
            sender_id=sender_id,
            receiver_id=recipient_id,
            message_text=text,
            message_type=msg_type
        )
        db.add(new_msg)
        db.flush() # Get ID

        # Update room's last_message_at
        room = db.query(ChatRoom).filter(ChatRoom.id == room_id).first()
        if room:
            room.last_message_at = datetime.utcnow()

        # Create Notification DB record
        notification = Notification(
            user_id=recipient_id,
            type="NEW_MESSAGE",
            title="New Message",
            message=f"New message from {sender_name}",
            related_id=str(room_id)
        )
        db.add(notification)
        db.flush()
        
        payload = {
            "id": new_msg.id,
            "room_id": room_id,
            "sender_id": sender_id,
            "text": text,
            "type": msg_type,
            "created_at": new_msg.created_at.isoformat()
        }
        
        # Emit to room
        await sio.emit('MESSAGE_RECEIVED', payload, room=f"chat_room_{room_id}", namespace='/social')
        
        # Emit notification to recipient's personal room
        await sio.emit('NEW_NOTIFICATION', {
            "id": notification.id,
            "type": notification.type,
            "title": notification.title,
            "message": notification.message,
            "related_id": notification.related_id,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat() if notification.created_at else None
        }, room=f"user_{recipient_id}", namespace='/social')
        
        db.commit()
    finally:
        db.close()

@sio.on('typing', namespace='/social')
async def handle_typing(sid, data):
    room_id = data.get("room_id")
    is_typing = data.get("is_typing", False)
    session = await sio.get_session(sid, namespace='/social')
    user_id = session.get("user_id")
    
    if room_id and user_id:
        await sio.emit('USER_TYPING', {
            "room_id": room_id,
            "user_id": user_id,
            "is_typing": is_typing
        }, room=f"chat_room_{room_id}", skip_sid=sid, namespace='/social')
