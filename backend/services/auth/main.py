from fastapi import FastAPI, Depends, HTTPException, status, Request, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, selectinload
from sqlalchemy import or_
from datetime import timedelta
from typing import Annotated
import os

from common.database import get_db, engine, SessionLocal
from common.models import Base, User, Profile, UserSocialStats, UserPrivacySettings, UserNotificationSettings
from common.auth import create_access_token, verify_password, get_password_hash, ACCESS_TOKEN_EXPIRE_MINUTES
from pydantic import BaseModel, EmailStr
from typing import List, Optional

# Initialize DB Tables (Simulating Migration for dev)
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"Warning: Table creation failed (might already exist): {e}")

# Run database migrations for missing columns
try:
    from sqlalchemy import text
    with engine.connect() as conn:
        # Add display_name to profiles if missing (PostgreSQL)
        try:
            conn.execute(text("""
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                  WHERE table_name = 'profiles' AND column_name = 'display_name') THEN
                        ALTER TABLE profiles ADD COLUMN display_name VARCHAR;
                    END IF;
                END $$;
            """))
            conn.commit()
            print("Migration: Added display_name column to profiles")
        except Exception as e:
            print(f"Profile migration: {e}")
        
        # Add rank_level to user_social_stats if missing (PostgreSQL)
        try:
            conn.execute(text("""
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                  WHERE table_name = 'user_social_stats' AND column_name = 'rank_level') THEN
                        ALTER TABLE user_social_stats ADD COLUMN rank_level VARCHAR DEFAULT 'Beginner';
                    END IF;
                END $$;
            """))
            conn.commit()
        except Exception as e:
            print(f"Stats migration: {e}")
            
        # Add skill_id to user_skills if missing (for normalized skills)
        # Note: skill_id is nullable so it's optional
        try:
            conn.execute(text("""
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                  WHERE table_name = 'user_skills' AND column_name = 'skill_id') THEN
                        ALTER TABLE user_skills ADD COLUMN skill_id INTEGER;
                    END IF;
                END $$;
            """))
            conn.commit()
        except Exception as e:
            print(f"UserSkills migration: {e}")
            
        # Add is_primary, skill_integrity_score, verified to user_skills if missing
        try:
            conn.execute(text("""
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                  WHERE table_name = 'user_skills' AND column_name = 'is_primary') THEN
                        ALTER TABLE user_skills ADD COLUMN is_primary BOOLEAN DEFAULT FALSE;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                  WHERE table_name = 'user_skills' AND column_name = 'skill_integrity_score') THEN
                        ALTER TABLE user_skills ADD COLUMN skill_integrity_score FLOAT DEFAULT 1.0;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                  WHERE table_name = 'user_skills' AND column_name = 'verified') THEN
                        ALTER TABLE user_skills ADD COLUMN verified BOOLEAN DEFAULT FALSE;
                    END IF;
                END $$;
            """))
            conn.commit()
        except Exception as e:
            print(f"UserSkills extra columns migration: {e}")
            
        # Convert avatar_url and banner_url from VARCHAR to TEXT for base64 images
        try:
            conn.execute(text("""
                ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT;
            """))
            conn.commit()
        except Exception as e:
            print(f"Users avatar_url migration: {e}")
            
        try:
            conn.execute(text("""
                ALTER TABLE users ALTER COLUMN banner_url TYPE TEXT;
            """))
            conn.commit()
        except Exception as e:
            print(f"Users banner_url migration: {e}")
            
        try:
            conn.execute(text("""
                ALTER TABLE profiles ALTER COLUMN avatar_url TYPE TEXT;
            """))
            conn.commit()
        except Exception as e:
            print(f"Profiles avatar_url migration: {e}")
        
        try:
            conn.execute(text("""
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                  WHERE table_name = 'profiles' AND column_name = 'banner_url') THEN
                        ALTER TABLE profiles ADD COLUMN banner_url TEXT;
                    END IF;
                END $$;
            """))
            conn.commit()
            print("Migration: Added banner_url column to profiles")
        except Exception as e:
            print(f"Profiles banner_url migration: {e}")
