"""
Nexora PvP Real-Time Battle Server (Socket.IO)
================================================
Embedded into the main FastAPI app via python-socketio ASGI.
Nginx routes /battle/* → core_api, so the socket.io path is /battle/socket.io

Match room naming: match_room_{match_id}
Spectator room: spec_{match_id}

Real-time Events (server → client):
  MATCH_FOUND          - match paired successfully
  MATCH_START          - both players joined room, battle begins
  TIMER_START          - timer begins with limit in seconds
  TIMER_TICK           - every 5s broadcast (elapsed, remaining)
  TIMER_END            - time expired, force-submit
  PLAYER_SUBMISSION    - a player submitted
  SCORE_UPDATE         - live score after each submission
  ROUND_END            - (future multi-round) round finished
  MATCH_END            - battle decided, final results
  PLAYER_DISCONNECTED  - a player lost connection
  PLAYER_RECONNECTED   - player reconnected
  FORFEIT              - player forfeited
  SPECTATOR_JOINED     - spectator count updated
  ERROR                - error payload to client

Client → server events:
  join_match           - join the match room
  join_spectator       - join as spectator
  leave_spectator      - leave spectator room
  submit_solution      - submit code/answer
  code_update          - live code sync for spectators
  ping_timer           - client heartbeat to sync timer
  forfeit_match        - player forfeit from socket layer
"""

import socketio
import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

# DB imports — use the main app's database + models
from common.database import SessionLocal
from common import models
from judging import AIJudge

# ──────────────────────────────────────────────────
# Socket.IO Server
# ──────────────────────────────────────────────────
sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
    ping_timeout=60,
    ping_interval=25,
)

# In-memory state stores (lightweight — Redis preferred in production)
# active_timers[match_id] = asyncio.Task
active_timers: Dict[str, Any] = {}

# room_players[match_id] = {sid: user_id}
room_players: Dict[str, Dict[str, int]] = {}

# disconnect_tasks[user_id] = asyncio.Task (grace timer before forfeit)
disconnect_tasks: Dict[int, asyncio.Task] = {}

# match_scores[match_id] = {player_id: score}
match_scores: Dict[str, Dict[int, int]] = {}


# ──────────────────────────────────────────────────
# Helpers
# ──────────────────────────────────────────────────

def _get_db():
    db = SessionLocal()
    try:
        return db
    except Exception:
        db.close()
        raise


def _mmr_to_rank(mmr: int) -> str:
    if mmr >= 2200: return "Grandmaster"
    if mmr >= 1900: return "Master"
    if mmr >= 1600: return "Diamond"
    if mmr >= 1300: return "Platinum"
    if mmr >= 1100: return "Gold"
    if mmr >= 900:  return "Silver"
    if mmr >= 700:  return "Bronze"
    return "Novice"


async def _broadcast_match(match_id: str, event: str, data: Dict[str, Any]):
    """Send event to both the match room and the spectator room."""
    room = f"match_room_{match_id}"
    spec_room = f"spec_{match_id}"
    payload = {"event": event, "match_id": match_id, "timestamp": datetime.utcnow().isoformat(), **data}
    await sio.emit(event, payload, room=room)
    await sio.emit(event, payload, room=spec_room)


async def _run_match_timer(match_id: str, time_limit_seconds: int):
    """
    Server-controlled countdown timer.
    Broadcasts TIMER_TICK every 5 seconds.
    Broadcasts TIMER_END when time runs out and auto-finalizes.
    """
    await _broadcast_match(match_id, "TIMER_START", {"duration": time_limit_seconds})

    elapsed = 0
    tick_interval = 5  # seconds between ticks

    while elapsed < time_limit_seconds:
        await asyncio.sleep(tick_interval)
        elapsed += tick_interval
        remaining = max(0, time_limit_seconds - elapsed)

        await _broadcast_match(match_id, "TIMER_TICK", {
            "elapsed": elapsed,
            "remaining": remaining,
            "percent": int((elapsed / time_limit_seconds) * 100),
        })

        if remaining == 0:
            break

    # Time's up — auto-finalize with whatever scores exist
    await _broadcast_match(match_id, "TIMER_END", {"message": "Time's up! Finalizing..."})
    await _auto_finalize_on_timeout(match_id)


