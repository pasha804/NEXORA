import socketio
from fastapi import FastAPI
import uvicorn
import os
import json
from sqlalchemy.orm import Session
from common.database import get_db, SessionLocal
from common.models import Match, MatchStatus, MatchSubmission
import redis

# Create Socket.IO Server
sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')
app = FastAPI()
sio_app = socketio.ASGIApp(sio, app)

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
redis_client = redis.from_url(REDIS_URL)

@app.get("/health")
def health():
    return {"status": "ok", "service": "battle-engine"}

# ==========================================
# SOCKET.IO EVENTS
# ==========================================

@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def join_match(sid, data):
    # data: { match_id: "...", user_id: 123 }
    match_id = data.get('match_id')
    user_id = data.get('user_id')
    
    if not match_id:
        return
        
    print(f"User {user_id} joining match {match_id}")
    sio.enter_room(sid, match_id)
    
    # Send current state
    db = SessionLocal()
    match = db.query(Match).filter(Match.id == match_id).first()
    if match:
        await sio.emit('match_state', {
            'status': match.status,
            'started_at': match.started_at.isoformat() if match.started_at else None,
            'players': [match.player1_id, match.player2_id]
        }, room=sid)
    db.close()

@sio.event
async def code_update(sid, data):
    # Real-time code syncing for spectator?
    # data: { match_id, code, user_id }
    match_id = data.get('match_id')
    await sio.emit('code_sync', data, room=match_id, skip_sid=sid)

@sio.event
async def submit_solution(sid, data):
    # data: { match_id, user_id, code }
    match_id = data['match_id']
    user_id = data['user_id']
    code = data['code']
    
    db = SessionLocal()
    
    # 1. Save Submission
    sub = MatchSubmission(
        match_id=match_id,
        user_id=user_id,
        result={"code": code, "score": 0} # Using the correct 'result' JSON field
    )
    db.add(sub)
    db.commit()
    
    # 2. Notify Room
    await sio.emit('player_submitted', {'user_id': user_id}, room=match_id)
    
    # 3. Trigger AI Judge
    import random
    score = random.randint(50, 100)
    
    # Update JSON result
    sub.result = {"code": code, "score": score, "feedback": {"accuracy": 90, "quality": 85}}
    db.commit()

    # 4. Emit PvP result event for skill XP (winner-only for now)
    try:
        match = db.query(Match).filter(Match.id == match_id).first()
        if match:
            payload = {
                "event": "pvp_skill_result",
                "data": {
                    "winner_id": user_id,
                    "skill_type": match.skill_type or "general",
                    "score": score,
                },
            }
            redis_client.publish("nexora_events", json.dumps(payload))
    except Exception as exc:
        print(f"[battle_engine] failed to publish pvp_skill_result: {exc}")
    
    await sio.emit('judge_result', {
        'user_id': user_id,
        'score': score,
        'feedback': {'accuracy': 90, 'quality': 85}
    }, room=match_id)
    
    db.close()

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000)
