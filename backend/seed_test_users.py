
from sqlalchemy.orm import Session
from common.database import SessionLocal, engine
from common.models import Base, User, Profile, UserSocialStats, UserPrivacySettings, UserNotificationSettings, UserSkill, Skill
from common.auth import get_password_hash
import random

# Test Data from test.txt
TEST_USERS = [
    # ORIGINAL TEST USERS
    {"username": "basha_dev", "email": "basha_dev@nexora.test", "skills": ["JavaScript", "React", "NodeJS", "Python", "CSS"], "xp": 1500, "rank": "Bronze I"},
    {"username": "react_dev", "email": "react_dev@nexora.test", "skills": ["React", "JavaScript"], "xp": 4500, "rank": "Gold III"},
    {"username": "python_dev", "email": "python_dev@nexora.test", "skills": ["Python", "FastAPI", "PostgreSQL", "Docker", "AWS"], "xp": 3200, "rank": "Silver I"},
    {"username": "fullstack_dev", "email": "fullstack_dev@nexora.test", "skills": ["React", "NodeJS", "MongoDB", "Express", "JavaScript"], "xp": 2800, "rank": "Silver II"},
    {"username": "security_expert", "email": "security_expert@nexora.test", "skills": ["Cybersecurity", "Penetration Testing", "Network Security", "Linux", "Python"], "xp": 5800, "rank": "Platinum II"},
    {"username": "devops_engineer", "email": "devops_engineer@nexora.test", "skills": ["DevOps", "Docker", "Kubernetes", "AWS", "Terraform"], "xp": 4200, "rank": "Gold II"},
    {"username": "ml_engineer", "email": "ml_engineer@nexora.test", "skills": ["Machine Learning", "Python", "TensorFlow", "NLP", "Data Science"], "xp": 6500, "rank": "Platinum III"},
    {"username": "data_scientist", "email": "data_scientist@nexora.test", "skills": ["Data Science", "Python", "Pandas", "SQL", "Tableau"], "xp": 3100, "rank": "Silver I"},
    {"username": "ui_designer", "email": "ui_designer@nexora.test", "skills": ["UI Design", "Figma", "CSS", "React", "Design Systems"], "xp": 2400, "rank": "Bronze III"},
    {"username": "mobile_dev", "email": "mobile_dev@nexora.test", "skills": ["Flutter", "Dart", "Firebase", "Android", "iOS"], "xp": 2600, "rank": "Bronze I"},
    {"username": "cloud_engineer", "email": "cloud_engineer@nexora.test", "skills": ["AWS", "GCP", "Terraform", "Docker", "Kubernetes"], "xp": 4800, "rank": "Gold I"},
    
    # EXTENDED TEST USERS
    {"username": "blockchain_dev", "email": "blockchain_dev@nexora.test", "skills": ["Solidity", "Ethereum", "Web3", "JavaScript", "TypeScript"], "xp": 5200, "rank": "Gold III"},
    {"username": "ai_researcher", "email": "ai_researcher@nexora.test", "skills": ["Computer Vision", "PyTorch", "Python", "Deep Learning", "Research"], "xp": 7200, "rank": "Platinum II"},
    {"username": "rustacean", "email": "rustacean@nexora.test", "skills": ["Rust", "Systems Programming", "WebAssembly", "C++", "Linux"], "xp": 4100, "rank": "Gold I"},
    {"username": "graphql_guru", "email": "graphql_guru@nexora.test", "skills": ["GraphQL", "Apollo", "Node.js", "TypeScript", "PostgreSQL"], "xp": 3800, "rank": "Gold I"},
    {"username": "sre_lead", "email": "sre_lead@nexora.test", "skills": ["SRE", "Prometheus", "Grafana", "Kubernetes", "Incident Response"], "xp": 5500, "rank": "Gold III"},
    {"username": "ux_researcher", "email": "ux_researcher@nexora.test", "skills": ["UX Research", "Figma", "User Testing", "Data Analysis", "Prototyping"], "xp": 2800, "rank": "Silver II"},
    {"username": "backend_wizard", "email": "backend_wizard@nexora.test", "skills": ["Microservices", "Go", "gRPC", "Redis", "Kafka"], "xp": 6200, "rank": "Platinum I"},
    {"username": "ios_ninja", "email": "ios_ninja@nexora.test", "skills": ["iOS", "Swift", "SwiftUI", "Objective-C", "Xcode"], "xp": 4600, "rank": "Gold II"},
    {"username": "data_engineer", "email": "data_engineer@nexora.test", "skills": ["Apache Spark", "SQL", "Airflow", "Snowflake", "Python"], "xp": 4900, "rank": "Gold II"},
    {"username": "security_analyst", "email": "security_analyst@nexora.test", "skills": ["Application Security", "OWASP", "Burp Suite", "Python", "Threat Modeling"], "xp": 3400, "rank": "Silver II"},
    {"username": "game_dev_pro", "email": "game_dev_pro@nexora.test", "skills": ["Unity", "C#", "Unreal Engine", "Game Design", "3D Graphics"], "xp": 5100, "rank": "Gold III"},
    {"username": "qa_automation", "email": "qa_automation@nexora.test", "skills": ["Selenium", "Playwright", "Cypress", "Python", "API Testing"], "xp": 2900, "rank": "Silver II"},
    {"username": "tech_writer", "email": "tech_writer@nexora.test", "skills": ["Technical Writing", "API Docs", "Markdown", "Git", "Content Strategy"], "xp": 1800, "rank": "Bronze III"},
    {"username": "vim_master", "email": "vim_master@nexora.test", "skills": ["Vim", "Bash", "Neovim", "Linux", "Tmux"], "xp": 3200, "rank": "Silver I"},
    {"username": "cloud_architect", "email": "cloud_architect@nexora.test", "skills": ["Cloud Architecture", "AWS", "Azure", "GCP", "Serverless"], "xp": 6800, "rank": "Platinum II"},
    {"username": "agile_coach", "email": "agile_coach@nexora.test", "skills": ["Agile", "Scrum", "Kanban", "Jira", "Team Leadership"], "xp": 2400, "rank": "Bronze III"},
    {"username": "ml_ops_engineer", "email": "ml_ops_engineer@nexora.test", "skills": ["MLOps", "Kubernetes", "MLflow", "Kubeflow", "Python"], "xp": 5700, "rank": "Gold III"},
    {"username": "product_manager", "email": "product_manager@nexora.test", "skills": ["Product Management", "Roadmapping", "Analytics", "User Research", "Jira"], "xp": 2100, "rank": "Bronze II"},
    {"username": "dev_advocate", "email": "dev_advocate@nexora.test", "skills": ["Developer Relations", "Public Speaking", "Technical Content", "Community", "React"], "xp": 2600, "rank": "Bronze I"},
    {"username": "database_expert", "email": "database_expert@nexora.test", "skills": ["PostgreSQL", "MySQL", "Database Design", "Query Optimization", "Replication"], "xp": 4400, "rank": "Gold II"},
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
        new_user = User(
            username=user_data["username"],
            email=user_data["email"],
            hashed_password=get_password_hash("password123"),
            display_name=user_data["username"].replace("_", " ").title(),
            xp_points=user_data["xp"],
            level=random.randint(1, 10),
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
        new_stats = UserSocialStats(
            user_id=new_user.id,
            xp_total=user_data["xp"],
            rank_level=user_data["rank"],
            followers_count=random.randint(10, 500),
            following_count=random.randint(10, 500)
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
