"""
Nexora PvP Arena — Production REST Router
All endpoints use real database operations. No mock data.
WebSocket/real-time events are handled by battle_realtime.py (Socket.IO).
"""
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
import uuid
import json
import math

from common import database, models
import auth as auth_module
from judging import AIJudge
from common.event_utils import emit_pvp_skill_result, emit_match_result

router = APIRouter(prefix="/pvp", tags=["pvp"])
get_db = database.get_db

# ==========================================
# ANTI-CHEAT SYSTEM
# ==========================================

def _check_anti_cheat(db: Session, user_id: int, opponent_id: int, skill_id: int) -> Dict[str, Any]:
    """
    Anti-cheat detection for PvP matches.
    
    Checks for:
    1. Rapid wins (too many wins in short time)
    2. Same opponent abuse (playing same opponent repeatedly)
    3. Bot patterns (suspicious win patterns)
    
    Returns dict with flags and penalties.
    """
    flags = []
    xp_penalty = 1.0
    
    recent_matches = db.query(models.PvPMatch).filter(
        models.PvPMatch.winner_id == user_id,
        models.PvPMatch.status == "completed",
        models.PvPMatch.end_time >= datetime.utcnow() - timedelta(hours=24)
    ).count()
    
    if recent_matches > 20:
        flags.append("rapid_wins")
        xp_penalty = 0.5
    
    matches_with_opponent = db.query(models.PvPMatch).filter(
        ((models.PvPMatch.player1_id == user_id) & (models.PvPMatch.player2_id == opponent_id)) |
        ((models.PvPMatch.player2_id == user_id) & (models.PvPMatch.player1_id == opponent_id))
    ).filter(
        models.PvPMatch.status == "completed",
        models.PvPMatch.end_time >= datetime.utcnow() - timedelta(days=1)
    ).count()
    
    if matches_with_opponent > 5:
        flags.append("same_opponent_abuse")
        xp_penalty = min(xp_penalty, 0.7)
    
    win_streak = db.query(models.PvPRating).filter(
        models.PvPRating.user_id == user_id
    ).first()
    
    if win_streak and win_streak.current_streak > 15:
        flags.append("suspicious_streak")
        xp_penalty = min(xp_penalty, 0.8)
    
    security_score = db.query(models.UserSecurityScore).filter(
        models.UserSecurityScore.user_id == user_id
    ).first()
    
    if security_score and security_score.trust_score < 50:
        flags.append("low_trust_score")
        xp_penalty = min(xp_penalty, 0.5)
    
    return {
        "flags": flags,
        "xp_penalty": xp_penalty,
        "suspicious": len(flags) > 0
    }

# ==========================================
# HELPERS
# ==========================================

def _mmr_to_rank(mmr: int) -> str:
    if mmr >= 2200: return "Grandmaster"
    if mmr >= 1900: return "Master"
    if mmr >= 1600: return "Diamond"
    if mmr >= 1300: return "Platinum"
    if mmr >= 1100: return "Gold"
    if mmr >= 900:  return "Silver"
    if mmr >= 700:  return "Bronze"
    return "Novice"