except Exception as e:
    print(f"Migration warning: {e}")

# Seed Skill Registry
try:
    from common.models import Skill, SkillCategory
    
    # Get a database session for seeding
    seed_db = SessionLocal()
    try:
        # Check if skills already exist
        existing_skills = seed_db.query(Skill).first()
        if not existing_skills:
            # Create skill categories
            categories = [
                SkillCategory(category_name="Frontend", description="Frontend development skills"),
                SkillCategory(category_name="Backend", description="Backend development skills"),
                SkillCategory(category_name="Mobile", description="Mobile development skills"),
                SkillCategory(category_name="DevOps", description="DevOps and infrastructure"),
                SkillCategory(category_name="Data Science", description="Data science and ML"),
                SkillCategory(category_name="Design", description="UI/UX Design"),
                SkillCategory(category_name="Security", description="Cybersecurity"),
                SkillCategory(category_name="Blockchain", description="Blockchain development"),
            ]
            seed_db.add_all(categories)
            seed_db.commit()
            
            # Create skills
            skills_data = [
                # Frontend
                ("React", "Frontend", ["ReactJS", "React.js", "react"]),
                ("Vue.js", "Frontend", ["Vue", "VueJS", "vue"]),
                ("Angular", "Frontend", ["AngularJS", "angular"]),
                ("TypeScript", "Frontend", ["TS", "typescript"]),
                ("Next.js", "Frontend", ["NextJS", "nextjs"]),
                ("Tailwind CSS", "Frontend", ["Tailwind", "tailwind"]),
                ("JavaScript", "Frontend", ["JS", "javascript", "js"]),
                ("HTML/CSS", "Frontend", ["html", "css", "html5", "css3"]),
                
                # Backend
                ("Node.js", "Backend", ["NodeJS", "nodejs", "Node", "node"]),
                ("Python", "Backend", ["python", "py"]),
                ("Java", "Backend", ["java"]),
                ("Go", "Backend", ["golang", "Go"]),
                ("Rust", "Backend", ["rust"]),
                ("PostgreSQL", "Backend", ["postgres", "postgresql"]),
                ("MongoDB", "Backend", ["mongo", "mongodb"]),
                ("GraphQL", "Backend", ["gql", "graphql"]),
                
                # DevOps
                ("Docker", "DevOps", ["docker"]),
                ("Kubernetes", "DevOps", ["k8s", "kubernetes"]),
                ("AWS", "DevOps", ["amazon web services", "amazon ws"]),
                ("Azure", "DevOps", ["azure"]),
                ("GCP", "DevOps", ["google cloud", "google cloud platform"]),
                ("CI/CD", "DevOps", ["cicd", "jenkins", "github actions"]),
                
                # Data Science
                ("Machine Learning", "Data Science", ["ML", "machinelearning", "machine learning"]),
                ("Deep Learning", "Data Science", ["DL", "deeplearning", "deep learning"]),
                ("Python Data", "Data Science", ["pandas", "numpy", "scipy"]),
                ("TensorFlow", "Data Science", ["tensorflow", "tf"]),
                ("PyTorch", "Data Science", ["pytorch"]),
                
                # Design
                ("UI/UX Design", "Design", ["ui", "ux", "uiux", "ui/ux"]),
                ("Figma", "Design", ["figma"]),
                ("Adobe XD", "Design", ["adobexd", "xd"]),
                
                # Security
                ("Cybersecurity", "Security", ["infosec", "security", "cyber"]),
                ("Penetration Testing", "Security", ["pentest", "pen-testing"]),
                
                # Blockchain
                ("Solidity", "Blockchain", ["solidity"]),
                ("Web3", "Blockchain", ["web3", "web 3"]),
                ("Smart Contracts", "Blockchain", ["smartcontracts", "smart contracts"]),
                ("Ethereum", "Blockchain", ["eth", "ethereum"]),
            ]
            
            for skill_name, category_name, aliases in skills_data:
                category = seed_db.query(SkillCategory).filter(SkillCategory.category_name == category_name).first()
                skill = Skill(
                    canonical_name=skill_name,
                    category_id=category.id if category else None,
                    aliases=aliases
                )
                seed_db.add(skill)
            
            seed_db.commit()
            print(f"Seed: Added {len(skills_data)} skills in {len(categories)} categories")
        else:
            print("Seed: Skills already exist, skipping")
    finally:
        seed_db.close()
