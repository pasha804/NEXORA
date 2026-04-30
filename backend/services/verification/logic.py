from sqlalchemy.orm import Session
from sqlalchemy import func
from common.models import SkillBadge, UserSkill, UserSocialStats
from typing import Optional


def verify_skill_logic(
    user_id: int,
    skill_name: str,
    db: Session,
    method: str = "auto",
    ai_score: Optional[float] = None,
) -> bool:
    """
    Deterministic multi-signal skill verification.

    Signals:
    - XP in the given skill
    - Endorsement count for that skill
    - PvP performance (global wins for now)
    - Optional AI evaluation score
    """
    user_skill = (
        db.query(UserSkill)
        .filter(UserSkill.user_id == user_id, UserSkill.skill_name == skill_name)
        .first()
    )
    if not user_skill:
        return False

    stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == user_id).first()

    # Normalized components in [0,1]
    xp_component = min(user_skill.xp / 2000.0, 1.0)  # heavy practice
    endorsement_component = min(user_skill.endorsement_count / 10.0, 1.0)
    pvp_component = 0.0
    if stats:
        # Use battle_wins as a lightweight PvP proxy
        pvp_component = min((stats.battle_wins or 0) / 20.0, 1.0)

    ai_component = 0.0
    if ai_score is not None:
        ai_component = min(max(ai_score, 0.0), 100.0) / 100.0

    # Weighting by method
    base_weight_xp = 0.4
    base_weight_endorse = 0.25
    base_weight_pvp = 0.2
    base_weight_ai = 0.15

    method = (method or "auto").lower()
    if method == "pvp":
        base_weight_pvp += 0.15
    elif method in {"challenge", "official_challenge"}:
        base_weight_xp += 0.1
    elif method in {"ai_test", "ai_evaluation"}:
        base_weight_ai += 0.15
    elif method == "community":
        base_weight_endorse += 0.15

    total_weight = base_weight_xp + base_weight_endorse + base_weight_pvp + base_weight_ai
    wx = base_weight_xp / total_weight
    we = base_weight_endorse / total_weight
    wp = base_weight_pvp / total_weight
    wa = base_weight_ai / total_weight

    verification_score = (
        xp_component * wx
        + endorsement_component * we
        + pvp_component * wp
        + ai_component * wa
    )

    # Threshold: require reasonably strong combined evidence
    if verification_score < 0.6:
        return False

    user_skill.verified = True

    badge = (
        db.query(SkillBadge)
        .filter(SkillBadge.user_id == user_id, SkillBadge.skill_name == skill_name)
        .first()
    )
    if not badge:
        badge = SkillBadge(
            user_id=user_id,
            skill_name=skill_name,
            verification_level="Verified",
        )
        db.add(badge)

    badge.verification_method = method
    badge.verification_score = verification_score

    db.commit()
    return True