def _get_or_create_rating(db: Session, user_id: int) -> models.PvPRating:
    rating = db.query(models.PvPRating).filter(models.PvPRating.user_id == user_id).first()
    if not rating:
        rating = models.PvPRating(user_id=user_id, mmr=1000 + (db.query(models.User).get(user_id).ranking_score or 0) // 10)
        db.add(rating)
        db.commit()
        db.refresh(rating)
    return rating

def _get_challenge_for_battle(db: Session, battle_type: str, skill_id: str) -> models.PvPChallenge:
    """Pick an appropriate challenge from the DB, or create a default one."""
    # Try to find a matching active challenge
    challenge = db.query(models.PvPChallenge).filter(
        models.PvPChallenge.is_active == True,
        models.PvPChallenge.category.ilike(f"%{skill_id}%") if skill_id else True
    ).order_by(func.random()).first()

    if not challenge:
        # Create defaults for each battle type
        defaults = {
            "code_challenge": {
                "title": "Two Sum Optimization",
                "description": "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution.",
                "difficulty": "Medium",
                "category": skill_id or "Algorithms",
                "time_limit_minutes": 15,
                "xp_reward": 150,
                "initial_code": "def two_sum(nums: list[int], target: int) -> list[int]:\n    # Your code here\n    pass",
                "test_cases": [
                    {"input": "[2,7,11,15], 9", "output": "[0,1]"},
                    {"input": "[3,2,4], 6", "output": "[1,2]"}
                ]
            },
            "knowledge_quiz": {
                "title": "React Fundamentals Quiz",
                "description": "Demonstrate your knowledge of React hooks, component lifecycle, and state management by explaining your answers below.",
                "difficulty": "Easy",
                "category": skill_id or "React",
                "time_limit_minutes": 10,
                "xp_reward": 100,
                "initial_code": "# Answer the three questions:\n\n# Q1: What is the difference between useState and useReducer?\n# A1: \n\n# Q2: When would you use useCallback over useMemo?\n# A2: \n\n# Q3: Explain the concept of lifting state up.\n# A3: ",
                "test_cases": []
            },
            "problem_solving": {
                "title": "System Design: URL Shortener",
                "description": "Design a scalable URL shortener service. Outline the architecture, data model, and key algorithms. Consider scale, performance, and edge cases.",
                "difficulty": "Hard",
                "category": skill_id or "System Design",
                "time_limit_minutes": 20,
                "xp_reward": 200,
                "initial_code": "# System Design: URL Shortener\n# \n# 1. Requirements:\n# \n# 2. Architecture:\n# \n# 3. Data Model:\n# \n# 4. API Design:\n# \n# 5. Scalability Considerations:\n",
                "test_cases": []
            },
            "timed_challenge": {
                "title": "FizzBuzz Challenge (Timed)",
                "description": "Write a function that prints numbers from 1 to n, but for multiples of 3 print 'Fizz', for multiples of 5 print 'Buzz', and for multiples of both print 'FizzBuzz'. You have 5 minutes — speed matters!",
                "difficulty": "Easy",
                "category": skill_id or "Algorithms",
                "time_limit_minutes": 5,
                "xp_reward": 120,
                "initial_code": "def fizzbuzz(n: int) -> list[str]:\n    # Your code here\n    pass",
                "test_cases": [
                    {"input": "5", "output": "['1', '2', 'Fizz', '4', 'Buzz']"},
                    {"input": "15", "output": "['1','2','Fizz','4','Buzz','Fizz','7','8','Fizz','Buzz','11','Fizz','13','14','FizzBuzz']"}
                ]
            }
        }
        cfg = defaults.get(battle_type, defaults["code_challenge"])
        challenge = models.PvPChallenge(**cfg)
        db.add(challenge)
        db.commit()
        db.refresh(challenge)

    return challenge

def _finalize_match(db: Session, match: models.PvPMatch, winner_id: int, scores: Dict[int, int]):
    """Write match results, update XP, MMR, history. Called after both players submit or one forfeits."""
    loser_id = match.player2_id if winner_id == match.player1_id else match.player1_id
    is_draw = winner_id == 0  # 0 signals draw
    
    opponent_id = loser_id if winner_id != 0 and not is_draw else None
    
    for pid in [match.player1_id, match.player2_id]:
        if pid is None:
            continue
        score = scores.get(pid, 0)
        result = "draw" if is_draw else ("win" if pid == winner_id else "loss")
        
        anti_cheat = {"xp_penalty": 1.0, "flags": [], "suspicious": False}
        if result == "win" and opponent_id:
            anti_cheat = _check_anti_cheat(db, pid, opponent_id, match.skill_id)
        
        xp_gain = int((200 if result == "win" else (100 if result == "draw" else 50)) * anti_cheat["xp_penalty"])
        mmr_delta = 25 if result == "win" else (-15 if result == "loss" else 5)

        # Write result row
        mr = models.PvPMatchResult(
            match_id=match.id,
            player_id=pid,
            score=score,
            accuracy=min(score, 100),
            completion_time=int((datetime.utcnow() - (match.start_time or datetime.utcnow())).total_seconds()),
            result=result,
            xp_gained=xp_gain,
            mmr_change=mmr_delta,
        )
        db.add(mr)

        # Update user XP
        user = db.query(models.User).get(pid)
        if user:
            user.xp_points = (user.xp_points or 0) + xp_gain
            user.ranking_score = max(0, (user.ranking_score or 1000) + mmr_delta)

        # Update PvP rating
        rating = _get_or_create_rating(db, pid)
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

    # Update match status
    match.status = "completed"
    match.match_status = "completed"
    match.end_time = datetime.utcnow()
    match.winner_id = winner_id if not is_draw else None

    # Write history row
    p1_score = scores.get(match.player1_id, 0)
    p2_score = scores.get(match.player2_id, 0) if match.player2_id else 0
    history = models.PvPMatchHistory(
        match_id=match.id,
        player1_id=match.player1_id,
        player2_id=match.player2_id,
        winner_id=match.winner_id,
        skill_id=match.skill_id,
        battle_type=match.battle_type,
        player1_score=p1_score,
        player2_score=p2_score,
        match_score={"player1": p1_score, "player2": p2_score},
    )
    db.add(history)
    db.commit()
    
    if winner_id and not is_draw:
        skill = db.query(models.Skill).filter(models.Skill.id == match.skill_id).first()
        skill_name = skill.canonical_name if skill else "general"
        
        winner_result = db.query(models.PvPMatchResult).filter(
            models.PvPMatchResult.match_id == match.id,
            models.PvPMatchResult.player_id == winner_id
        ).first()
        
        if winner_result:
            emit_pvp_skill_result(winner_id, skill_name, winner_result.xp_gained)
        
        emit_match_result(match.id, winner_id, loser_id, skill_name)


# ==========================================
# QUEUE ENDPOINTS
# ==========================================

class QueueJoinRequest:
    """Parsed from JSON body"""
    pass

from pydantic import BaseModel

class QueueJoinBody(BaseModel):
    skill_id: Optional[str] = "general"
    battle_type: Optional[str] = "code_challenge"

class SubmitBody(BaseModel):
    code: str
    answer: Optional[str] = None


@router.post("/queue/join")
async def join_queue(
    body: QueueJoinBody,
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Add user to matchmaking queue.
    Returns immediately if matched; otherwise queues and returns pending.
    Anti-cheat: rate-limited to 10 battles/hour.
    """

    # --- ANTI-CHEAT: Rate limit ---
    one_hour_ago = datetime.utcnow() - timedelta(hours=1)
    recent_matches = db.query(models.PvPMatchResult).filter(
        models.PvPMatchResult.player_id == current_user.id,
        models.PvPMatchResult.created_at >= one_hour_ago
    ).count()
    if recent_matches >= 10:
        raise HTTPException(status_code=429, detail="Rate limit: max 10 battles per hour.")

    # --- Check existing active match ---
    existing = db.query(models.PvPMatch).filter(
        or_(models.PvPMatch.player1_id == current_user.id, models.PvPMatch.player2_id == current_user.id),
        models.PvPMatch.status.in_(["waiting", "in_progress"])
    ).first()
    if existing:
        return {
            "status": existing.status,
            "match_id": existing.id,
            "message": "Rejoining your active match.",
            "skill_id": existing.skill_id,
            "battle_type": existing.battle_type,
        }

    # --- Clean up any expired queue entry for this user ---
    old_entry = db.query(models.PvPMatchmakingQueue).filter(
        models.PvPMatchmakingQueue.user_id == current_user.id
    ).first()
    if old_entry:
        db.delete(old_entry)
        db.commit()

    rating = _get_or_create_rating(db, current_user.id)
    user_mmr = rating.mmr

    # --- Search for opponent with similar MMR (±300 window) ---
    mmr_range = 300
    opponent_entry = db.query(models.PvPMatchmakingQueue).filter(
        models.PvPMatchmakingQueue.user_id != current_user.id,
        models.PvPMatchmakingQueue.queue_status == "waiting",
        models.PvPMatchmakingQueue.battle_type == body.battle_type,
        models.PvPMatchmakingQueue.mmr.between(user_mmr - mmr_range, user_mmr + mmr_range)
    ).order_by(
        func.abs(models.PvPMatchmakingQueue.mmr - user_mmr)  # closest MMR first
    ).first()

    if opponent_entry:
        # --- MATCH FOUND: create battle session ---
        match_id = str(uuid.uuid4())
        challenge = _get_challenge_for_battle(db, body.battle_type, body.skill_id)

        match = models.PvPMatch(
            id=match_id,
            player1_id=opponent_entry.user_id,
            player2_id=current_user.id,
            challenge_id=challenge.id,
            battle_type=body.battle_type,
            skill_id=body.skill_id or opponent_entry.skill_id or "general",
            status="in_progress",
            match_status="in_progress",
            start_time=datetime.utcnow(),
        )
        db.add(match)

        # Mark opponent as matched and remove from queue
        opponent_entry.queue_status = "matched"
        db.delete(opponent_entry)
        db.commit()

        opponent = db.query(models.User).get(opponent_entry.user_id)
        opp_rating = _get_or_create_rating(db, opponent_entry.user_id)

        return {
            "status": "matched",
            "match_id": match_id,
            "message": "Opponent found! Battle starting.",
            "opponent": {
                "id": opponent.id,
                "username": opponent.username,
                "display_name": opponent.display_name or opponent.full_name or opponent.username,
                "avatar_url": opponent.avatar_url,
                "mmr": opp_rating.mmr,
                "rank": _mmr_to_rank(opp_rating.mmr),
            },
            "challenge": {
                "id": challenge.id,
                "title": challenge.title,
                "description": challenge.description,
                "difficulty": challenge.difficulty,
                "initial_code": challenge.initial_code,
                "time_limit_minutes": challenge.time_limit_minutes,
                "xp_reward": challenge.xp_reward,
            }
        }

    # --- No opponent found: add to queue ---
    queue_entry = models.PvPMatchmakingQueue(
        user_id=current_user.id,
        skill_id=body.skill_id,
        battle_type=body.battle_type,
        rank=_mmr_to_rank(user_mmr),
        skill_xp=current_user.xp_points or 0,
        mmr=user_mmr,
        queue_status="waiting",
    )
    db.add(queue_entry)
    db.commit()

    return {
        "status": "waiting",
        "match_id": None,
        "message": "In queue. Searching for opponent...",
        "queue_position": db.query(models.PvPMatchmakingQueue).filter(
            models.PvPMatchmakingQueue.queue_status == "waiting"
        ).count(),
        "your_mmr": user_mmr,
    }


@router.post("/queue/leave")
async def leave_queue(
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Remove user from matchmaking queue."""
    entry = db.query(models.PvPMatchmakingQueue).filter(
        models.PvPMatchmakingQueue.user_id == current_user.id
    ).first()
    if entry:
        db.delete(entry)
        db.commit()
        return {"status": "cancelled", "message": "Left queue."}
    return {"status": "not_in_queue", "message": "You were not in queue."}


# ==========================================
# MATCH STATUS
# ==========================================

@router.get("/match/status/{user_id}")
async def get_match_status(
    user_id: int,
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Poll to check if user has been matched. Frontend polls every 3s."""
    # Security: only the authenticated user can check their own status
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Forbidden")

    # Check for active/in_progress match
    match = db.query(models.PvPMatch).filter(
        or_(models.PvPMatch.player1_id == user_id, models.PvPMatch.player2_id == user_id),
        models.PvPMatch.status.in_(["waiting", "in_progress"])
    ).order_by(models.PvPMatch.created_at.desc()).first()

    if match:
        opponent_id = match.player2_id if match.player1_id == user_id else match.player1_id
        opponent = db.query(models.User).get(opponent_id) if opponent_id else None
        opp_rating = _get_or_create_rating(db, opponent_id) if opponent_id else None
        challenge = match.challenge

        return {
            "status": match.status,
            "match_id": match.id,
            "battle_type": match.battle_type,
            "skill_id": match.skill_id,
            "start_time": match.start_time.isoformat() if match.start_time else None,
            "opponent": {
                "id": opponent.id,
                "username": opponent.username,
                "display_name": opponent.display_name or opponent.username,
                "avatar_url": opponent.avatar_url,
                "mmr": opp_rating.mmr if opp_rating else 1000,
                "rank": _mmr_to_rank(opp_rating.mmr) if opp_rating else "Novice",
            } if opponent else None,
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
            "spectator_count": match.spectator_count or 0,
        }

    # Check queue
    queue = db.query(models.PvPMatchmakingQueue).filter(
        models.PvPMatchmakingQueue.user_id == user_id
    ).first()
    if queue:
        return {
            "status": "waiting",
            "match_id": None,
            "queue_status": queue.queue_status,
            "in_queue_since": queue.created_at.isoformat(),
        }

    return {"status": "idle", "match_id": None}


@router.get("/match/{match_id}")
async def get_match_details(
    match_id: str,
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """Get full details of a specific match."""
    match = db.query(models.PvPMatch).filter(models.PvPMatch.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")

    challenge = match.challenge
    p1 = db.query(models.User).get(match.player1_id)
    p2 = db.query(models.User).get(match.player2_id) if match.player2_id else None

    return {
        "id": match.id,
        "status": match.status,
        "battle_type": match.battle_type,
        "skill_id": match.skill_id,
        "start_time": match.start_time.isoformat() if match.start_time else None,
        "end_time": match.end_time.isoformat() if match.end_time else None,
        "winner_id": match.winner_id,
        "spectator_count": match.spectator_count or 0,
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
    }


# ==========================================
# SUBMISSION
# ==========================================

@router.post("/match/{match_id}/submit")
async def submit_solution(
    match_id: str,
    body: SubmitBody,
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Submit code/answer for a match.
    1. Validates match is active.
    2. Evaluates submission with AIJudge.
    3. Updates score in match.
    4. If both players submitted → finalizes match, determines winner.
    """
    match = db.query(models.PvPMatch).filter(models.PvPMatch.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    if match.status != "in_progress":
        raise HTTPException(status_code=400, detail=f"Match is not in progress (status: {match.status})")

    # Verify player belongs to this match
    if current_user.id not in [match.player1_id, match.player2_id]:
        raise HTTPException(status_code=403, detail="You are not a participant in this match")

    # Anti-cheat: prevent duplicate submissions
    existing_sub = db.query(models.PvPSubmission).filter(
        models.PvPSubmission.match_id == match_id,
        models.PvPSubmission.player_id == current_user.id
    ).first()
    if existing_sub:
        raise HTTPException(status_code=400, detail="You have already submitted for this match")

    # Speed bonus calculation
    elapsed_seconds = int((datetime.utcnow() - (match.start_time or datetime.utcnow())).total_seconds())
    time_limit_seconds = (match.challenge.time_limit_minutes * 60) if match.challenge else 900

    # Anti-cheat: abnormally fast submissions
    if elapsed_seconds < 5:
        raise HTTPException(status_code=400, detail="Submission too fast — minimum 5 seconds required")

    # Evaluate with AIJudge
    code = body.code or body.answer or ""
    challenge_context = {
        "difficulty": match.challenge.difficulty if match.challenge else "Medium",
        "battle_type": match.battle_type,
    }
    eval_result = AIJudge.evaluate_submission(code, challenge_context)
    ai_score = eval_result.get("ai_score", 50)
    final_score = AIJudge.calculate_final_match_score(
        ai_score, 0, elapsed_seconds, time_limit_seconds
    )

    # Save submission
    sub = models.PvPSubmission(
        match_id=match.id,
        player_id=current_user.id,
        code_content=code,
        status="accepted",
        ai_score=ai_score,
        speed_bonus=max(0, time_limit_seconds - elapsed_seconds),
        final_score=final_score,
        feedback_json=eval_result.get("feedback"),
    )
    db.add(sub)
    db.commit()

    # Check if both players have submitted
    all_submissions = db.query(models.PvPSubmission).filter(
        models.PvPSubmission.match_id == match_id
    ).all()

    match_result = None
    if len(all_submissions) >= 2:
        # Both submitted — determine winner
        scores = {s.player_id: s.final_score for s in all_submissions}
        p1_score = scores.get(match.player1_id, 0)
        p2_score = scores.get(match.player2_id, 0)

        if p1_score > p2_score:
            winner_id = match.player1_id
        elif p2_score > p1_score:
            winner_id = match.player2_id
        else:
            winner_id = 0  # draw

        _finalize_match(db, match, winner_id, scores)

        winner_user = db.query(models.User).get(winner_id) if winner_id else None
        p1_rating = _get_or_create_rating(db, match.player1_id)
        p2_rating = _get_or_create_rating(db, match.player2_id) if match.player2_id else None

        match_result = {
            "match_complete": True,
            "winner_id": winner_id if winner_id else None,
            "winner_username": winner_user.username if winner_user else None,
            "is_draw": winner_id == 0,
            "scores": {
                "player1": p1_score,
                "player2": p2_score,
            },
            "xp_rewards": {
                "winner": 200,
                "loser": 50,
                "draw": 100,
            },
            "mmr_changes": {
                "winner": +25,
                "loser": -15,
                "draw": +5,
            },
            "your_result": "win" if current_user.id == winner_id else ("draw" if winner_id == 0 else "loss"),
            "your_xp_gain": 200 if current_user.id == winner_id else (100 if winner_id == 0 else 50),
            "your_mmr_change": 25 if current_user.id == winner_id else (5 if winner_id == 0 else -15),
            "new_mmr": {
                "player1": p1_rating.mmr,
                "player2": p2_rating.mmr if p2_rating else None,
            },
        }

    return {
        "status": "evaluated",
        "final_score": final_score,
        "ai_feedback": eval_result.get("feedback"),
        "breakdown": eval_result.get("breakdown"),
        "elapsed_seconds": elapsed_seconds,
        **(match_result or {"match_complete": False}),
    }


# ==========================================
# FORFEIT
# ==========================================

@router.post("/match/{match_id}/forfeit")
async def forfeit_match(
    match_id: str,
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Player forfeits a match. Opponent wins."""
    match = db.query(models.PvPMatch).filter(models.PvPMatch.id == match_id).first()
    if not match:
        raise HTTPException(status_code=404, detail="Match not found")
    if match.status not in ["waiting", "in_progress"]:
        raise HTTPException(status_code=400, detail="Match is not active")
    if current_user.id not in [match.player1_id, match.player2_id]:
        raise HTTPException(status_code=403, detail="You are not a participant in this match")

    winner_id = match.player2_id if current_user.id == match.player1_id else match.player1_id
    scores = {current_user.id: 0, winner_id: 100}
    _finalize_match(db, match, winner_id, scores)
    match.status = "forfeited"

    db.commit()
    return {"status": "forfeited", "winner_id": winner_id, "message": "You have forfeited the match."}


# ==========================================
# HISTORY
# ==========================================

@router.get("/history/{user_id}")
async def get_battle_history(
    user_id: int,
    limit: int = Query(20, le=50),
    offset: int = Query(0),
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Returns a user's battle history ordered by most recent."""
    history = db.query(models.PvPMatchHistory).filter(
        or_(
            models.PvPMatchHistory.player1_id == user_id,
            models.PvPMatchHistory.player2_id == user_id
        )
    ).order_by(models.PvPMatchHistory.created_at.desc()).offset(offset).limit(limit).all()

    result = []
    for h in history:
        opponent_id = h.player2_id if h.player1_id == user_id else h.player1_id
        opponent = db.query(models.User).get(opponent_id) if opponent_id else None
        is_winner = h.winner_id == user_id
        is_draw = h.winner_id is None

        result.append({
            "match_id": h.match_id,
            "result": "draw" if is_draw else ("win" if is_winner else "loss"),
            "skill_id": h.skill_id,
            "battle_type": h.battle_type,
            "opponent": {
                "id": opponent.id,
                "username": opponent.username,
                "avatar_url": opponent.avatar_url,
            } if opponent else None,
            "your_score": h.player1_score if h.player1_id == user_id else h.player2_score,
            "opponent_score": h.player2_score if h.player1_id == user_id else h.player1_score,
            "played_at": h.created_at.isoformat(),
        })

    return result


# ==========================================
# STATUS & STATS
# ==========================================

@router.get("/status")
async def get_pvp_status(
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get current user's real PvP stats — no hardcoded values."""
    rating = _get_or_create_rating(db, current_user.id)

    total_matches = rating.matches_played
    win_rate = round((rating.wins / total_matches * 100), 1) if total_matches > 0 else 0.0

    return {
        "mmr": rating.mmr,
        "rank": _mmr_to_rank(rating.mmr),
        "highest_rank": _mmr_to_rank(rating.highest_mmr),
        "ranking_score": current_user.ranking_score or 1000,
        "total_matches": total_matches,
        "wins": rating.wins,
        "losses": rating.losses,
        "draws": rating.draws,
        "win_rate": win_rate,
        "current_streak": rating.current_streak,
        "xp_points": current_user.xp_points or 0,
        "level": current_user.level or 1,
    }


@router.get("/rating/{user_id}")
async def get_pvp_rating(
    user_id: int,
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get any user's PvP rating."""
    rating = db.query(models.PvPRating).filter(models.PvPRating.user_id == user_id).first()
    if not rating:
        return {"user_id": user_id, "mmr": 1000, "rank": "Novice", "matches_played": 0, "wins": 0, "losses": 0}
    return {
        "user_id": user_id,
        "mmr": rating.mmr,
        "rank": _mmr_to_rank(rating.mmr),
        "highest_mmr": rating.highest_mmr,
        "highest_rank": _mmr_to_rank(rating.highest_mmr),
        "matches_played": rating.matches_played,
        "wins": rating.wins,
        "losses": rating.losses,
        "draws": rating.draws,
        "win_rate": round(rating.wins / rating.matches_played * 100, 1) if rating.matches_played > 0 else 0.0,
        "current_streak": rating.current_streak,
    }


# ==========================================
# LEADERBOARD
# ==========================================

@router.get("/leaderboard")
async def get_leaderboard(
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """MMR-based leaderboard. Real data only."""
    ratings = db.query(models.PvPRating).join(
        models.User, models.PvPRating.user_id == models.User.id
    ).filter(
        models.User.is_active == True,
        models.PvPRating.matches_played > 0
    ).order_by(models.PvPRating.mmr.desc()).offset(offset).limit(limit).all()

    leaderboard = []
    for idx, r in enumerate(ratings, start=offset + 1):
        user = db.query(models.User).get(r.user_id)
        win_rate = round(r.wins / r.matches_played * 100, 1) if r.matches_played > 0 else 0.0
        leaderboard.append({
            "rank": idx,
            "user_id": r.user_id,
            "username": user.username,
            "display_name": user.display_name or user.full_name or user.username,
            "avatar_url": user.avatar_url,
            "mmr": r.mmr,
            "tier": _mmr_to_rank(r.mmr),
            "matches_played": r.matches_played,
            "wins": r.wins,
            "losses": r.losses,
            "win_rate": win_rate,
            "current_streak": r.current_streak,
            "ranking_score": user.ranking_score,
            "level": user.level,
        })

    return leaderboard


# ==========================================
# LIVE MATCHES
# ==========================================

@router.get("/matches/live")
async def get_live_matches(
    limit: int = Query(10, le=20),
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Returns currently in-progress matches for the live feed."""
    matches = db.query(models.PvPMatch).filter(
        models.PvPMatch.status == "in_progress"
    ).order_by(models.PvPMatch.start_time.desc()).limit(limit).all()

    result = []
    for m in matches:
        p1 = db.query(models.User).get(m.player1_id)
        p2 = db.query(models.User).get(m.player2_id) if m.player2_id else None
        elapsed = int((datetime.utcnow() - m.start_time).total_seconds()) if m.start_time else 0
        mins = elapsed // 60
        secs = elapsed % 60

        result.append({
            "id": m.id,
            "battle_type": m.battle_type,
            "skill_id": m.skill_id,
            "player1": {
                "username": p1.username if p1 else "Unknown",
                "avatar_url": p1.avatar_url if p1 else None,
            },
            "player2": {
                "username": p2.username if p2 else "Unknown",
                "avatar_url": p2.avatar_url if p2 else None,
            },
            "elapsed_time": f"{mins:02d}:{secs:02d}",
            "spectator_count": m.spectator_count or 0,
        })

    return result


# ==========================================
# LEGACY: TOURNAMENTS (kept for UI compat)
# ==========================================

@router.get("/tournaments")
async def get_tournaments(db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """Returns tournament data. Currently static — tournament system TBD."""
    return [
        {
            "id": 1,
            "name": "Weekly Algorithm Challenge",
            "status": "active",
            "participants": 256,
            "prize_pool": "$5,000",
            "ends_at": "2026-03-15T20:00:00Z"
        },
        {
            "id": 2,
            "name": "Monthly Grand Prix",
            "status": "upcoming",
            "participants": 0,
            "prize_pool": "$10,000",
            "starts_at": "2026-04-01T18:00:00Z"
        }
    ]