except Exception as e:
    print(f"Seed warning: {e}")

# Ensure all tables exist
try:
    from sqlalchemy import inspect
    inspector = inspect(engine)
    existing_tables = inspector.get_table_names()
    
    # Create tables that might be missing
    tables_to_create = [
        ('skills', 'common.models'),  # This would need proper model import
    ]
    
    # Check and warn about missing tables
    required_tables = ['users', 'profiles', 'user_skills', 'user_interests', 'user_social_stats', 'user_privacy_settings', 'user_notification_settings']
    for table in required_tables:
        if table not in existing_tables:
            print(f"WARNING: Table '{table}' not found in database!")
except Exception as e:
    print(f"Table check warning: {e}")

from fastapi.responses import JSONResponse
import traceback

app = FastAPI()

@app.middleware("http")
async def catch_exceptions_middleware(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception as exc:
        error_trace = traceback.format_exc()
        print(f"ERROR: {exc}")
        print(error_trace)
        return JSONResponse(
            status_code=500,
            content={"detail": str(exc), "traceback": error_trace}
        )

@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"Incoming request: {request.method} {request.url.path}")
    response = await call_next(request)
    print(f"Response status: {response.status_code}")
    return response


@app.get("/health")
def health_check():
    return {"status": "ok"}

# CORS Middleware
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
]

# CORS is handled by Nginx Gateway
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=origins,
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str
    display_name: str | None = None
    avatar_url: str | None = None

class Token(BaseModel):
    access_token: str
    token_type: str
    # Core user identity
    user_id: int
    id: int
    username: str
    email: Optional[str] = None
    display_name: Optional[str] = None
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None
    bio: Optional[str] = None
    # Gamification
    xp: int = 0
    level: int = 1
    rank: str = "Beginner"
    # Social
    followers_count: int = 0
    following_count: int = 0
    # Nested
    skills: List[dict] = []
    interests: List[str] = []
    # Flags
    onboarding_completed: bool = False
    created_at: Optional[str] = None

class SkillEntry(BaseModel):
    name: str
    level: str
    xp: int

class OnboardingSkills(BaseModel):
    skills: List[SkillEntry]

class OnboardingInterests(BaseModel):
    interests: List[str]

class OnboardingProfile(BaseModel):
    bio: Optional[str] = None
    learning_goals: Optional[str] = None
    collaboration_preference: Optional[str] = None
    is_private: bool = False
    avatar_url: Optional[str] = None
    banner_url: Optional[str] = None

class LoginJSON(BaseModel):
    email: EmailStr
    password: str

from sqlalchemy import inspect, text

