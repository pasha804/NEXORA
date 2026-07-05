
from sqlalchemy.orm import Session
from common.database import SessionLocal, engine
from common.models import Base, User, Profile, UserSocialStats, UserPrivacySettings, UserNotificationSettings, UserSkill, Skill
from common.auth import get_password_hash
import random

# Test Data from test.txt
TEST_USERS = [
    # ═══ LEGENDARY (Grandmaster) ═══
    {"username": "basha_dev", "email": "basha_dev@nexora.test", "skills": ["JavaScript", "React", "NodeJS", "Python", "CSS", "System Design", "AWS", "Docker"], "xp": 99999, "rank": "Grandmaster", "reputation": 9999, "followers": 250000},
    
    # ═══ EPIC USERS (Master/Heroic) ═══
    {"username": "ai_researcher", "email": "ai_researcher@nexora.test", "skills": ["Computer Vision", "PyTorch", "Python", "Deep Learning", "Research"], "xp": 45000, "rank": "Master I", "reputation": 8000, "followers": 15000},
    {"username": "backend_wizard", "email": "backend_wizard@nexora.test", "skills": ["Microservices", "Go", "gRPC", "Redis", "Kafka"], "xp": 35000, "rank": "Master V", "reputation": 7500, "followers": 12000},
    {"username": "cloud_architect", "email": "cloud_architect@nexora.test", "skills": ["Cloud Architecture", "AWS", "Azure", "GCP", "Serverless"], "xp": 29000, "rank": "Heroic I", "reputation": 6500, "followers": 9000},
    {"username": "security_expert", "email": "security_expert@nexora.test", "skills": ["Ethical Hacking", "Cybersecurity", "Penetration Testing", "Security Compliance"], "xp": 28500, "rank": "Heroic II", "reputation": 6200, "followers": 8500},

    # ═══ HIGH RANK (Diamond/Platinum) ═══
    {"username": "react_dev", "email": "react_dev@nexora.test", "skills": ["React", "TypeScript", "Next.js", "Tailwind CSS"], "xp": 22000, "rank": "Diamond III", "reputation": 5000, "followers": 5000},
    {"username": "devops_engineer", "email": "devops_engineer@nexora.test", "skills": ["Kubernetes", "Docker", "Terraform", "Jenkins"], "xp": 21500, "rank": "Diamond V", "reputation": 4800, "followers": 4500},
    {"username": "data_engineer", "email": "data_engineer@nexora.test", "skills": ["Spark", "Hadoop", "Python", "SQL", "ETL"], "xp": 15000, "rank": "Platinum I", "reputation": 4200, "followers": 3800},
    {"username": "rustacean", "email": "rustacean@nexora.test", "skills": ["Rust", "Wasm", "Systems Programming"], "xp": 14800, "rank": "Platinum II", "reputation": 4100, "followers": 3500},

    # ═══ MID RANK (Gold/Silver) ═══
    {"username": "python_dev", "email": "python_dev@nexora.test", "skills": ["Python", "FastAPI", "Django", "PostgreSQL"], "xp": 9500, "rank": "Gold II", "reputation": 3200, "followers": 1500},
    {"username": "fullstack_dev", "email": "fullstack_dev@nexora.test", "skills": ["Node.js", "Express", "MongoDB", "Vue.js"], "xp": 9200, "rank": "Gold III", "reputation": 3000, "followers": 1200},
    {"username": "qa_automation", "email": "qa_automation@nexora.test", "skills": ["Selenium", "Cypress", "Pytest", "Automation"], "xp": 5800, "rank": "Silver I", "reputation": 2500, "followers": 800},
    {"username": "product_manager", "email": "product_manager@nexora.test", "skills": ["Product Strategy", "Agile", "Jira", "User Research"], "xp": 5600, "rank": "Silver II", "reputation": 2400, "followers": 750},

    # ═══ LOW RANK (Bronze/Novice) ═══
    {"username": "ui_designer", "email": "ui_designer@nexora.test", "skills": ["Figma", "UI/UX", "Design Systems"], "xp": 2800, "rank": "Bronze I", "reputation": 1500, "followers": 300},
    {"username": "tech_writer", "email": "tech_writer@nexora.test", "skills": ["Technical Writing", "Documentation", "API Docs"], "xp": 2600, "rank": "Bronze II", "reputation": 1400, "followers": 250},
    {"username": "agile_coach", "email": "agile_coach@nexora.test", "skills": ["Scrum", "Kanban", "Facilitation"], "xp": 800, "rank": "Novice", "reputation": 500, "followers": 100},
]

def seed_test_users():
    db = SessionLocal()
    print(f"Seeding {len(TEST_USERS)} test users...")
    
    # Pre-seed some canonical skills
    all_skills_names = set()
    for u in TEST_USERS:
        for s in u["skills"]:
            all_skills_names.add(s)
            
    skill_objects = {}
    for s_name in all_skills_names:
        # Check if skill exists
        skill = db.query(Skill).filter(Skill.canonical_name == s_name).first()
        if not skill:
            skill = Skill(canonical_name=s_name)
            db.add(skill)
            db.flush()
        skill_objects[s_name] = skill

    for user_data in TEST_USERS:
        # Check if user exists
        user = db.query(User).filter(User.email == user_data["email"]).first()
        if user:
            print(f"User {user_data['username']} already exists, skipping...")
            continue
            
        print(f"Creating user: {user_data['username']}")
        
        # 1. Create User
        xp_val = user_data["xp"]
        level_val = min(100, 1 + int(xp_val ** 0.45))  # Progressive level: 1 XP→1, 1000→8, 5000→16, 100000→100
        new_user = User(
            username=user_data["username"],
            email=user_data["email"],
            hashed_password=get_password_hash("password123"),
            display_name=user_data["username"].replace("_", " ").title(),
            xp_points=xp_val,
            level=level_val,
            ranking_score=user_data.get("ranking_score", xp_val // 2 + 500),
            onboarding_completed=True,
            is_active=True
        )
        db.add(new_user)
        db.flush() # Get ID
        
        # 2. Create Profile
        new_profile = Profile(
            user_id=new_user.id,
            display_name=new_user.display_name,
            bio=f"Senior {user_data['skills'][0]} enthusiast. Building Nexora.",
            experience_level="Senior" if user_data["xp"] > 4000 else "Intermediate"
        )
        db.add(new_profile)
        
        # 3. Create Social Stats
        reputation = user_data.get("reputation", random.randint(100, 500))
        followers = user_data.get("followers", random.randint(50, 500))
        new_stats = UserSocialStats(
            user_id=new_user.id,
            xp_total=user_data["xp"],
            rank_level=user_data["rank"],
            followers_count=followers,
            following_count=random.randint(10, max(50, followers // 10)),
            reputation_score=reputation,
            streak_days=random.randint(0, min(30, reputation // 100)),
        )
        db.add(new_stats)
        
        # 4. Create Settings
        db.add(UserPrivacySettings(user_id=new_user.id))
        db.add(UserNotificationSettings(user_id=new_user.id))
        
        # 5. Add Skills
        for s_name in user_data["skills"]:
            user_skill = UserSkill(
                user_id=new_user.id,
                skill_name=s_name,
                skill_id=skill_objects[s_name].id,
                skill_level=random.randint(1, 100),
                xp=random.randint(100, 1000),
                verified=True
            )
            db.add(user_skill)
            
    db.commit()
    print("Test users seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_test_users()
