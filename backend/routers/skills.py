from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from common import database, models
import auth as auth_module

router = APIRouter(
    prefix="/skills",
    tags=["skills"]
)

get_db = database.get_db

@router.get("/categories")
async def get_skill_categories(db: Session = Depends(get_db)):
    """Get all skill categories"""
    categories = db.query(models.SkillCategory).all()
    return [
        {
            "id": c.id,
            "category_name": c.category_name,
            "description": c.description
        } for c in categories
    ]

@router.get("/all")
async def get_all_skills(db: Session = Depends(get_db)):
    """Get all skills in the registry"""
    skills = db.query(models.Skill).all()
    return [
        {
            "id": s.id,
            "canonical_name": s.canonical_name,
            "category_id": s.category_id,
            "aliases": s.aliases
        } for s in skills
    ]

@router.get("/leaderboard/{skill_name}")
async def get_skill_leaderboard(
    skill_name: str,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get leaderboard for a specific skill"""
    # Find skill by name or alias
    skill = db.query(models.Skill).filter(
        (models.Skill.canonical_name.ilike(f"%{skill_name}%")) |
        (models.Skill.aliases.contains(skill_name))
    ).first()
    
    if not skill:
        return {"skill_name": skill_name, "leaderboard": []}
    
    # Get users with this skill, ordered by XP
    user_skills = db.query(models.UserSkill).filter(
        models.UserSkill.skill_id == skill.id
    ).order_by(
        models.UserSkill.xp.desc()
    ).limit(limit).all()
    
    leaderboard = []
    for i, us in enumerate(user_skills):
        user = db.query(models.User).filter(models.User.id == us.user_id).first()
        if user:
            leaderboard.append({
                "rank": i + 1,
                "user_id": user.id,
                "username": user.username,
                "display_name": user.display_name or user.username,
                "avatar_url": user.avatar_url,
                "skill_xp": us.xp,
                "skill_level": us.skill_level,
                "endorsement_count": us.endorsement_count,
                "verified": us.verified
            })
    
    return {
        "skill_name": skill.canonical_name,
        "category_id": skill.category_id,
        "leaderboard": leaderboard
    }

@router.get("/progression/{user_id}")
async def get_skill_progression(user_id: int, db: Session = Depends(get_db)):
    """Get skill progression for a specific user"""
    user_skills = db.query(models.UserSkill).filter(models.UserSkill.user_id == user_id).all()
    return [
        {
            "skill_name": s.skill_name,
            "skill_xp": s.xp,
            "skill_level": s.skill_level,
            "endorsement_count": s.endorsement_count,
            "verified": s.verified
        } for s in user_skills
    ]

@router.get("/trending")
async def get_trending_skills(db: Session = Depends(get_db)):
    """Get global trending skills from database"""
    # Query skills by user count (engagement)
    trending = db.query(
        models.Skill,
        func.count(models.UserSkill.id).label("user_count")
    ).outerjoin(
        models.UserSkill, models.Skill.id == models.UserSkill.skill_id
    ).group_by(
        models.Skill.id
    ).order_by(
        func.count(models.UserSkill.id).desc()
    ).limit(10).all()
    
    return [
        {
            "skill_name": s[0].canonical_name,
            "trend_score": s[1] * 10,  # Simple score based on user count
            "engagement_volume": s[1],
            "growth_rate": 10 + (s[1] % 20)  # Simulated growth rate
        } for s in trending
    ]

@router.get("/badges/{user_id}")
async def get_user_badges(user_id: int, db: Session = Depends(get_db)):
    """Get skill badges for a user"""
    badges = db.query(models.SkillBadge).filter(models.SkillBadge.user_id == user_id).all()
    return [
        {
            "badge_id": b.id,
            "skill_name": b.skill_name,
            "verification_method": b.verification_method,
            "verification_score": b.verification_score,
            "date_awarded": b.date_awarded.isoformat() if b.date_awarded else None
        } for b in badges
    ]

@router.get("/intelligence/{user_id}")
async def get_skill_intelligence(user_id: int, db: Session = Depends(get_db)):
    """Get AI skill intelligence for a user"""
    # Get user's current skills
    user_skills = db.query(models.UserSkill).filter(
        models.UserSkill.user_id == user_id
    ).all()
    user_skill_names = [s.skill_name for s in user_skills]
    
    # Get trending skills not in user's list
    trending = db.query(
        models.Skill,
        func.count(models.UserSkill.id).label("user_count")
    ).outerjoin(
        models.UserSkill, models.Skill.id == models.UserSkill.skill_id
    ).group_by(
        models.Skill.id
    ).order_by(
        func.count(models.UserSkill.id).desc()
    ).limit(10).all()
    
    skills_to_learn = []
    for skill, count in trending:
        if skill.canonical_name not in user_skill_names:
            skills_to_learn.append({
                "skill_name": skill.canonical_name,
                "reason": f"{count} users have this skill - trending now!",
                "source": "AI Insight"
            })
            if len(skills_to_learn) >= 5:
                break
    
    # Get skills that could be verified
    skills_to_verify = [
        {
            "skill_name": s.skill_name,
            "reason": "High XP - eligible for verification"
        }
        for s in user_skills if s.xp >= 5000 and not s.verified
    ]
    
    return {
        "user_id": user_id,
        "skills_to_learn": skills_to_learn,
        "skills_to_verify": skills_to_verify,
        "trending_skills": [
            {"skill_name": s[0].canonical_name, "trend_score": s[1] * 10, "engagement_volume": s[1]}
            for s in trending[:5]
        ]
    }

@router.get("/activity/{user_id}")
async def get_skill_activity(user_id: int, db: Session = Depends(get_db)):
    """Get skill activity for a user"""
    activities = db.query(models.SkillActivityLog).filter(
        models.SkillActivityLog.user_id == user_id
    ).order_by(
        models.SkillActivityLog.created_at.desc()
    ).limit(20).all()
    
    return [
        {
            "id": a.id,
            "action_type": a.action_type,
            "skill_name": a.skill_name,
            "metadata": a.metadata,
            "created_at": a.created_at.isoformat() if a.created_at else None
        }
        for a in activities
    ]

# ==========================================
# SKILL PROOF SYSTEM
# ==========================================

class SkillProofCreate(BaseModel):
    skill_id: int
    proof_type: str
    proof_url: str
    description: Optional[str] = None

PROOF_TYPES = ["github", "portfolio", "certificate", "project"]

@router.post("/proof")
async def add_skill_proof(
    proof_data: SkillProofCreate,
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """Attach proof to a skill"""
    if proof_data.proof_type not in PROOF_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid proof_type. Must be one of: {PROOF_TYPES}")
    
    skill = db.query(models.Skill).filter(models.Skill.id == proof_data.skill_id).first()
    if not skill:
        raise HTTPException(status_code=404, detail="Skill not found")
    
    proof = models.SkillProof(
        user_id=current_user.id,
        skill_id=proof_data.skill_id,
        proof_type=proof_data.proof_type,
        proof_url=proof_data.proof_url,
        description=proof_data.description
    )
    db.add(proof)
    db.commit()
    db.refresh(proof)
    
    return {
        "id": proof.id,
        "skill_id": proof.skill_id,
        "proof_type": proof.proof_type,
        "proof_url": proof.proof_url,
        "description": proof.description,
        "created_at": proof.created_at.isoformat() if proof.created_at else None
    }

@router.get("/proof/{user_id}")
async def get_user_skill_proofs(
    user_id: int,
    db: Session = Depends(get_db)
):
    """Get all skill proofs for a user"""
    proofs = db.query(models.SkillProof).filter(
        models.SkillProof.user_id == user_id
    ).all()
    
    return [
        {
            "id": p.id,
            "skill_id": p.skill_id,
            "skill_name": db.query(models.Skill).filter(models.Skill.id == p.skill_id).first().canonical_name if db.query(models.Skill).filter(models.Skill.id == p.skill_id).first() else None,
            "proof_type": p.proof_type,
            "proof_url": p.proof_url,
            "description": p.description,
            "created_at": p.created_at.isoformat() if p.created_at else None
        }
        for p in proofs
    ]

@router.delete("/proof/{proof_id}")
async def delete_skill_proof(
    proof_id: int,
    current_user: models.User = Depends(auth_module.get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a skill proof"""
    proof = db.query(models.SkillProof).filter(
        models.SkillProof.id == proof_id,
        models.SkillProof.user_id == current_user.id
    ).first()
    
    if not proof:
        raise HTTPException(status_code=404, detail="Proof not found or not owned by you")
    
    db.delete(proof)
    db.commit()
    
    return {"status": "deleted", "proof_id": proof_id}
