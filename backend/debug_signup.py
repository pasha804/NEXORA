"""
Test user generator for Nexora skill-based messaging verification.
Creates 10 users with different skill combinations for testing the messaging protocol.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from passlib.context import CryptContext
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

os.environ.setdefault("DATABASE_URL", "postgresql://postgres:postgres@localhost:5432/nexora_master")

from common.models import Base, User, UserSkill, Skill, Profile, UserSocialStats

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

SKILL_COMBINATIONS = [
    {"skills": ["React", "JavaScript"], "username": "react_dev", "display_name": "React Developer"},
    {"skills": ["React", "NodeJS"], "username": "fullstack_dev", "display_name": "Full Stack Developer"},
    {"skills": ["Python", "FastAPI"], "username": "python_dev", "display_name": "Python Developer"},
    {"skills": ["Cybersecurity"], "username": "security_expert", "display_name": "Cybersecurity Expert"},
    {"skills": ["DevOps", "Docker"], "username": "devops_engineer", "display_name": "DevOps Engineer"},
    {"skills": ["React", "CSS"], "username": "ui_designer", "display_name": "UI Designer"},
    {"skills": ["Machine Learning"], "username": "ml_engineer", "display_name": "ML Engineer"},
    {"skills": ["Data Science"], "username": "data_scientist", "display_name": "Data Scientist"},
    {"skills": ["React", "TypeScript"], "username": "ts_expert", "display_name": "TypeScript Expert"},
    {"skills": ["UI/UX Design"], "username": "ux_designer", "display_name": "UX Designer"},
]

def ensure_skill(db, skill_name):
    skill = db.query(Skill).filter(Skill.canonical_name == skill_name).first()
    if not skill:
        skill = Skill(canonical_name=skill_name)
        db.add(skill)
        db.flush()
    return skill

def create_test_users():
    engine = create_engine(os.getenv("DATABASE_URL", "postgresql://nexora:nexora123@localhost:5432/nexora_db"))
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        for combo in SKILL_COMBINATIONS:
            existing_user = db.query(User).filter(User.username == combo["username"]).first()
            if existing_user:
                print(f"User {combo['username']} already exists, skipping...")
                continue
            
            hashed_password = pwd_context.hash("password123")
            
            user = User(
                username=combo["username"],
                email=f"{combo['username']}@nexora.test",
                hashed_password=hashed_password,
                display_name=combo["display_name"],
                bio=f"Test user with skills: {', '.join(combo['skills'])}",
                is_active=True
            )
            db.add(user)
            db.flush()
            
            profile = Profile(
                user_id=user.id,
                display_name=combo["display_name"],
                bio=f"Test user with skills: {', '.join(combo['skills'])}"
            )
            db.add(profile)
            
            social_stats = UserSocialStats(
                user_id=user.id,
                followers_count=0,
                following_count=0,
                posts_count=0
            )
            db.add(social_stats)
            
            for skill_name in combo["skills"]:
                skill = ensure_skill(db, skill_name)
                user_skill = UserSkill(
                    user_id=user.id,
                    skill_id=skill.id,
                    skill_name=skill.canonical_name,
                    skill_level=1,
                    xp=100,
                    is_primary=True
                )
                db.add(user_skill)
            
            print(f"Created user: {combo['username']} with skills: {combo['skills']}")
        
        db.commit()
        print("\n✅ All test users created successfully!")
        print("\nTest credentials: username/password123")
        print("\nSkill-based messaging test cases:")
        print("- react_dev (React, JavaScript) ↔ ui_designer (React, CSS) = CAN message (shared: React)")
        print("- react_dev (React, JavaScript) ↔ security_expert (Cybersecurity) = CANNOT message (no shared skill)")
        
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_users()