async def _auto_finalize_on_timeout(match_id: str):
    """Determine winner from partial scores when timer runs out."""
    db = _get_db()
    try:
        match = db.query(models.PvPMatch).filter(models.PvPMatch.id == match_id).first()
        if not match or match.status == "completed":
            return

        # Collect submitted scores
        submissions = db.query(models.PvPSubmission).filter(
            models.PvPSubmission.match_id == match_id
        ).all()
        scores = {s.player_id: s.final_score for s in submissions}

        # Players who haven't submitted get 0
        if match.player1_id not in scores:
            scores[match.player1_id] = 0
        if match.player2_id and match.player2_id not in scores:
            scores[match.player2_id] = 0

        p1_score = scores.get(match.player1_id, 0)
        p2_score = scores.get(match.player2_id, 0) if match.player2_id else 0

        if p1_score > p2_score:
            winner_id = match.player1_id
        elif p2_score > p1_score:
            winner_id = match.player2_id
        else:
            winner_id = 0  # draw

        # Finalize and store results (reuse logic from pvp.py)
        _finalize_match_sync(db, match, winner_id, scores)

        # Prepare winner info
        winner = db.query(models.User).get(winner_id) if winner_id else None
        p1_r = db.query(models.PvPRating).filter(models.PvPRating.user_id == match.player1_id).first()
        p2_r = db.query(models.PvPRating).filter(models.PvPRating.user_id == match.player2_id).first() if match.player2_id else None

        await _broadcast_match(match_id, "MATCH_END", {
            "winner_id": winner_id if winner_id else None,
            "winner_username": winner.username if winner else None,
            "is_draw": winner_id == 0,
            "final_scores": {
                "player1": p1_score,
                "player2": p2_score,
            },
            "xp_rewards": {"winner": 200, "loser": 50, "draw": 100},
            "mmr_changes": {"winner": 25, "loser": -15, "draw": 5},
            "new_mmr": {
                "player1": p1_r.mmr if p1_r else 1000,
                "player2": p2_r.mmr if p2_r else 1000,
            },
        })

    finally:
        db.close()

    # Cancel any pending disconnect tasks for this match
    if match_id in active_timers:
        del active_timers[match_id]


def _finalize_match_sync(db, match, winner_id, scores):
    """Synchronous version of finalize for use in async context."""
    from datetime import datetime

    loser_id = match.player2_id if winner_id == match.player1_id else match.player1_id
    is_draw = winner_id == 0

    for pid in [match.player1_id, match.player2_id]:
        if pid is None:
            continue
        score = scores.get(pid, 0)
        result = "draw" if is_draw else ("win" if pid == winner_id else "loss")
        xp_gain = 200 if result == "win" else (100 if result == "draw" else 50)
        mmr_delta = 25 if result == "win" else (-15 if result == "loss" else 5)

        # Upsert PvPMatchResult
        mr = models.PvPMatchResult(
            match_id=match.id, player_id=pid, score=score,
            accuracy=min(score, 100),
            completion_time=int((datetime.utcnow() - (match.start_time or datetime.utcnow())).total_seconds()),
            result=result, xp_gained=xp_gain, mmr_change=mmr_delta,
        )
        db.add(mr)

        # Update user XP
        user = db.query(models.User).get(pid)
        if user:
            user.xp_points = (user.xp_points or 0) + xp_gain
            user.ranking_score = max(0, (user.ranking_score or 1000) + mmr_delta)

        # Update PvP rating
        rating = db.query(models.PvPRating).filter(models.PvPRating.user_id == pid).first()
        if not rating:
            rating = models.PvPRating(user_id=pid)
            db.add(rating)
        rating.mmr = max(0, rating.mmr + mmr_delta)
        rating.matches_played += 1
        if result == "win":
            rating.wins += 1
            rating.current_streak = max(0, rating.current_streak) + 1
        elif result == "loss":
            rating.losses += 1
            rating.current_streak = min(0, rating.current_streak) - 1
        else:
            rating.draws += 1
            rating.current_streak = 0
        rating.highest_mmr = max(rating.highest_mmr, rating.mmr)

    # Update match
    match.status = "completed"
    match.match_status = "completed"
    match.end_time = datetime.utcnow()
    match.winner_id = winner_id if not is_draw else None

    # Write history
    p1_score = scores.get(match.player1_id, 0)
    p2_score = scores.get(match.player2_id, 0) if match.player2_id else 0
    history = models.PvPMatchHistory(
        match_id=match.id, player1_id=match.player1_id, player2_id=match.player2_id,
        winner_id=match.winner_id, skill_id=match.skill_id, battle_type=match.battle_type,
        player1_score=p1_score, player2_score=p2_score,
        match_score={"player1": p1_score, "player2": p2_score},
    )
    db.add(history)
    db.commit()


# ──────────────────────────────────────────────────
# Socket.IO Events
# ──────────────────────────────────────────────────

