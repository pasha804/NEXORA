from fastapi import FastAPI, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from typing import List, Optional
from pydantic import BaseModel

from common.database import get_db, engine
from common.models import (
    Base,
    User,
    UserSocialStats,
    Follower,
    UserSkill,
    Profile,
    Skill,
    SkillProof,
    UserRank,
    UserProject,
)
from common.auth import get_current_user_from_token

from redis import asyncio as aioredis
import json
import os

# Initialize DB Tables
Base.metadata.create_all(bind=engine)

# ==========================================
# SCHEMAS - Defined at module top level
# ==========================================
class ProfileUpdate(BaseModel):
    display_name: Optional[str] = None
    bio: Optional[str] = None
    location: Optional[str] = None
    website: Optional[str] = None
    experience_level: Optional[str] = None
    github_url: Optional[str] = None
    linkedin_url: Optional[str] = None
    portfolio_links: Optional[list[str]] = None


class ProjectBase(BaseModel):
    project_name: str
    project_description: Optional[str] = None
    project_link: Optional[str] = None
    project_image: Optional[str] = None
    tech_stack: Optional[list[str]] = None


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(BaseModel):
    project_name: Optional[str] = None
    project_description: Optional[str] = None
    project_link: Optional[str] = None
    project_image: Optional[str] = None
    tech_stack: Optional[list[str]] = None


class ProjectResponse(ProjectBase):
    id: int

    class Config:
        from_attributes = True


def _serialize_public_profile(user: User) -> dict:
    stats = user.stats
    profile = user.profile

    # Prefer profile.display_name as the single source of truth,
    # falling back to user.display_name / full_name / username.
    display_name = (
        (profile.display_name if profile and profile.display_name else None)
        or user.display_name
        or user.full_name
        or user.username
    )

    # Preload skill proofs for this user and group by skill_id for efficient lookup
    proofs_by_skill: dict[int, list[dict]] = {}
    if user.skills:
        skill_ids = [s.skill_id for s in user.skills if s.skill_id]
        if skill_ids:
            # Import here to avoid circulars in some tooling
            from sqlalchemy.orm import Session
            # user.__dict__ may not expose session; use object_session if needed
            from sqlalchemy.orm.session import object_session
            session: Session | None = object_session(user)
            if session is not None:
                proof_rows = (
                    session.query(SkillProof, Skill)
                    .join(Skill, Skill.id == SkillProof.skill_id)
                    .filter(SkillProof.user_id == user.id, SkillProof.skill_id.in_(skill_ids))
                    .all()
                )
                for proof, skill in proof_rows:
                    proofs_by_skill.setdefault(proof.skill_id, []).append(
                        {
                            "id": proof.id,
                            "skill_id": proof.skill_id,
                            "skill_name": skill.canonical_name,
                            "proof_type": proof.proof_type,
                            "proof_url": proof.proof_url,
                            "description": proof.description,
                            "created_at": proof.created_at,
                        }
                    )

    # Load global skill rank, if any
    rank_label = "Beginner"
    total_skill_xp = 0
    if user.id:
        from sqlalchemy.orm.session import object_session
        session = object_session(user)
        if session is not None:
            rank_row = session.query(UserRank).filter(UserRank.user_id == user.id).first()
            if rank_row:
                rank_label = rank_row.rank
                total_skill_xp = rank_row.total_skill_xp

    return {
        "id": user.id,
        "user_id": user.id,
        "username": user.username,
        "email": user.email,
        "display_name": display_name,
        "full_name": user.full_name,
        "avatar_url": (profile.avatar_url if profile else None) or user.avatar_url,
        "bio": (profile.bio if profile else None) or user.bio,
        "location": user.location,
        "website": user.website,
        "experience_level": profile.experience_level if profile else None,
        "github_url": profile.github_url if profile else None,
        "linkedin_url": profile.linkedin_url if profile else None,
        "portfolio_links": profile.portfolio_links if profile and profile.portfolio_links else [],
        "privacy_setting": profile.privacy_setting if profile else "public",
        "followers_count": stats.followers_count if stats else 0,
        "following_count": stats.following_count if stats else 0,
        "rank_level": rank_label,
        "xp_total": total_skill_xp or (stats.xp_total if stats else user.xp_points),
        "level": user.level,
        "skills": [
            {
                "name": s.skill_name,
                "level": s.skill_level,
                "xp": s.xp,
                "endorsed": s.endorsement_count,
                "verified": s.verified or s.skill_level >= 4,
                "proofs": proofs_by_skill.get(s.skill_id or -1, []),
            }
            for s in (user.skills or [])
        ],
        "projects": [
            {
                "id": p.id,
                "project_name": p.project_name,
                "project_description": p.project_description,
                "project_link": p.project_link,
                "project_image": p.project_image,
                "tech_stack": p.tech_stack or [],
                "created_at": p.created_at,
            }
            for p in (user.projects or [])
        ],
        "created_at": user.created_at,
    }

# ==========================================
# APP INSTANCE
# ==========================================
app = FastAPI(root_path="/profile")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
redis = None

@app.on_event("startup")
async def startup_event():
    global redis
    redis = await aioredis.from_url(REDIS_URL, decode_responses=True)

async def publish_event(event_type: str, data: dict):
    if redis:
        message = {"event": event_type, "data": data}
        await redis.publish("nexora_events", json.dumps(message))

# ==========================================
# ENDPOINTS
# ==========================================

