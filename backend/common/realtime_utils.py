from battle_realtime import sio
from common.models import Notification
from datetime import datetime

async def emit_realtime_notification(notification: Notification):
    """Emit a real-time notification event for an already-persisted Notification."""
    try:
        await sio.emit('NEW_NOTIFICATION', {
            "id": notification.id,
            "type": notification.type,
            "title": notification.title,
            "message": notification.message,
            "related_id": notification.related_id,
            "is_read": notification.is_read,
            "created_at": notification.created_at.isoformat() if notification.created_at else None
        }, room=f"user_{notification.user_id}", namespace='/social')
    except Exception as e:
        print(f"[REALTIME] Failed to emit notification: {e}")