@sio.event
async def connect(sid, environ, auth=None):
    """Client connected. Auth token validated here."""
    token = None
    if auth and isinstance(auth, dict):
        token = auth.get("token")

    # We store the token in session for later use
    await sio.save_session(sid, {"token": token, "user_id": None, "match_id": None})
    print(f"[WS] Client connected: {sid}")


@sio.event
async def disconnect(sid):
    """Handle player disconnect — start 30s grace timer."""
    session = await sio.get_session(sid)
    user_id = session.get("user_id")
    match_id = session.get("match_id")

    print(f"[WS] Client disconnected: {sid} (user={user_id}, match={match_id})")

    if not user_id or not match_id:
        return

    # Remove from room tracking
    if match_id in room_players and sid in room_players[match_id]:
        del room_players[match_id][sid]

    # Notify room
    await _broadcast_match(match_id, "PLAYER_DISCONNECTED", {
        "user_id": user_id,
        "message": f"Player disconnected. 30 seconds to reconnect...",
        "grace_seconds": 30,
    })

    # Start grace timer — if not reconnected, opponent wins
    async def forfeit_after_grace():
        await asyncio.sleep(30)
        # Check if player is back
        db = _get_db()
        try:
            match = db.query(models.PvPMatch).filter(models.PvPMatch.id == match_id).first()
            if match and match.status == "in_progress":
                winner_id = match.player2_id if user_id == match.player1_id else match.player1_id
                scores = {user_id: 0, winner_id: 100}
                _finalize_match_sync(db, match, winner_id, scores)
                winner = db.query(models.User).get(winner_id)
                await _broadcast_match(match_id, "FORFEIT", {
                    "disconnected_player": user_id,
                    "winner_id": winner_id,
                    "winner_username": winner.username if winner else None,
                    "reason": "disconnect_timeout",
                })
                await _broadcast_match(match_id, "MATCH_END", {
                    "winner_id": winner_id,
                    "winner_username": winner.username if winner else None,
                    "is_draw": False,
                    "reason": "forfeit_on_disconnect",
                })
        finally:
            db.close()
        if user_id in disconnect_tasks:
            del disconnect_tasks[user_id]

    # Cancel any existing grace task for this user
    if user_id in disconnect_tasks:
        disconnect_tasks[user_id].cancel()

    task = asyncio.create_task(forfeit_after_grace())
    disconnect_tasks[user_id] = task


@sio.event
async def join_match(sid, data):
    """
    Player joins their battle room.
    data: { match_id, user_id }
    """
    match_id = data.get("match_id")
    user_id = data.get("user_id")

    if not match_id or not user_id:
        await sio.emit("ERROR", {"message": "match_id and user_id required"}, to=sid)
        return

    # Cancel grace timer if reconnecting
    if user_id in disconnect_tasks:
        disconnect_tasks[user_id].cancel()
        del disconnect_tasks[user_id]
        # Notify room of reconnect
        await _broadcast_match(match_id, "PLAYER_RECONNECTED", {"user_id": user_id})

    # Save session
    await sio.save_session(sid, {"user_id": user_id, "match_id": match_id})

    # Join the match room
    room = f"match_room_{match_id}"
    await sio.enter_room(sid, room)

    if match_id not in room_players:
        room_players[match_id] = {}
    room_players[match_id][sid] = user_id

    # Get match state from DB
    db = _get_db()
    try:
        match = db.query(models.PvPMatch).filter(models.PvPMatch.id == match_id).first()
        if not match:
            await sio.emit("ERROR", {"message": "Match not found"}, to=sid)
            return

        challenge = match.challenge
        p1 = db.query(models.User).get(match.player1_id)
        p2 = db.query(models.User).get(match.player2_id) if match.player2_id else None

        # Send current match state to the joining player
        await sio.emit("MATCH_FOUND", {
            "match_id": match_id,
            "status": match.status,
            "battle_type": match.battle_type,
            "skill_id": match.skill_id,
            "player1": {"id": p1.id, "username": p1.username, "avatar_url": p1.avatar_url} if p1 else None,
            "player2": {"id": p2.id, "username": p2.username, "avatar_url": p2.avatar_url} if p2 else None,
            "challenge": {
                "id": challenge.id,
                "title": challenge.title,
                "description": challenge.description,
                "difficulty": challenge.difficulty,
                "initial_code": challenge.initial_code,
                "time_limit_minutes": challenge.time_limit_minutes,
                "xp_reward": challenge.xp_reward,
                "test_cases": challenge.test_cases or [],
            } if challenge else None,
            "start_time": match.start_time.isoformat() if match.start_time else None,
        }, to=sid)

        # Count players in room
        players_in_room = len([uid for uid in room_players.get(match_id, {}).values()])

        # Start timer if both players are in room and match just started
        if players_in_room >= 2 and match.status == "in_progress" and match_id not in active_timers:
            time_limit = (challenge.time_limit_minutes * 60) if challenge else 900
            await _broadcast_match(match_id, "MATCH_START", {
                "message": "Both players ready! Battle begins NOW.",
                "time_limit_seconds": time_limit,
                "start_time": match.start_time.isoformat() if match.start_time else datetime.utcnow().isoformat(),
            })
            task = asyncio.create_task(_run_match_timer(match_id, time_limit))
            active_timers[match_id] = task

    finally:
        db.close()


