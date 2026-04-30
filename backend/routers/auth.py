from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from typing import List
from common import database, models
import schemas
import auth as root_auth
from common.auth import verify_password, get_password_hash, create_access_token

router = APIRouter(
    prefix="/auth",
    tags=["auth"]
)

get_db = database.get_db


def _do_register(user: schemas.UserCreate, db: Session):
    """Shared registration logic used by both /register and /signup."""
    try:
        db_user = db.query(models.User).filter(models.User.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")

        # Derive username / display_name from what the frontend sends
        username = user.username or (user.display_name.lower().replace(" ", "_") if user.display_name else None) or user.email.split("@")[0]

        # Make sure username is unique
        existing_username = db.query(models.User).filter(models.User.username == username).first()
        if existing_username:
            username = f"{username}_{user.email.split('@')[0]}"

        hashed_password = get_password_hash(user.password)
        new_user = models.User(
            email=user.email,
            hashed_password=hashed_password,
            username=username,
            display_name=user.display_name,
            full_name=user.full_name or user.display_name or username,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Auto login – include user_id in token so /me can look it up
        access_token = create_access_token(data={"sub": new_user.email, "user_id": new_user.id})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": schemas.UserResponse.from_orm_user(new_user)
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Registration error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")


# ── /auth/signup  (called by the frontend) ────────────────────────────────────
@router.post("/signup", response_model=schemas.Token)
def signup(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user (frontend-facing endpoint)."""
    return _do_register(user, db)


# ── /auth/register  (legacy / API-docs-friendly alias) ───────────────────────
@router.post("/register", response_model=schemas.Token)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    """Register a new user (alias for /signup)."""
    return _do_register(user, db)


# ── /auth/login  (JSON body – used by the React frontend) ────────────────────
@router.post("/login", response_model=schemas.Token)
def login(user_credentials: schemas.UserLogin, db: Session = Depends(get_db)):
    """Login with JSON body {email, password}."""
    try:
        user = db.query(models.User).filter(models.User.email == user_credentials.email).first()
        if not user or not verify_password(user_credentials.password, user.hashed_password):
            raise HTTPException(status_code=400, detail="Invalid credentials")

        access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": schemas.UserResponse.from_orm_user(user)
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Login error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")


# ── /auth/token  (OAuth2 form – keeps Swagger UI /docs working) ───────────────
@router.post("/token", response_model=schemas.Token)
def login_form(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """Login with OAuth2 form data (username = email). Used by Swagger UI."""
    user = db.query(models.User).filter(models.User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    access_token = create_access_token(data={"sub": user.email, "user_id": user.id})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": schemas.UserResponse.from_orm_user(user)
    }


# ── /auth/me  (called by useAuth.tsx fetchMe) ─────────────────────────────────
@router.get("/me", response_model=schemas.UserResponse)
async def get_me(current_user: models.User = Depends(root_auth.get_current_user)):
    """Return the currently authenticated user's profile."""
    return current_user


# ── /auth/onboarding/skills ───────────────────────────────────────────────────
@router.post("/onboarding/skills")
async def save_onboarding_skills(
    payload: dict,
    current_user: models.User = Depends(root_auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Save user skills collected during onboarding."""
    try:
        skills_list = payload.get("skills", [])
        if not skills_list:
            return {"status": "ok", "skills_received": 0}
        
        level_map = {"Beginner": 1, "Intermediate": 2, "Advanced": 3, "Expert": 4, "Legend": 5}
        
        db.query(models.UserSkill).filter(models.UserSkill.user_id == current_user.id).delete()
        
        for s in skills_list:
            skill_name = s.get("name") if isinstance(s, dict) else s
            skill_level = s.get("level", "Beginner") if isinstance(s, dict) else "Beginner"
            
            # Get or create the skill in the skills table
            skill = db.query(models.Skill).filter(models.Skill.canonical_name.ilike(skill_name)).first()
            if not skill:
                skill = models.Skill(canonical_name=skill_name)
                db.add(skill)
                db.flush()
            
            user_skill = models.UserSkill(
                user_id=current_user.id,
                skill_id=skill.id,
                skill_name=skill.canonical_name,
                skill_level=level_map.get(skill_level, 1)
            )
            db.add(user_skill)
        
        db.commit()
        return {"status": "ok", "skills_received": len(skills_list)}
    except Exception as e:
        db.rollback()
        print(f"Save skills error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save skills: {str(e)}")


# ── /auth/onboarding/interests ────────────────────────────────────────────────
@router.post("/onboarding/interests")
async def save_onboarding_interests(
    payload: dict,
    current_user: models.User = Depends(root_auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Save user interests collected during onboarding."""
    try:
        interests_list = payload.get("interests", [])
        if not interests_list:
            return {"status": "ok", "interests_received": 0}
        
        db.query(models.UserInterest).filter(models.UserInterest.user_id == current_user.id).delete()
        
        for tag in interests_list:
            interest = models.UserInterest(user_id=current_user.id, interest_tag=tag)
            db.add(interest)
        
        db.commit()
        return {"status": "ok", "interests_received": len(interests_list)}
    except Exception as e:
        db.rollback()
        print(f"Save interests error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save interests: {str(e)}")


# ── /auth/onboarding/profile ──────────────────────────────────────────────────
@router.post("/onboarding/profile")
async def complete_onboarding(
    payload: dict,
    current_user: models.User = Depends(root_auth.get_current_user),
    db: Session = Depends(get_db)
):
    """Complete onboarding by saving bio and profile preferences."""
    try:
        if "bio" in payload:
            current_user.bio = payload["bio"]
        
        if "display_name" in payload:
            current_user.display_name = payload["display_name"]
        
        if "avatar_url" in payload:
            current_user.avatar_url = payload["avatar_url"]
        
        current_user.onboarding_completed = True
        
        db.commit()
        db.refresh(current_user)
        return {"status": "ok", "onboarding_completed": True}
    except Exception as e:
        db.rollback()
        print(f"Save profile error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save profile: {str(e)}")