@app.post("/signup", response_model=Token)
def signup(user_data: UserCreate, db: Session = Depends(get_db)):
    # DEBUG: Check table visibility and connection
    try:
        from sqlalchemy import text
        res = db.execute(text("SELECT current_database(), current_schema(), current_user")).fetchone()
        print(f"DEBUG: DB Connection: {res}")
        
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        print(f"DEBUG: SQLAlchemy sees tables: {tables}")
    except Exception as e:
        print(f"DEBUG: Debugging failed: {e}")

    try:
        # Check existing user
        existing = db.query(User).filter(or_(User.email == user_data.email, User.username == user_data.username)).first()
        if existing:
            raise HTTPException(status_code=400, detail="Username or Email already registered")
        
        # 1. Create User
        new_user = User(
            username=user_data.username, 
            email=user_data.email, 
            display_name=user_data.display_name or (user_data.username.replace("_", " ").title() if user_data.username else user_data.email.split("@")[0]),
            avatar_url=user_data.avatar_url,
            hashed_password=get_password_hash(user_data.password),
            xp_points=0,
            level=1,
            ranking_score=1000
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        
        # 2. Initialize Profile, Stats, Settings
        # Use relationship paths defined in common/models.py
        profile = Profile(user_id=new_user.id, avatar_url=user_data.avatar_url)
        stats = UserSocialStats(user_id=new_user.id, rank_level="Beginner")
        privacy = UserPrivacySettings(user_id=new_user.id)
        notifications = UserNotificationSettings(user_id=new_user.id)
        db.add_all([profile, stats, privacy, notifications])
        db.commit()
        
        # Create Token
        access_token = create_access_token(data={"sub": new_user.username, "user_id": new_user.id})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": new_user.id,
            "id": new_user.id,
            "username": new_user.username,
            "email": new_user.email,
            "display_name": new_user.display_name or new_user.username,
            "avatar_url": user_data.avatar_url,
            "banner_url": None,
            "bio": None,
            "xp": 0,
            "level": 1,
            "rank": "Beginner",
            "followers_count": 0,
            "following_count": 0,
            "skills": [],
            "interests": [],
            "onboarding_completed": False,
            "created_at": new_user.created_at.isoformat() if new_user.created_at else None,
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Signup error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(e)}")

@app.post("/register", response_model=Token)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """Alias for signup to handle both naming conventions"""
    return signup(user_data, db)

@app.post("/signup-basic", response_model=Token)
def signup_basic(user_data: UserCreate, db: Session = Depends(get_db)):
    return signup(user_data, db)

@app.post("/login", response_model=Token)
async def login(request: Request, db: Session = Depends(get_db)):
    """
    Login endpoint compatible with:
    - JSON: { "email": "...", "password": "..." }  (used by the React frontend)
    - Form: username=...&password=...             (OAuth2PasswordRequestForm / Swagger)
    """
    content_type = (request.headers.get("content-type") or "").lower()
    identifier = None
    password = None

    if "application/json" in content_type:
        payload = await request.json()
        identifier = payload.get("email") or payload.get("username")
        password = payload.get("password")
    else:
        form = await request.form()
        identifier = form.get("username") or form.get("email")
        password = form.get("password")

    if not identifier or not password:
        raise HTTPException(status_code=400, detail="Missing login credentials")

    user = db.query(User).filter(or_(User.username == identifier, User.email == identifier)).first()
    if not user or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        access_token = create_access_token(data={"sub": user.username, "user_id": user.id})
        avatar_url = None
        display_name = user.display_name or user.username
        if user.profile:
            avatar_url = user.profile.avatar_url or user.avatar_url
            display_name = user.profile.display_name or display_name
        elif user.avatar_url:
            avatar_url = user.avatar_url

        # Get real rank from stats
        from common.models import UserSocialStats
        stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == user.id).first()
        real_rank = stats.rank_level if stats and stats.rank_level else "Novice"
        followers_count = stats.followers_count if stats else 0
        following_count = stats.following_count if stats else 0
        # Get ranking_score via fresh query
        fresh_user = db.query(User).filter(User.id == user.id).first()
        real_ranking_score = fresh_user.ranking_score if fresh_user and fresh_user.ranking_score else 1000

        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user_id": user.id,
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "display_name": display_name,
            "avatar_url": avatar_url,
            "xp": user.xp_points or 0,
            "level": user.level or 1,
            "rank": real_rank,
            "ranking_score": real_ranking_score,
            "followers_count": followers_count,
            "following_count": following_count,
            "skills": [],
            "interests": [],
            "onboarding_completed": user.onboarding_completed or False,
        }
    except Exception as e:
        print(f"Login error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Login failed: {str(e)}")