@sio.event
async def join_spectator(sid, data):
    """
    Spectator joins to watch a match in read-only mode.
    data: { match_id, user_id (optional) }
    """
    match_id = data.get("match_id")
    if not match_id:
        await sio.emit("ERROR", {"message": "match_id required"}, to=sid)
        return

    spec_room = f"spec_{match_id}"
    await sio.enter_room(sid, spec_room)
    await sio.save_session(sid, {"user_id": data.get("user_id"), "match_id": match_id, "role": "spectator"})

    # Increment spectator count
    db = _get_db()
    try:
        match = db.query(models.PvPMatch).filter(models.PvPMatch.id == match_id).first()
        if match:
            match.spectator_count = (match.spectator_count or 0) + 1
            db.commit()
            await _broadcast_match(match_id, "SPECTATOR_JOINED", {
                "spectator_count": match.spectator_count,
            })
            # Send current state to spectator
            await sio.emit("MATCH_FOUND", {
                "match_id": match_id,
                "status": match.status,
                "battle_type": match.battle_type,
                "skill_id": match.skill_id,
            }, to=sid)
    finally:
        db.close()


@sio.event
async def leave_spectator(sid, data):
    """Spectator leaves."""
    match_id = data.get("match_id")
    if not match_id:
        return
    spec_room = f"spec_{match_id}"
    await sio.leave_room(sid, spec_room)

    db = _get_db()
    try:
        match = db.query(models.PvPMatch).filter(models.PvPMatch.id == match_id).first()
        if match and match.spectator_count > 0:
            match.spectator_count -= 1
            db.commit()
    finally:
        db.close()


@sio.event
async def submit_solution(sid, data):
    """
    Player submits code/answer via WebSocket.
    data: { match_id, user_id, code, answer }
    Evaluates, broadcasts score update. If both submitted → MATCH_END.
    """
    match_id = data.get("match_id")
    user_id = data.get("user_id")
    code = data.get("code") or data.get("answer", "")

    if not match_id or not user_id or not code:
        await sio.emit("ERROR", {"message": "match_id, user_id, and code/answer required"}, to=sid)
        return

    db = _get_db()
    try:
        match = db.query(models.PvPMatch).filter(models.PvPMatch.id == match_id).first()
        if not match or match.status != "in_progress":
            await sio.emit("ERROR", {"message": "Match not active"}, to=sid)
            return

        # Anti-cheat: check for existing submission
        existing = db.query(models.PvPSubmission).filter(
            models.PvPSubmission.match_id == match_id,
            models.PvPSubmission.player_id == user_id
        ).first()
        if existing:
            await sio.emit("ERROR", {"message": "Already submitted"}, to=sid)
            return

        # Anti-cheat: minimum time check
        elapsed = int((datetime.utcnow() - (match.start_time or datetime.utcnow())).total_seconds())
        if elapsed < 5:
            await sio.emit("ERROR", {"message": "Submission too fast — minimum 5 seconds"}, to=sid)
            return

        # Evaluate
        challenge_ctx = {
            "difficulty": match.challenge.difficulty if match.challenge else "Medium",
            "battle_type": match.battle_type,
        }
        eval_result = AIJudge.evaluate_submission(code, challenge_ctx)
        ai_score = eval_result.get("ai_score", 50)
        time_limit = (match.challenge.time_limit_minutes * 60) if match.challenge else 900
        final_score = AIJudge.calculate_final_match_score(ai_score, 0, elapsed, time_limit)

        # Save submission
        sub = models.PvPSubmission(
            match_id=match_id, player_id=user_id, code_content=code,
            status="accepted", ai_score=ai_score,
            speed_bonus=max(0, time_limit - elapsed), final_score=final_score,
            feedback_json=eval_result.get("feedback"),
        )
        db.add(sub)
        db.commit()

        # Broadcast that player submitted
        await _broadcast_match(match_id, "PLAYER_SUBMISSION", {
            "user_id": user_id,
            "message": "Player submitted!",
        })

        # Emit score update to room
        all_subs = db.query(models.PvPSubmission).filter(
            models.PvPSubmission.match_id == match_id
        ).all()
        scores = {s.player_id: s.final_score for s in all_subs}

        await _broadcast_match(match_id, "SCORE_UPDATE", {
            "scores": scores,
            "player1_score": scores.get(match.player1_id, 0),
            "player2_score": scores.get(match.player2_id, 0) if match.player2_id else 0,
        })

        # Both submitted?
        if len(all_subs) >= 2:
            # Cancel timer
            if match_id in active_timers:
                active_timers[match_id].cancel()
                del active_timers[match_id]

            p1_score = scores.get(match.player1_id, 0)
            p2_score = scores.get(match.player2_id, 0) if match.player2_id else 0

            winner_id = match.player1_id if p1_score > p2_score else (
                match.player2_id if p2_score > p1_score else 0
            )

            _finalize_match_sync(db, match, winner_id, scores)

            winner = db.query(models.User).get(winner_id) if winner_id else None
            p1_r = db.query(models.PvPRating).filter(models.PvPRating.user_id == match.player1_id).first()
            p2_r = db.query(models.PvPRating).filter(models.PvPRating.user_id == match.player2_id).first() if match.player2_id else None

            await _broadcast_match(match_id, "MATCH_END", {
                "winner_id": winner_id if winner_id else None,
                "winner_username": winner.username if winner else None,
                "is_draw": winner_id == 0,
                "final_scores": {
                    "player1": p1_score,
                    "player2": p2_score,
                },
                "xp_rewards": {"winner": 200, "loser": 50, "draw": 100},
                "mmr_changes": {"winner": 25, "loser": -15, "draw": 5},
                "new_mmr": {
                    "player1": p1_r.mmr if p1_r else 1000,
                    "player2": p2_r.mmr if p2_r else 1000,
                },
            })

        # Send personal feedback to submitter
        await sio.emit("judge_result", {
            "user_id": user_id,
            "score": final_score,
            "ai_score": ai_score,
            "feedback": eval_result.get("feedback"),
            "breakdown": eval_result.get("breakdown"),
            "elapsed_seconds": elapsed,
        }, to=sid)

    finally:
        db.close()


