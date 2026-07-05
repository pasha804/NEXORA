from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from common.database import get_db
from common import models
import auth as auth_module
from schemas import _level_to_rank
from typing import List, Dict, Any, Optional

router = APIRouter(prefix="/ranking", tags=["ranking"])

def _mmr_to_rank(mmr: int) -> str:
    if mmr >= 4200: return "Grandmaster"
    if mmr >= 4000: return "Master V"
    if mmr >= 3800: return "Master IV"
    if mmr >= 3600: return "Master III"
    if mmr >= 3400: return "Master II"
    if mmr >= 3200: return "Master I"
    if mmr >= 3000: return "Heroic V"
    if mmr >= 2800: return "Heroic IV"
    if mmr >= 2600: return "Heroic III"
    if mmr >= 2400: return "Heroic II"
    if mmr >= 2200: return "Heroic I"
    if mmr >= 2000: return "Diamond V"
    if mmr >= 1800: return "Diamond IV"
    if mmr >= 1600: return "Diamond III"
    if mmr >= 1400: return "Diamond II"
    if mmr >= 1200: return "Diamond I"
    if mmr >= 1100: return "Platinum V"
    if mmr >= 1050: return "Platinum IV"
    if mmr >= 1000: return "Platinum III"
    if mmr >= 950:  return "Platinum II"
    if mmr >= 900:  return "Platinum I"
    if mmr >= 850:  return "Gold V"
    if mmr >= 800:  return "Gold IV"
    if mmr >= 750:  return "Gold III"
    if mmr >= 700:  return "Gold II"
    if mmr >= 650:  return "Gold I"
    if mmr >= 600:  return "Silver V"
    if mmr >= 550:  return "Silver IV"
    if mmr >= 500:  return "Silver III"
    if mmr >= 450:  return "Silver II"
    if mmr >= 400:  return "Silver I"
    if mmr >= 350:  return "Bronze V"
    if mmr >= 300:  return "Bronze IV"
    if mmr >= 250:  return "Bronze III"
    if mmr >= 200:  return "Bronze II"
    if mmr >= 100:  return "Bronze I"
    return "Novice"


TIER_ORDER = [
    "Novice", "Bronze", "Silver", "Gold", "Platinum",
    "Diamond", "Heroic", "Master", "Grandmaster"
]

TIER_RP_THRESHOLDS = [
    ("Grandmaster", 4200), ("Master", 3200), ("Heroic", 2200),
    ("Diamond", 1200), ("Platinum", 900), ("Gold", 650),
    ("Silver", 400), ("Bronze", 100), ("Novice", 0)
]


@router.get("/leaderboard")
async def get_leaderboard(
    limit: int = Query(50, le=100),
    offset: int = Query(0),
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth_module.get_current_user_optional)
) -> List[Dict[str, Any]]:
    ratings = db.query(models.PvPRating).join(
        models.User, models.PvPRating.user_id == models.User.id
    ).filter(
        models.User.is_active == True,
        models.PvPRating.matches_played > 0
    ).order_by(models.PvPRating.mmr.desc()).offset(offset).limit(limit).all()

    leaderboard = []
    for idx, r in enumerate(ratings, start=offset + 1):
        user = db.query(models.User).get(r.user_id)
        if not user:
            continue
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
            "prestige": getattr(user, 'prestige', 0),
        })

    return leaderboard


@router.get("/rank-distribution")
async def get_rank_distribution(
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    total_users = db.query(models.PvPRating).join(models.User).filter(
        models.User.is_active == True,
        models.PvPRating.matches_played > 0
    ).count()

    if total_users == 0:
        return [{"tier": tier, "count": 0, "percentage": 0.0} for tier, _ in TIER_RP_THRESHOLDS]

    distribution = []
    for tier_name, min_rp in TIER_RP_THRESHOLDS:
        max_rp = None
        for t2, rp2 in TIER_RP_THRESHOLDS:
            if rp2 > min_rp:
                max_rp = rp2
                break
        query = db.query(models.PvPRating).join(models.User).filter(
            models.User.is_active == True,
            models.PvPRating.matches_played > 0,
            models.PvPRating.mmr >= min_rp
        )
        if max_rp is not None:
            query = query.filter(models.PvPRating.mmr < max_rp)

        count = query.count()
        distribution.append({
            "tier": tier_name,
            "count": count,
            "percentage": round(count / total_users * 100, 1) if total_users > 0 else 0.0
        })

    return distribution


@router.get("/user-stats/{user_id}")
async def get_user_rank_stats(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[models.User] = Depends(auth_module.get_current_user_optional)
) -> Dict[str, Any]:
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    rating = db.query(models.PvPRating).filter(
        models.PvPRating.user_id == user_id
    ).first()

    stats = {
        "user_id": user.id,
        "username": user.username,
        "display_name": user.display_name or user.full_name or user.username,
        "avatar_url": user.avatar_url,
        "xp": user.xp_points or 0,
        "level": user.level or 1,
        "prestige": getattr(user, 'prestige', 0),
        "ranking_score": user.ranking_score or 1000,
        "rank": _level_to_rank(user.level or 1),
    }

    if rating:
        stats.update({
            "mmr": rating.mmr,
            "pvprank": _mmr_to_rank(rating.mmr),
            "matches_played": rating.matches_played,
            "wins": rating.wins,
            "losses": rating.losses,
            "draws": rating.draws,
            "win_rate": round(rating.wins / rating.matches_played * 100, 1) if rating.matches_played > 0 else 0.0,
            "current_streak": rating.current_streak,
            "highest_mmr": rating.highest_mmr,
        })
    else:
        stats.update({
            "mmr": 1000,
            "pvprank": "Novice",
            "matches_played": 0,
            "wins": 0,
            "losses": 0,
            "draws": 0,
            "win_rate": 0.0,
            "current_streak": 0,
            "highest_mmr": 1000,
        })

    return stats


@router.post("/prestige")
async def prestige_up(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_module.get_current_user)
) -> Dict[str, Any]:
    current_prestige = getattr(current_user, 'prestige', 0)
    if current_prestige >= 5:
        raise HTTPException(status_code=400, detail="Maximum prestige level already reached (5)")

    min_level = 50 - (current_prestige * 10)
    if (current_user.level or 1) < min_level:
        raise HTTPException(
            status_code=400,
            detail=f"Level {min_level} required for Prestige {current_prestige + 1}. Current level: {current_user.level or 1}"
        )

    current_user.prestige = current_prestige + 1
    current_user.level = 1
    current_user.ranking_score = 1000

    db.commit()
    db.refresh(current_user)

    return {
        "message": f"Prestige {current_prestige + 1} unlocked!",
        "user_id": current_user.id,
        "prestige": current_user.prestige,
        "level": current_user.level,
        "xp": current_user.xp_points or 0,
    }


@router.get("/my-stats")
async def get_my_rank_stats(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth_module.get_current_user)
) -> Dict[str, Any]:
    return await get_user_rank_stats(current_user.id, db, current_user)