# ==========================================
# SKILL SUGGESTIONS
# ==========================================

@app.get("/suggestions/skills")
def get_skill_suggestions():
    """Return a list of common skills for the selection UI."""
    return [
        "React", "Node.js", "Python", "TypeScript", "Next.js", 
        "Tailwind CSS", "PostgreSQL", "Docker", "AWS", "Machine Learning",
        "UI/UX Design", "Figma", "Cyber Security", "Blockchain", "Solidity"
    ]

# ==========================================
# ONBOARDING ENDPOINTS
# ==========================================

from common.auth import get_current_user_from_token
from common.models import UserSkill, UserInterest

@app.post("/onboarding/skills")
def save_onboarding_skills(
    data: OnboardingSkills, 
    db: Session = Depends(get_db), 
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="login"))
):
    user_id = get_current_user_from_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    try:
        # Remove existing skills for fresh start or update
        db.query(UserSkill).filter(UserSkill.user_id == user_id).delete()
        
        # Map levels to integer for DB consistency if needed (simplified here as 1-5)
        level_map = {"Beginner": 1, "Intermediate": 2, "Advanced": 3, "Expert": 4, "Legend": 5}
        
        for s in data.skills:
            skill = UserSkill(
                user_id=user_id,
                skill_name=s.name,
                skill_level=level_map.get(s.level, 1),
                xp=s.xp
            )
            db.add(skill)
        
        db.commit()
        return {"status": "skills updated"}
    except Exception as e:
        db.rollback()
        print(f"Save skills error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to save skills: {str(e)}")

@app.post("/onboarding/interests")
def save_onboarding_interests(
    data: OnboardingInterests, 
    db: Session = Depends(get_db), 
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="login"))
):
    user_id = get_current_user_from_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    try:
        db.query(UserInterest).filter(UserInterest.user_id == user_id).delete()
        
        for tag in data.interests:
            interest = UserInterest(user_id=user_id, interest_tag=tag)
            db.add(interest)
        
        db.commit()
        return {"status": "interests updated"}
    except Exception as e:
        db.rollback()
        print(f"Save interests error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to save interests: {str(e)}")

@app.post("/onboarding/profile")
def save_onboarding_profile(
    data: OnboardingProfile, 
    db: Session = Depends(get_db), 
    token: str = Depends(OAuth2PasswordBearer(tokenUrl="login"))
):
    user_id = get_current_user_from_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    try:
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Initialize or update profile
        profile_changed = False
        if not user.profile:
            user.profile = Profile(user_id=user_id)
            db.add(user.profile)
            profile_changed = True
        
        # Update profile fields
        if data.bio is not None:
            user.profile.bio = data.bio
            profile_changed = True
        if data.learning_goals is not None:
            user.profile.learning_goals = data.learning_goals
            profile_changed = True
        if data.collaboration_preference is not None:
            user.profile.collaboration_preference = data.collaboration_preference
            profile_changed = True
        
        user.profile.privacy_setting = "private" if data.is_private else "public"
        
        # Save avatar_url if provided
        if data.avatar_url:
            try:
                user.profile.avatar_url = data.avatar_url
                user.avatar_url = data.avatar_url
                print(f"Saving avatar_url: {len(data.avatar_url)} characters")
            except Exception as e:
                print(f"Avatar save error: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to save avatar: {str(e)}")
        
        # Save banner_url if provided
        if data.banner_url:
            try:
                user.banner_url = data.banner_url
                print(f"Saving banner_url: {len(data.banner_url)} characters")
            except Exception as e:
                print(f"Banner save error: {str(e)}")
                raise HTTPException(status_code=500, detail=f"Failed to save banner: {str(e)}")
        
        user.onboarding_completed = True
        db.commit()
        
        # Refresh to get updated data
        db.refresh(user)
        if user.profile:
            db.refresh(user.profile)
            
        return {"status": "onboarding complete", "onboarding_completed": True}
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        print(f"Save profile error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to save profile: {str(e)}")