@sio.event
async def code_update(sid, data):
    """
    Live code sync — broadcasts to spectators only (not opponent).
    data: { match_id, user_id, code }
    """
    match_id = data.get("match_id")
    if not match_id:
        return
    spec_room = f"spec_{match_id}"
    await sio.emit("code_sync", {
        "user_id": data.get("user_id"),
        "code": data.get("code", ""),
        "timestamp": datetime.utcnow().isoformat(),
    }, room=spec_room)


@sio.event
async def forfeit_match(sid, data):
    """
    Player forfeits via WebSocket.
    data: { match_id, user_id }
    """
    match_id = data.get("match_id")
    user_id = data.get("user_id")

    if not match_id or not user_id:
        return

    db = _get_db()
    try:
        match = db.query(models.PvPMatch).filter(models.PvPMatch.id == match_id).first()
        if not match or match.status != "in_progress":
            return

        winner_id = match.player2_id if user_id == match.player1_id else match.player1_id
        scores = {user_id: 0, winner_id: 100}
        _finalize_match_sync(db, match, winner_id, scores)
        match.status = "forfeited"
        db.commit()

        winner = db.query(models.User).get(winner_id)

        # Cancel timer
        if match_id in active_timers:
            active_timers[match_id].cancel()
            del active_timers[match_id]

        await _broadcast_match(match_id, "FORFEIT", {
            "forfeited_by": user_id,
            "winner_id": winner_id,
            "winner_username": winner.username if winner else None,
        })
        await _broadcast_match(match_id, "MATCH_END", {
            "winner_id": winner_id,
            "winner_username": winner.username if winner else None,
            "is_draw": False,
            "reason": "forfeit",
        })

    finally:
        db.close()


@sio.event
async def ping_timer(sid, data):
    """Client heartbeat to keep timer in sync."""
    match_id = data.get("match_id")
    if not match_id:
        return
    db = _get_db()
    try:
        match = db.query(models.PvPMatch).filter(models.PvPMatch.id == match_id).first()
        if match and match.start_time and match.challenge:
            elapsed = int((datetime.utcnow() - match.start_time).total_seconds())
            remaining = max(0, match.challenge.time_limit_minutes * 60 - elapsed)
            await sio.emit("TIMER_TICK", {
                "match_id": match_id,
                "elapsed": elapsed,
                "remaining": remaining,
            }, to=sid)
    finally:
        db.close()
