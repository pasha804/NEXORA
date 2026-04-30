from datetime import datetime, timedelta
from typing import List, Optional

from fastapi import FastAPI, Depends, HTTPException, Header
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func

from common.database import get_db, engine
from common.models import (
    Base,
    User,
    UserSkill,
    SkillBadge,
    SkillEndorsement,
    SkillTrendingData,
    UserSecurityScore,
    Skill,
    SkillCategory,
    SkillProof,
    UserRank,
    SkillLeaderboard,
    SkillRelationship,
    SkillActivityLog,
)
from common.auth import get_current_user_from_token

from redis import asyncio as aioredis
import redis as redis_sync
import asyncio
import json
import os


Base.metadata.create_all(bind=engine)

app = FastAPI(title="Nexora Skill Intelligence Service", root_path="/skills")

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
MAX_ENDORSEMENTS_PER_DAY = 25
_cache_redis: redis_sync.Redis | None = None


def _get_cache_redis() -> redis_sync.Redis | None:
    global _cache_redis
    if _cache_redis is None:
        try:
            _cache_redis = redis_sync.from_url(REDIS_URL)
        except Exception:
            _cache_redis = None
    return _cache_redis


class SkillBadgeOut(BaseModel):
    badge_id: int
    user_id: int
    skill_name: str
    verification_method: Optional[str] = None
    verification_score: float
    date_awarded: datetime


class SkillProgressOut(BaseModel):
    skill_name: str
    skill_xp: int
    skill_level: int
    endorsement_count: int
    verified: bool
    last_updated: Optional[datetime] = None


class SkillEndorseRequest(BaseModel):
    target_user_id: int
    skill_name: str
    action: str = "add"  # "add" or "remove"


class SkillEndorsementOut(BaseModel):
    endorsement_id: int
    endorser_user_id: int
    target_user_id: int
    skill_name: str
    timestamp: datetime


class SkillTrendingOut(BaseModel):
    skill_name: str
    trend_score: float
    engagement_volume: int
    growth_rate: float


class SkillVerifyRequest(BaseModel):
    user_id: int
    skill_name: str
    method: str = "auto"
    ai_score: Optional[float] = None


class SkillRecommendation(BaseModel):
    skill_name: str
    reason: str
    source: str  # similarity | trending | verification
    suggested_level: Optional[str] = None


class SkillIntelligenceOut(BaseModel):
    user_id: int
    skills_to_learn: List[SkillRecommendation]
    skills_to_verify: List[SkillRecommendation]
    trending_skills: List[SkillTrendingOut]


@app.on_event("startup")
async def startup_event():
    """
    Background listener for XP and trending events.
    Listens on the shared 'nexora_events' Redis channel.
    """
    asyncio.create_task(redis_listener())
    asyncio.create_task(skill_decay_scheduler())


async def redis_listener():
    redis = await aioredis.from_url(REDIS_URL, decode_responses=True)
    pubsub = redis.pubsub()
    await pubsub.subscribe("nexora_events")

    async for message in pubsub.listen():
        if message["type"] != "message":
            continue
        try:
            payload = json.loads(message["data"])
            event = payload.get("event")
            data = payload.get("data") or {}

            if event == "content_created":
                await handle_content_created_event(data)
            elif event == "pvp_skill_result":
                await handle_pvp_result_event(data)
        except Exception as exc:
            print(f"[skill_intelligence] Failed to process event: {exc}")


async def handle_content_created_event(data: dict):
    """
    Grant XP and adjust trending for tutorial / content posts tagged with skills.
    Expected payload:
    { "user_id": int, "skill_tags": [str] }
    """
    user_id = data.get("user_id")
    skill_tags: List[str] = data.get("skill_tags") or []
    if not user_id or not skill_tags:
        return

    db = next(get_db())
    try:
        for skill in skill_tags:
            _apply_xp(db, user_id, skill_name=skill, amount=100, reason="content_created")
            _bump_trending(db, skill_name=skill, engagement_delta=1)
        db.commit()
    finally:
        db.close()