@app.get("/me")
def read_users_me(db: Session = Depends(get_db), token: str = Depends(OAuth2PasswordBearer(tokenUrl="login"))):
    """
    Bootstrap endpoint returning full user context.
    """
    from common.auth import get_current_user_from_token
    user_id = get_current_user_from_token(token)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).options(
        selectinload(User.profile),
        selectinload(User.stats),
        selectinload(User.skills),
        selectinload(User.interests)
    ).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    try:
        avatar_url = None
        banner_url = None
        bio = None
        learning_goals = None
        collaboration_preference = None
        display_name = None
        
        if user.profile:
            avatar_url = user.profile.avatar_url
            banner_url = getattr(user.profile, 'banner_url', None)
            bio = user.profile.bio
            learning_goals = user.profile.learning_goals
            collaboration_preference = user.profile.collaboration_preference
            display_name = user.profile.display_name
        elif user.avatar_url:
            avatar_url = user.avatar_url
        if user.banner_url:
            banner_url = user.banner_url
        if user.bio:
            bio = user.bio
            
        rank = "Beginner"
        followers_count = 0
        following_count = 0
        if user.stats:
            rank = user.stats.rank_level if user.stats.rank_level else "Beginner"
            followers_count = user.stats.followers_count or 0
            following_count = user.stats.following_count or 0
        
        # Get display_name from profile first, then user
        if not display_name:
            display_name = user.display_name or user.username
        
        user_interests = []
        if hasattr(user, 'interests') and user.interests:
            user_interests = [i.interest_tag for i in user.interests]
        
        return {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "display_name": display_name,
            "avatar_url": avatar_url,
            "banner_url": banner_url,
            "bio": bio,
            "learning_goals": learning_goals,
            "collaboration_preference": collaboration_preference,
            "xp": user.xp_points,
            "level": user.level,
            "rank": rank,
            "ranking_score": user.ranking_score or 1000,
            "followers_count": followers_count,
            "following_count": following_count,
            "skills": [
                {
                    "name": s.skill_name,
                    "level": s.skill_level,
                    "xp": s.xp,
                    "endorsed": s.endorsement_count,
                    "verified": bool(getattr(s, "verified", False))
                } 
                for s in user.skills
            ],
            "interests": user_interests,
            "onboarding_completed": user.onboarding_completed,
            "created_at": user.created_at.isoformat() if user.created_at else None
        }
    except Exception as e:
        print(f"/me error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to get user: {str(e)}")

# -----------------------------------------------------------------------------
# Route aliases for running auth_service directly (no Nginx rewrite)
# -----------------------------------------------------------------------------
auth_router = APIRouter(prefix="/auth")
auth_router.add_api_route("/health", health_check, methods=["GET"])
auth_router.add_api_route("/signup", signup, methods=["POST"], response_model=Token)
auth_router.add_api_route("/register", register, methods=["POST"], response_model=Token)
auth_router.add_api_route("/signup-basic", signup_basic, methods=["POST"], response_model=Token)
auth_router.add_api_route("/login", login, methods=["POST"], response_model=Token)
auth_router.add_api_route("/suggestions/skills", get_skill_suggestions, methods=["GET"])
auth_router.add_api_route("/onboarding/skills", save_onboarding_skills, methods=["POST"])
auth_router.add_api_route("/onboarding/interests", save_onboarding_interests, methods=["POST"])
auth_router.add_api_route("/onboarding/profile", save_onboarding_profile, methods=["POST"])
auth_router.add_api_route("/me", read_users_me, methods=["GET"])
app.include_router(auth_router)