@app.post("/follow/{target_username}")
def follow_user(
    target_username: str,
    db: Session = Depends(get_db),
    authorization: str = Header(...)
):
    current_user_id = get_current_user_from_token(authorization.replace("Bearer ", ""))
    target_user = db.query(User).filter(User.username == target_username).first()
    
    if not target_user: raise HTTPException(status_code=404, detail="User not found")
    if target_user.id == current_user_id: raise HTTPException(status_code=400, detail="Cannot follow yourself")
        
    existing = db.query(Follower).filter(Follower.follower_id == current_user_id, Follower.following_id == target_user.id).first()
    
    status = ""
    if existing:
        db.delete(existing)
        if target_user.stats: target_user.stats.followers_count -= 1
        current_stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == current_user_id).first()
        if current_stats: current_stats.following_count -= 1
        status = "unfollowed"
    else:
        new_follow = Follower(follower_id=current_user_id, following_id=target_user.id)
        db.add(new_follow)
        if target_user.stats: target_user.stats.followers_count += 1
        else:
             new_stats = UserSocialStats(user_id=target_user.id, followers_count=1)
             db.add(new_stats)
        current_stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == current_user_id).first()
        if current_stats: current_stats.following_count += 1
        status = "followed"
        
    db.commit()
    
    # Emit Event
    import asyncio
    asyncio.create_task(publish_event("social_update", {
        "type": status,
        "target_user_id": target_user.id,
        "actor_user_id": current_user_id,
        "new_count": target_user.stats.followers_count if target_user.stats else 0
    }))
    
    return {"status": status}

@app.put("/update")
def update_profile(
    data: ProfileUpdate,
    db: Session = Depends(get_db),
    authorization: str = Header(...)
):
    user_id = get_current_user_from_token(authorization.replace("Bearer ", ""))
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Ensure profile row exists
    profile = user.profile
    if not profile:
        profile = Profile(user_id=user.id)
        db.add(profile)

    if data.display_name is not None:
        profile.display_name = data.display_name
        # Keep legacy user.display_name in sync for older services
        user.display_name = data.display_name
    if data.bio is not None:
        if user.profile:
            user.profile.bio = data.bio
        else:
            user.bio = data.bio
    if data.location is not None:
        user.location = data.location
    if data.website is not None:
        user.website = data.website
    if data.experience_level is not None:
        profile.experience_level = data.experience_level
    if data.github_url is not None:
        profile.github_url = data.github_url
    if data.linkedin_url is not None:
        profile.linkedin_url = data.linkedin_url
    if data.portfolio_links is not None:
        profile.portfolio_links = data.portfolio_links
    
    db.commit()
    
    import asyncio
    asyncio.create_task(publish_event("profile_update", {
        "user_id": user.id,
        "username": user.username,
        "updates": data.model_dump(exclude_unset=True)
    }))
    
    return {"status": "updated"}

@app.get("/health")
def health():
    return {"status": "ok", "service": "profile"}


@app.get("/me")
def get_my_profile(
    db: Session = Depends(get_db),
    authorization: str = Header(...)
):
    user_id = get_current_user_from_token(authorization.replace("Bearer ", ""))
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return _serialize_public_profile(user)


@app.get("/{username}")
def get_profile_by_username(
    username: str,
    db: Session = Depends(get_db),
    authorization: Optional[str] = Header(None)
):
    requester_id = None
    if authorization and authorization.lower().startswith("bearer "):
        requester_id = get_current_user_from_token(authorization[7:])

    user = db.query(User).filter(User.username == username).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    privacy_setting = user.profile.privacy_setting if user.profile else "public"
    if privacy_setting == "private" and requester_id != user.id:
        raise HTTPException(status_code=403, detail="This profile is private")

    return _serialize_public_profile(user)


@app.get("/projects/me", response_model=List[ProjectResponse])
def get_my_projects(
    db: Session = Depends(get_db),
    authorization: str = Header(...),
):
    user_id = get_current_user_from_token(authorization.replace("Bearer ", ""))
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    projects = (
        db.query(UserProject)
        .filter(UserProject.user_id == user_id)
        .order_by(UserProject.created_at.desc())
        .all()
    )
    return projects


@app.get("/projects/{user_id}", response_model=List[ProjectResponse])
def get_user_projects(
    user_id: int,
    db: Session = Depends(get_db),
):
    projects = (
        db.query(UserProject)
        .filter(UserProject.user_id == user_id)
        .order_by(UserProject.created_at.desc())
        .all()
    )
    return projects


@app.post("/projects", response_model=ProjectResponse)
def create_project(
    payload: ProjectCreate,
    db: Session = Depends(get_db),
    authorization: str = Header(...),
):
    user_id = get_current_user_from_token(authorization.replace("Bearer ", ""))
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    project = UserProject(
        user_id=user_id,
        project_name=payload.project_name,
        project_description=payload.project_description,
        project_link=payload.project_link,
        project_image=payload.project_image,
        tech_stack=payload.tech_stack or [],
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@app.put("/projects/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    payload: ProjectUpdate,
    db: Session = Depends(get_db),
    authorization: str = Header(...),
):
    user_id = get_current_user_from_token(authorization.replace("Bearer ", ""))
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    project = (
        db.query(UserProject)
        .filter(UserProject.id == project_id, UserProject.user_id == user_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return project


@app.delete("/projects/{project_id}")
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    authorization: str = Header(...),
):
    user_id = get_current_user_from_token(authorization.replace("Bearer ", ""))
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    project = (
        db.query(UserProject)
        .filter(UserProject.id == project_id, UserProject.user_id == user_id)
        .first()
    )
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(project)
    db.commit()
    return {"status": "deleted"}