async def handle_pvp_result_event(data: dict):
    """
    Grant XP for PvP outcomes in a given skill category.
    Expected payload:
    { "winner_id": int, "loser_id": int, "skill_type": str }
    """
    winner_id = data.get("winner_id")
    skill_type = data.get("skill_type")
    if not winner_id or not skill_type:
        return

    db = next(get_db())
    try:
        _apply_xp(db, winner_id, skill_name=skill_type, amount=200, reason="pvp_win")
        _bump_trending(db, skill_name=skill_type, engagement_delta=2)
        db.commit()
    finally:
        db.close()


async def skill_decay_scheduler():
    """
    Periodic task that applies XP decay for inactive skills.
    If a skill has had no updates for 90 days, reduce XP by 5%.
    """
    # Run once per day
    while True:
        try:
            db = next(get_db())
            cutoff = datetime.utcnow() - timedelta(days=90)
            stale_skills = (
                db.query(UserSkill)
                .filter(UserSkill.last_updated != None)
                .filter(UserSkill.last_updated < cutoff)
                .all()
            )
            for s in stale_skills:
                if s.xp > 0:
                    new_xp = int(s.xp * 0.95)
                    if new_xp != s.xp:
                        s.xp = new_xp
                        # Recompute level after decay
                        s.skill_level = max(1, min(5, (s.xp // 1000) + 1))
                        _log_skill_activity(
                            db,
                            user_id=s.user_id,
                            action_type="xp_decay",
                            skill=_resolve_or_create_skill(db, s.skill_name),
                            metadata={"new_xp": new_xp},
                        )
                        _update_user_rank(db, s.user_id)
            db.commit()
            db.close()
        except Exception as exc:
            print(f"[skill_intelligence] skill decay job failed: {exc}")

        # Sleep ~24h
        await asyncio.sleep(24 * 60 * 60)


def _resolve_or_create_skill(db: Session, raw_name: str) -> Skill:
    """
    Normalize a raw skill string into a canonical Skill row.
    Uses a simple mapping for common technologies and falls back to
    the provided name if no mapping is found.
    """
    if not raw_name:
        raise ValueError("skill_name is required")
    key = raw_name.strip().lower()

    # Basic normalization map (can be extended or moved to config)
    normalization_map = {
        "react": "React.js",
        "reactjs": "React.js",
        "react.js": "React.js",
        "node": "Node.js",
        "nodejs": "Node.js",
        "node.js": "Node.js",
        "python": "Python",
    }
    canonical_name = normalization_map.get(key, raw_name.strip())

    skill = (
        db.query(Skill)
        .filter(Skill.canonical_name == canonical_name)
        .first()
    )
    if skill:
        return skill

    # Optional category inference
    default_category = None
    if canonical_name.lower().startswith(("react", "next.js", "vue", "angular")):
        default_category = "Frontend"
    elif canonical_name.lower() in {"python", "node.js", "django", "fastapi"}:
        default_category = "Backend"
    elif "ml" in canonical_name.lower() or "ai" in canonical_name.lower():
        default_category = "Artificial Intelligence"

    category_id = None
    if default_category:
        category = (
            db.query(SkillCategory)
            .filter(SkillCategory.category_name == default_category)
            .first()
        )
        if not category:
            category = SkillCategory(category_name=default_category)
            db.add(category)
            db.flush()
        category_id = category.id

    skill = Skill(
        canonical_name=canonical_name,
        category_id=category_id,
        aliases=[key] if key != canonical_name.lower() else [key],
    )
    db.add(skill)
    db.flush()
    return skill


def _update_user_rank(db: Session, user_id: int) -> None:
    """
    Aggregate total_skill_xp from UserSkill and update UserRank + UserSocialStats.rank_level.
    """
    from sqlalchemy import func as _func

    total_xp = (
        db.query(_func.coalesce(_func.sum(UserSkill.xp), 0))
        .filter(UserSkill.user_id == user_id)
        .scalar()
    )
    rank_row = db.query(UserRank).filter(UserRank.user_id == user_id).first()
    if not rank_row:
        rank_row = UserRank(user_id=user_id)
        db.add(rank_row)

    rank_row.total_skill_xp = int(total_xp or 0)

    xp = rank_row.total_skill_xp
    # Simple tier thresholds; can be tuned later
    if xp >= 100_000:
        tier = "Legend"
    elif xp >= 60_000:
        tier = "Grandmaster"
    elif xp >= 35_000:
        tier = "Master"
    elif xp >= 20_000:
        tier = "Expert"
    elif xp >= 10_000:
        tier = "Advanced"
    elif xp >= 5_000:
        tier = "Intermediate"
    elif xp >= 1_000:
        tier = "Apprentice"
    else:
        tier = "Beginner"

    rank_row.rank = tier
    rank_row.rank_points = xp

    # Mirror into UserSocialStats.rank_level when present
    stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == user_id).first()
    if stats:
        stats.rank_level = tier


def _log_skill_activity(
    db: Session,
    user_id: int,
    action_type: str,
    skill: Skill | None = None,
    metadata: Optional[dict] = None,
) -> None:
    """
    Append a row to the skill activity log for timeline rendering.
    """
    entry = SkillActivityLog(
        user_id=user_id,
        action_type=action_type,
        skill_id=skill.id if skill else None,
        activity_metadata=metadata or {},
    )
    db.add(entry)


def _apply_xp(db: Session, user_id: int, skill_name: str, amount: int, reason: str) -> None:
    # Normalize / resolve Skill registry entry
    skill = _resolve_or_create_skill(db, skill_name)

    user_skill = (
        db.query(UserSkill)
        .filter(UserSkill.user_id == user_id, UserSkill.skill_id == skill.id)
        .first()
    )
    user_skill = (
        db.query(UserSkill)
        .filter(UserSkill.user_id == user_id, UserSkill.skill_name == skill_name)
        .first()
    )
    is_new = False
    if not user_skill:
        user_skill = UserSkill(
            user_id=user_id,
            skill_id=skill.id,
            skill_name=skill.canonical_name,
            skill_level=1,
            xp=0,
            skill_integrity_score=1.0,
        )
        db.add(user_skill)
        db.flush()
        is_new = True

    # Re-sync normalized name in case mapping has changed
    user_skill.skill_id = skill.id
    user_skill.skill_name = skill.canonical_name

    # Integrity-based XP multiplier; also factor in global security signal
    integrity = user_skill.skill_integrity_score or 1.0
    security = db.query(UserSecurityScore).filter(UserSecurityScore.user_id == user_id).first()
    if security:
        penalty = max(security.bot_probability or 0.0, security.spam_probability or 0.0)
        if penalty > 0.8:
            integrity *= 0.5
        elif penalty > 0.5:
            integrity *= 0.75

    final_amount = int(amount * max(0.1, min(1.0, integrity)))
    user_skill.xp += final_amount

    # Simple level curve: every 1000 XP → +1 level (capped at 5 for UI)
    new_level = max(1, min(5, (user_skill.xp // 1000) + 1))
    user_skill.skill_level = new_level

    # New skill adoption slightly boosts trending
    if is_new:
        _bump_trending(db, skill_name=skill.canonical_name, engagement_delta=1)

    # Update global rank aggregates
    _update_user_rank(db, user_id)

    # Log activity for timeline
    _log_skill_activity(
        db,
        user_id=user_id,
        action_type="xp_gain",
        skill=skill,
        metadata={"amount": final_amount, "reason": reason},
    )


def _bump_trending(db: Session, skill_name: str, engagement_delta: int) -> None:
    skill = _resolve_or_create_skill(db, skill_name)
    record = (
        db.query(SkillTrendingData)
        .filter(SkillTrendingData.skill_id == skill.id)
        .first()
    )
    now = datetime.utcnow()
    if not record:
        record = SkillTrendingData(
            skill_id=skill.id,
            skill_name=skill.canonical_name,
            trend_score=float(engagement_delta),
            engagement_volume=engagement_delta,
            growth_rate=0.0,
            window_start=now - timedelta(hours=1),
            window_end=now,
        )
        db.add(record)
        return

    record.engagement_volume += engagement_delta
    # Lightweight trend score heuristic
    record.trend_score = record.trend_score * 0.9 + engagement_delta * 1.5
    record.growth_rate = min(
        1.0,
        record.trend_score / max(1.0, float(record.engagement_volume)),
    )
    record.window_end = now


def _get_current_user_id(authorization: Optional[str]) -> int:
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    token = authorization.replace("Bearer ", "")
    user_id = get_current_user_from_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user_id


@app.get("/health")
def health():
    return {"status": "ok", "service": "skill-intelligence"}


@app.get("/badges/{user_id}", response_model=List[SkillBadgeOut])
def get_skill_badges(user_id: int, db: Session = Depends(get_db)):
    badges = (
        db.query(SkillBadge)
        .filter(SkillBadge.user_id == user_id)
        .order_by(SkillBadge.date_awarded.desc())
        .all()
    )
    return [
        SkillBadgeOut(
            badge_id=b.id,
            user_id=b.user_id,
            skill_name=b.skill_name,
            verification_method=b.verification_method,
            verification_score=b.verification_score or 0.0,
            date_awarded=b.date_awarded or b.issued_at,
        )
        for b in badges
    ]


@app.get("/progression/{user_id}", response_model=List[SkillProgressOut])
def get_skill_progression(user_id: int, db: Session = Depends(get_db)):
    cache = _get_cache_redis()
    cache_key = f"skills:summary:{user_id}"
    if cache:
        try:
            cached = cache.get(cache_key)
            if cached:
                import json as _json
                return _json.loads(cached)
        except Exception:
            pass

    skills = (
        db.query(UserSkill)
        .filter(UserSkill.user_id == user_id)
        .order_by(UserSkill.xp.desc())
        .all()
    )
    result = [
        SkillProgressOut(
            skill_name=s.skill_name,
            skill_xp=s.xp,
            skill_level=s.skill_level,
            endorsement_count=s.endorsement_count,
            verified=bool(getattr(s, "verified", False)),
            last_updated=s.last_updated,
        )
        for s in skills
    ]

    if cache:
        try:
            import json as _json
            cache.setex(cache_key, 60, _json.dumps([r.model_dump() for r in result]))
        except Exception:
            pass

    return result


@app.get("/endorsements/{user_id}", response_model=List[SkillEndorsementOut])
def get_endorsements(user_id: int, db: Session = Depends(get_db)):
    cache = _get_cache_redis()
    cache_key = f"skills:endorsements:{user_id}"
    if cache:
        try:
            import json as _json
            cached = cache.get(cache_key)
            if cached:
                return _json.loads(cached)
        except Exception:
            pass

    rows = (
        db.query(SkillEndorsement)
        .filter(SkillEndorsement.target_user_id == user_id)
        .order_by(SkillEndorsement.created_at.desc())
        .all()
    )
    result = [
        SkillEndorsementOut(
            endorsement_id=r.id,
            endorser_user_id=r.endorser_user_id,
            target_user_id=r.target_user_id,
            skill_name=r.skill_name,
            timestamp=r.created_at,
        )
        for r in rows
    ]

    if cache:
        try:
            import json as _json
            cache.setex(cache_key, 60, _json.dumps([r.model_dump() for r in result]))
        except Exception:
            pass

    return result


@app.post("/endorse", response_model=SkillEndorsementOut)
def endorse_skill(
    payload: SkillEndorseRequest,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    """
    Toggle an endorsement for a user's skill.
    - Only followers can endorse.
    - Per-endorser daily rate limit.
    - No self-endorsement.
    """
    from common.models import Follower

    endorser_id = _get_current_user_id(authorization)

    if endorser_id == payload.target_user_id:
        raise HTTPException(status_code=400, detail="You cannot endorse yourself")

    # Only followers can endorse
    is_follower = (
        db.query(Follower)
        .filter(
            Follower.follower_id == endorser_id,
            Follower.following_id == payload.target_user_id,
        )
        .first()
        is not None
    )
    if not is_follower:
        raise HTTPException(
            status_code=403, detail="You must follow a user before endorsing them"
        )

    # Basic bot / spam protection using security score heuristics
    security = (
        db.query(UserSecurityScore)
        .filter(UserSecurityScore.user_id == endorser_id)
        .first()
    )
    if security:
        if security.is_shadowbanned:
            raise HTTPException(
                status_code=403,
                detail="Your account is restricted from endorsing skills",
            )
        if (security.bot_probability or 0.0) > 0.9 or (security.spam_probability or 0.0) > 0.9:
            raise HTTPException(
                status_code=403,
                detail="Endorsements from this account are temporarily limited",
            )

    # Daily rate limit
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    endorsements_today = (
        db.query(func.count(SkillEndorsement.id))
        .filter(
            SkillEndorsement.endorser_user_id == endorser_id,
            SkillEndorsement.created_at >= today_start,
        )
        .scalar()
    )
    if endorsements_today >= MAX_ENDORSEMENTS_PER_DAY:
        raise HTTPException(
            status_code=429,
            detail="Daily endorsement limit reached. Try again tomorrow.",
        )

    # Toggle behavior
    existing = (
        db.query(SkillEndorsement)
        .filter(
            SkillEndorsement.endorser_user_id == endorser_id,
            SkillEndorsement.target_user_id == payload.target_user_id,
            SkillEndorsement.skill_name == payload.skill_name,
        )
        .first()
    )

    if payload.action == "remove":
        if existing:
            db.delete(existing)
            _recalculate_endorsement_count(
                db, user_id=payload.target_user_id, skill_name=payload.skill_name
            )
            db.commit()

            # Invalidate caches
            cache = _get_cache_redis()
            if cache:
                try:
                    cache.delete(f"skills:summary:{payload.target_user_id}")
                    cache.delete(f"skills:endorsements:{payload.target_user_id}")
                except Exception:
                    pass

            return SkillEndorsementOut(
                endorsement_id=existing.id,
                endorser_user_id=existing.endorser_user_id,
                target_user_id=existing.target_user_id,
                skill_name=existing.skill_name,
                timestamp=existing.created_at,
            )
        raise HTTPException(status_code=404, detail="Endorsement not found for removal")

    # "add" behavior – idempotent: if exists, just return it
    if existing:
        return SkillEndorsementOut(
            endorsement_id=existing.id,
            endorser_user_id=existing.endorser_user_id,
            target_user_id=existing.target_user_id,
            skill_name=existing.skill_name,
            timestamp=existing.created_at,
        )

    endorsement = SkillEndorsement(
        endorser_user_id=endorser_id,
        target_user_id=payload.target_user_id,
        skill_name=payload.skill_name,
    )
    db.add(endorsement)
    db.flush()

    _recalculate_endorsement_count(
        db, user_id=payload.target_user_id, skill_name=payload.skill_name
    )

    db.commit()

    # Trend boost from social proof
    _bump_trending(db, skill_name=payload.skill_name, engagement_delta=1)

    # Invalidate caches
    cache = _get_cache_redis()
    if cache:
        try:
            cache.delete(f"skills:summary:{payload.target_user_id}")
            cache.delete(f"skills:endorsements:{payload.target_user_id}")
        except Exception:
            pass

    # Log received endorsement for timeline
    _log_skill_activity(
        db,
        user_id=payload.target_user_id,
        action_type="endorsement_received",
        skill=_resolve_or_create_skill(db, payload.skill_name),
        metadata={"endorser_user_id": endorser_id},
    )

    return SkillEndorsementOut(
        endorsement_id=endorsement.id,
        endorser_user_id=endorsement.endorser_user_id,
        target_user_id=endorsement.target_user_id,
        skill_name=endorsement.skill_name,
        timestamp=endorsement.created_at,
    )


def _recalculate_endorsement_count(db: Session, user_id: int, skill_name: str) -> None:
    count = (
        db.query(func.count(SkillEndorsement.id))
        .filter(
            SkillEndorsement.target_user_id == user_id,
            SkillEndorsement.skill_name == skill_name,
        )
        .scalar()
    )
    user_skill = (
        db.query(UserSkill)
        .filter(UserSkill.user_id == user_id, UserSkill.skill_name == skill_name)
        .first()
    )
    if not user_skill:
        user_skill = UserSkill(
            user_id=user_id,
            skill_name=skill_name,
            skill_level=1,
            xp=0,
            endorsement_count=count,
        )
        db.add(user_skill)
    else:
        user_skill.endorsement_count = count


@app.get("/trending", response_model=List[SkillTrendingOut])
def get_trending_skills(limit: int = 10, db: Session = Depends(get_db)):
    """
    Returns globally trending skills based on the SkillTrendingData table.
    """
    cache = _get_cache_redis()
    cache_key = f"skills:trending:{limit}"
    if cache:
        try:
            import json as _json
            cached = cache.get(cache_key)
            if cached:
                return _json.loads(cached)
        except Exception:
            pass

    items = (
        db.query(SkillTrendingData)
        .order_by(SkillTrendingData.trend_score.desc())
        .limit(limit)
        .all()
    )
    result = [
        SkillTrendingOut(
            skill_name=i.skill_name,
            trend_score=i.trend_score,
            engagement_volume=i.engagement_volume,
            growth_rate=i.growth_rate,
        )
        for i in items
    ]

    if cache:
        try:
            import json as _json
            cache.setex(cache_key, 60, _json.dumps([r.model_dump() for r in result]))
        except Exception:
            pass

    return result


@app.post("/verify")
def verify_skill_endpoint(payload: SkillVerifyRequest, db: Session = Depends(get_db)):
    """
    High-level verification entrypoint used by other services or admin tools.
    Delegates to the core verification logic in the verification service.
    """
    from services.verification.logic import verify_skill_logic

    success = verify_skill_logic(
        user_id=payload.user_id,
        skill_name=payload.skill_name,
        db=db,
        method=payload.method,
        ai_score=payload.ai_score,
    )
    if not success:
        raise HTTPException(status_code=400, detail="Verification requirements not met")
    # Log verification event
    skill = _resolve_or_create_skill(db, payload.skill_name)
    _log_skill_activity(
        db,
        user_id=payload.user_id,
        action_type="verified",
        skill=skill,
        metadata={"method": payload.method},
    )
    db.commit()
    return {"status": "verified"}


@app.get("/categories", response_model=List[dict])
def get_skill_categories(db: Session = Depends(get_db)):
    """
    List all skill categories available in the registry.
    """
    categories = db.query(SkillCategory).order_by(SkillCategory.category_name.asc()).all()
    return [
        {
            "id": c.id,
            "category_name": c.category_name,
            "description": c.description,
        }
        for c in categories
    ]


@app.get("/intelligence/{user_id}", response_model=SkillIntelligenceOut)
def get_skill_intelligence(user_id: int, db: Session = Depends(get_db)):
    """
    AI skill intelligence overview for a user.

    - Clusters skills and suggests adjacent skills to learn.
    - Surfaces skills that are strong enough to verify.
    - Returns the current global trending skills.
    """
    user_skills = (
        db.query(UserSkill)
        .filter(UserSkill.user_id == user_id)
        .order_by(UserSkill.xp.desc())
        .all()
    )
    trending_raw = (
        db.query(SkillTrendingData)
        .order_by(SkillTrendingData.trend_score.desc())
        .limit(10)
        .all()
    )

    skill_name_set = {s.skill_name.lower() for s in user_skills}

    # Lightweight similarity graph for common tech stacks
    adjacency_map: dict[str, list[str]] = {
        "react": ["Next.js", "TypeScript", "Framer Motion"],
        "node": ["TypeScript", "NestJS"],
        "python": ["FastAPI", "Django", "PyTorch"],
        "javascript": ["TypeScript", "React"],
        "ui design": ["Figma", "Framer"],
        "tailwind": ["Radix UI", "Headless UI"],
    }

    recommendations_map: dict[str, SkillRecommendation] = {}

    for s in user_skills:
        base = s.skill_name.lower()
        related = adjacency_map.get(base, [])
        for rel in related:
            key = rel.lower()
            if key in skill_name_set:
                continue
            if key in recommendations_map:
                continue
            recommendations_map[key] = SkillRecommendation(
                skill_name=rel,
                reason=f"Adjacent to your existing skill '{s.skill_name}'",
                source="similarity",
                suggested_level="Beginner",
            )

    # Add trending skills the user does not yet have
    for t in trending_raw:
        key = t.skill_name.lower()
        if key in skill_name_set:
            continue
        if key in recommendations_map:
            # Upgrade the reason to include market trend
            rec = recommendations_map[key]
            rec.reason += " • Highly trending across Nexora"
            continue
        recommendations_map[key] = SkillRecommendation(
            skill_name=t.skill_name,
            reason="High growth and engagement across Nexora",
            source="trending",
            suggested_level="Beginner",
        )

    # Skill graph relationships from DB
    if user_skills:
        skill_ids = [s.skill_id for s in user_skills if s.skill_id]
        if skill_ids:
            rels = (
                db.query(SkillRelationship, Skill)
                .join(Skill, Skill.id == SkillRelationship.related_skill_id)
                .filter(SkillRelationship.skill_id.in_(skill_ids))
                .all()
            )
            for rel, related_skill in rels:
                key = related_skill.canonical_name.lower()
                if key in skill_name_set:
                    continue
                if key in recommendations_map:
                    continue
                recommendations_map[key] = SkillRecommendation(
                    skill_name=related_skill.canonical_name,
                    reason="Strongly related to your existing skills in the graph",
                    source="similarity",
                    suggested_level="Beginner",
                )

    skills_to_learn = list(recommendations_map.values())

    # Skills that look ready for verification (strong XP / endorsements but not yet verified)
    skills_to_verify: List[SkillRecommendation] = []
    for s in user_skills:
        if getattr(s, "verified", False):
            continue
        if (s.xp or 0) >= 1500 or (s.endorsement_count or 0) >= 3:
            skills_to_verify.append(
                SkillRecommendation(
                    skill_name=s.skill_name,
                    reason="High XP and endorsements — good candidate for verification",
                    source="verification",
                    suggested_level="Advanced",
                )
            )

    trending_skills = [
        SkillTrendingOut(
            skill_name=i.skill_name,
            trend_score=i.trend_score,
            engagement_volume=i.engagement_volume,
            growth_rate=i.growth_rate,
        )
        for i in trending_raw
    ]

    return SkillIntelligenceOut(
        user_id=user_id,
        skills_to_learn=skills_to_learn,
        skills_to_verify=skills_to_verify,
        trending_skills=trending_skills,
    )


@app.get("/recommendations/{user_id}", response_model=List[SkillRecommendation])
def get_skill_recommendations(user_id: int, db: Session = Depends(get_db)):
    """
    Convenience endpoint that returns only the recommended skills to learn for a user.
    """
    summary = get_skill_intelligence(user_id, db)
    return summary.skills_to_learn


@app.post("/proof")
def add_skill_proof(
    payload: dict,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None),
):
    """
    Attach a proof to one of the user's skills.
    Expected body:
    {
      "skill_name": "React",
      "proof_type": "github" | "portfolio" | ...,
      "proof_url": "...",
      "description": "..."
    }
    """
    if not authorization:
        raise HTTPException(status_code=401, detail="Missing Authorization header")
    user_id = _get_current_user_id(authorization)

    skill_name = payload.get("skill_name")
    proof_type = payload.get("proof_type")
    proof_url = payload.get("proof_url")
    description = payload.get("description")

    if not skill_name or not proof_type or not proof_url:
        raise HTTPException(status_code=400, detail="skill_name, proof_type and proof_url are required")

    skill = _resolve_or_create_skill(db, skill_name)

    proof = SkillProof(
        user_id=user_id,
        skill_id=skill.id,
        proof_type=proof_type,
        proof_url=proof_url,
        description=description,
    )
    db.add(proof)
    _log_skill_activity(
        db,
        user_id=user_id,
        action_type="proof_added",
        skill=skill,
        metadata={"proof_type": proof_type},
    )
    db.commit()
    return {"status": "ok", "id": proof.id}


@app.get("/leaderboard/{skill}", response_model=List[dict])
def get_skill_leaderboard(skill: str, limit: int = 20, db: Session = Depends(get_db)):
    """
    Global leaderboard for a given skill (by name or alias).
    Returns top users with XP, verification and endorsement counts.
    """
    cache = _get_cache_redis()
    skill_obj = _resolve_or_create_skill(db, skill)
    cache_key = f"skills:leaderboard:{skill_obj.id}:{limit}"
    if cache:
        try:
            import json as _json
            cached = cache.get(cache_key)
            if cached:
                return _json.loads(cached)
        except Exception:
            pass

    # Build leaderboard from UserSkill
    rows = (
        db.query(UserSkill, User)
        .join(User, User.id == UserSkill.user_id)
        .filter(UserSkill.skill_id == skill_obj.id)
        .order_by(UserSkill.xp.desc())
        .limit(limit)
        .all()
    )

    result: List[dict] = []
    position = 1
    for us, user in rows:
        badge = (
            db.query(SkillBadge)
            .filter(SkillBadge.user_id == user.id, SkillBadge.skill_name == us.skill_name)
            .first()
        )
        result.append(
            {
                "rank_position": position,
                "user_id": user.id,
                "username": user.username,
                "display_name": user.display_name,
                "skill_name": us.skill_name,
                "skill_xp": us.xp,
                "endorsement_count": us.endorsement_count,
                "verified": bool(us.verified or badge),
            }
        )
        position += 1

    # Persist snapshot into SQL table
    # (this can be used for offline analytics)
    db.query(SkillLeaderboard).filter(SkillLeaderboard.skill_id == skill_obj.id).delete()
    for entry in result:
        db.add(
            SkillLeaderboard(
                skill_id=skill_obj.id,
                user_id=entry["user_id"],
                skill_xp=entry["skill_xp"],
                rank_position=entry["rank_position"],
            )
        )
    db.commit()

    if cache:
        try:
            import json as _json
            cache.setex(cache_key, 60, _json.dumps(result))
        except Exception:
            pass

    return result


@app.get("/activity/{user_id}", response_model=List[dict])
def get_skill_activity(user_id: int, db: Session = Depends(get_db)):
    """
    Return the user's skill activity timeline.
    """
    entries = (
        db.query(SkillActivityLog, Skill.canonical_name)
        .outerjoin(Skill, Skill.id == SkillActivityLog.skill_id)
        .filter(SkillActivityLog.user_id == user_id)
        .order_by(SkillActivityLog.created_at.desc())
        .limit(100)
        .all()
    )
    timeline: List[dict] = []
    for entry, skill_name in entries:
        timeline.append(
            {
                "id": entry.id,
                "user_id": entry.user_id,
                "action_type": entry.action_type,
                "skill_name": skill_name,
                "metadata": entry.activity_metadata,
                "created_at": entry.created_at,
            }
        )
    return timeline


@app.get("/compare/{user_a}/{user_b}", response_model=dict)
def compare_users_skills(user_a: int, user_b: int, db: Session = Depends(get_db)):
    """
    Compare two users' skills, XP, endorsements, and verification status.
    """
    skills_a = db.query(UserSkill).filter(UserSkill.user_id == user_a).all()
    skills_b = db.query(UserSkill).filter(UserSkill.user_id == user_b).all()

    by_name_a = {s.skill_name.lower(): s for s in skills_a}
    by_name_b = {s.skill_name.lower(): s for s in skills_b}

    all_names = sorted(set(by_name_a.keys()) | set(by_name_b.keys()))

    comparison: List[dict] = []
    total_xp_a = 0
    total_xp_b = 0

    for name in all_names:
        sa = by_name_a.get(name)
        sb = by_name_b.get(name)
        xp_a = sa.xp if sa else 0
        xp_b = sb.xp if sb else 0
        total_xp_a += xp_a
        total_xp_b += xp_b
        comparison.append(
            {
                "skill_name": sa.skill_name if sa else (sb.skill_name if sb else name),
                "user_a": {
                    "xp": xp_a,
                    "level": sa.skill_level if sa else 0,
                    "endorsements": sa.endorsement_count if sa else 0,
                    "verified": bool(sa.verified) if sa else False,
                },
                "user_b": {
                    "xp": xp_b,
                    "level": sb.skill_level if sb else 0,
                    "endorsements": sb.endorsement_count if sb else 0,
                    "verified": bool(sb.verified) if sb else False,
                },
                "xp_diff": xp_a - xp_b,
            }
        )

    return {
        "user_a": user_a,
        "user_b": user_b,
        "total_xp_a": total_xp_a,
        "total_xp_b": total_xp_b,
        "xp_diff": total_xp_a - total_xp_b,
        "skills": comparison,
    }

