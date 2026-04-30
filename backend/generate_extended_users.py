"""
Extended Test Data Generator for Nexora
Creates 20 additional test users with diverse skills and profiles
"""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from passlib.context import CryptContext
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import random

os.environ.setdefault("DATABASE_URL", "postgresql://nexora:nexora123@localhost:5432/nexora_db")

from common.models import (
    Base,
    User,
    UserSkill,
    Skill,
    Profile,
    UserSocialStats,
    Follower,
    SkillPost,
    PostLike,
    Notification,
    UserConnection,
    UserProject,
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

EXTENDED_TEST_USERS = [
    {
        "username": "blockchain_dev",
        "email": "blockchain_dev@nexora.test",
        "display_name": "Marcus Johnson",
        "bio": "Blockchain Developer building decentralized applications. Web3 enthusiast and smart contract developer.",
        "location": "San Jose, CA",
        "experience_level": "Senior",
        "skills": ["Solidity", "Ethereum", "Web3", "JavaScript", "TypeScript"],
        "github_url": "https://github.com/blockchain-dev",
        "linkedin_url": "https://linkedin.com/in/blockchain-dev",
        "website": "https://marcusjohnson.io",
        "xp": 5200,
        "rank": "Gold III",
        "projects": [
            {"name": "DeFi Protocol", "description": "Decentralized finance protocol", "link": "https://github.com/blockchain-dev/defi", "tech": "Solidity, Ethereum, Web3.js"},
            {"name": "NFT Marketplace", "description": "NFT trading platform", "link": "https://github.com/blockchain-dev/nft-market", "tech": "Solidity, React, IPFS"}
        ]
    },
    {
        "username": "ai_researcher",
        "email": "ai_researcher@nexora.test",
        "display_name": "Dr. Nina Chen",
        "bio": "AI Researcher specializing in computer vision and deep learning. Published in top conferences.",
        "location": "Seattle, WA",
        "experience_level": "Expert",
        "skills": ["Computer Vision", "PyTorch", "Python", "Deep Learning", "Research"],
        "github_url": "https://github.com/ai-researcher",
        "linkedin_url": "https://linkedin.com/in/ai-researcher",
        "website": "https://ninachen.ai",
        "xp": 7200,
        "rank": "Platinum II",
        "projects": [
            {"name": "Vision Model", "description": "State-of-the-art image recognition", "link": "https://github.com/ai-researcher/vision-model", "tech": "PyTorch, CUDA, OpenCV"},
            {"name": "GAN Generator", "description": "Generative adversarial network", "link": "https://github.com/ai-researcher/gan", "tech": "PyTorch, TensorFlow"}
        ]
    },
    {
        "username": "rustacean",
        "email": "rustacean@nexora.test",
        "display_name": "Alex Rivera",
        "bio": "Rust Developer building high-performance systems. Memory safety advocate.",
        "location": "Austin, TX",
        "experience_level": "Senior",
        "skills": ["Rust", "Systems Programming", "WebAssembly", "C++", "Linux"],
        "github_url": "https://github.com/rustacean",
        "linkedin_url": "https://linkedin.com/in/rustacean",
        "website": "https://alexrivera.dev",
        "xp": 4100,
        "rank": "Gold I",
        "projects": [
            {"name": "Database Engine", "description": "High-performance embedded database", "link": "https://github.com/rustacean/db-engine", "tech": "Rust, WASM"},
            {"name": "OS Kernel", "description": "Toy operating system", "link": "https://github.com/rustacean/os", "tech": "Rust, Assembly"}
        ]
    },
    {
        "username": "graphql_guru",
        "email": "graphql_guru@nexora.test",
        "display_name": "Sarah Kim",
        "bio": "API Architect specializing in GraphQL. Building scalable data layers.",
        "location": "New York, NY",
        "experience_level": "Senior",
        "skills": ["GraphQL", "Apollo", "Node.js", "TypeScript", "PostgreSQL"],
        "github_url": "https://github.com/graphql-guru",
        "linkedin_url": "https://linkedin.com/in/graphql-guru",
        "website": "https://sarahkim.dev",
        "xp": 3800,
        "rank": "Gold I",
        "projects": [
            {"name": "GraphQL Gateway", "description": "Federated GraphQL gateway", "link": "https://github.com/graphql-guru/gateway", "tech": "GraphQL, Apollo, Node.js"},
            {"name": "API Generator", "description": "Auto-generate APIs from schemas", "link": "https://github.com/graphql-guru/api-gen", "tech": "GraphQL, TypeScript"}
        ]
    },
    {
        "username": "sre_lead",
        "email": "sre_lead@nexora.test",
        "display_name": "Michael Brown",
        "bio": "Site Reliability Engineering Lead. Building resilient infrastructure.",
        "location": "San Francisco, CA",
        "experience_level": "Expert",
        "skills": ["SRE", "Prometheus", "Grafana", "Kubernetes", "Incident Response"],
        "github_url": "https://github.com/sre-lead",
        "linkedin_url": "https://linkedin.com/in/sre-lead",
        "website": "https://mbrown.dev",
        "xp": 5500,
        "rank": "Gold III",
        "projects": [
            {"name": "Monitoring Stack", "description": "Full observability stack", "link": "https://github.com/sre-lead/monitoring", "tech": "Prometheus, Grafana, ELK"},
            {"name": "Chaos Engineering", "description": "Chaos testing framework", "link": "https://github.com/sre-lead/chaos", "tech": "Python, Kubernetes"}
        ]
    },
    {
        "username": "ux_researcher",
        "email": "ux_researcher@nexora.test",
        "display_name": "Jessica Lee",
        "bio": "UX Researcher understanding user behavior. Data-driven design decisions.",
        "location": "Los Angeles, CA",
        "experience_level": "Mid-Level",
        "skills": ["UX Research", "Figma", "User Testing", "Data Analysis", "Prototyping"],
        "github_url": "https://github.com/ux-researcher",
        "linkedin_url": "https://linkedin.com/in/ux-researcher",
        "website": "https://jessicalee.design",
        "xp": 2800,
        "rank": "Silver II",
        "projects": [
            {"name": "User Research Repo", "description": "Centralized research findings", "link": "https://github.com/ux-researcher/research-repo", "tech": "Miro, Figma, Notion"},
            {"name": "Testing Framework", "description": "User testing automation", "link": "https://github.com/ux-researcher/testing", "tech": "Python, Selenium"}
        ]
    },
    {
        "username": "backend_wizard",
        "email": "backend_wizard@nexora.test",
        "display_name": "David Park",
        "bio": "Backend Wizard specializing in distributed systems and microservices.",
        "location": "Chicago, IL",
        "experience_level": "Expert",
        "skills": ["Microservices", "Go", "gRPC", "Redis", "Kafka"],
        "github_url": "https://github.com/backend-wizard",
        "linkedin_url": "https://linkedin.com/in/backend-wizard",
        "website": "https://davidpark.io",
        "xp": 6200,
        "rank": "Platinum I",
        "projects": [
            {"name": "Service Mesh", "description": "Distributed tracing system", "link": "https://github.com/backend-wizard/mesh", "tech": "Go, gRPC, Jaeger"},
            {"name": "Message Queue", "description": "High-throughput queue", "link": "https://github.com/backend-wizard/mq", "tech": "Go, Kafka, Redis"}
        ]
    },
    {
        "username": "ios_ninja",
        "email": "ios_ninja@nexora.test",
        "display_name": "Kevin Zhang",
        "bio": "iOS Developer creating beautiful Apple experiences. SwiftUI enthusiast.",
        "location": "Cupertino, CA",
        "experience_level": "Senior",
        "skills": ["iOS", "Swift", "SwiftUI", "Objective-C", "Xcode"],
        "github_url": "https://github.com/ios-ninja",
        "linkedin_url": "https://linkedin.com/in/ios-ninja",
        "website": "https://kzhang.io",
        "xp": 4600,
        "rank": "Gold II",
        "projects": [
            {"name": "Finance App", "description": "Personal finance tracking", "link": "https://github.com/ios-ninja/finance", "tech": "Swift, SwiftUI, Core Data"},
            {"name": "Health Tracker", "description": "Health & wellness app", "link": "https://github.com/ios-ninja/health", "tech": "Swift, HealthKit, ResearchKit"}
        ]
    },
    {
        "username": "data_engineer",
        "email": "data_engineer@nexora.test",
        "display_name": "Amanda Foster",
        "bio": "Data Engineer building scalable data pipelines and warehouses.",
        "location": "Boston, MA",
        "experience_level": "Senior",
        "skills": ["Apache Spark", "SQL", "Airflow", "Snowflake", "Python"],
        "github_url": "https://github.com/data-engineer",
        "linkedin_url": "https://linkedin.com/in/data-engineer",
        "website": "https://afoster.data",
        "xp": 4900,
        "rank": "Gold II",
        "projects": [
            {"name": "ETL Pipeline", "description": "Real-time data pipeline", "link": "https://github.com/data-engineer/etl", "tech": "Spark, Airflow, Kafka"},
            {"name": "Data Warehouse", "description": "Cloud data warehouse", "link": "https://github.com/data-engineer/warehouse", "tech": "Snowflake, dbt, Airflow"}
        ]
    },
    {
        "username": "security_analyst",
        "email": "security_analyst@nexora.test",
        "display_name": "Robert Taylor",
        "bio": "Security Analyst focusing on application security and threat modeling.",
        "location": "Washington, DC",
        "experience_level": "Mid-Level",
        "skills": ["Application Security", "OWASP", "Burp Suite", "Python", "Threat Modeling"],
        "github_url": "https://github.com/security-analyst",
        "linkedin_url": "https://linkedin.com/in/security-analyst",
        "website": "https://rtaylor.security",
        "xp": 3400,
        "rank": "Silver II",
        "projects": [
            {"name": "Security Scanner", "description": "Automated vulnerability scanner", "link": "https://github.com/security-analyst/scanner", "tech": "Python, OWASP"},
            {"name": "Threat Model", "description": "Threat modeling toolkit", "link": "https://github.com/security-analyst/threat", "tech": "Python, Draw.io"}
        ]
    },
    {
        "username": "game_dev_pro",
        "email": "game_dev_pro@nexora.test",
        "display_name": "Chris Anderson",
        "bio": "Game Developer building immersive experiences with Unity and Unreal.",
        "location": "Las Vegas, NV",
        "experience_level": "Senior",
        "skills": ["Unity", "C#", "Unreal Engine", "Game Design", "3D Graphics"],
        "github_url": "https://github.com/game-dev-pro",
        "linkedin_url": "https://linkedin.com/in/game-dev-pro",
        "website": "https://canderson.games",
        "xp": 5100,
        "rank": "Gold III",
        "projects": [
            {"name": "RPG Game", "description": "Open-world RPG", "link": "https://github.com/game-dev-pro/rpg", "tech": "Unity, C#"},
            {"name": "Fighting Game", "description": "Multiplayer fighting game", "link": "https://github.com/game-dev-pro/fighter", "tech": "Unreal Engine, C++"}
        ]
    },
    {
        "username": "qa_automation",
        "email": "qa_automation@nexora.test",
        "display_name": "Maria Garcia",
        "bio": "QA Automation Engineer building robust testing frameworks.",
        "location": "Miami, FL",
        "experience_level": "Mid-Level",
        "skills": ["Selenium", "Playwright", "Cypress", "Python", "API Testing"],
        "github_url": "https://github.com/qa-automation",
        "linkedin_url": "https://linkedin.com/in/qa-automation",
        "website": "https://mgarcia.qa",
        "xp": 2900,
        "rank": "Silver II",
        "projects": [
            {"name": "Test Framework", "description": "Unified test automation", "link": "https://github.com/qa-automation/framework", "tech": "Playwright, TypeScript"},
            {"name": "API Tests", "description": "REST API testing suite", "link": "https://github.com/qa-automation/api", "tech": "Python, pytest, requests"}
        ]
    },
    {
        "username": "tech_writer",
        "email": "tech_writer@nexora.test",
        "display_name": "Jennifer White",
        "bio": "Technical Writer creating clear documentation for complex systems.",
        "location": "Portland, OR",
        "experience_level": "Mid-Level",
        "skills": ["Technical Writing", "API Docs", "Markdown", "Git", "Content Strategy"],
        "github_url": "https://github.com/tech-writer",
        "linkedin_url": "https://linkedin.com/in/tech-writer",
        "website": "https://jwhite.docs",
        "xp": 1800,
        "rank": "Bronze III",
        "projects": [
            {"name": "API Documentation", "description": "Comprehensive API docs", "link": "https://github.com/tech-writer/api-docs", "tech": "OpenAPI, Swagger"},
            {"name": "Developer Portal", "description": "Developer hub", "link": "https://github.com/tech-writer/portal", "tech": "Docusaurus, React"}
        ]
    },
    {
        "username": "vim_master",
        "email": "vim_master@nexora.test",
        "display_name": "Daniel Smith",
        "bio": "Vim enthusiast and efficiency advocate. Terminal workflows are the best.",
        "location": "Denver, CO",
        "experience_level": "Senior",
        "skills": ["Vim", "Bash", "Neovim", "Linux", "Tmux"],
        "github_url": "https://github.com/vim-master",
        "linkedin_url": "https://linkedin.com/in/vim-master",
        "website": "https://dsmith.vim",
        "xp": 3200,
        "rank": "Silver I",
        "projects": [
            {"name": "Vim Config", "description": "Ultimate Vim configuration", "link": "https://github.com/vim-master/vimrc", "tech": "VimScript, Lua"},
            {"name": "Neovim Plugin", "description": "Productivity plugin", "link": "https://github.com/vim-master/plugin", "tech": "Lua, VimScript"}
        ]
    },
    {
        "username": "cloud_architect",
        "email": "cloud_architect@nexora.test",
        "display_name": "Patricia Martinez",
        "bio": "Cloud Architect designing multi-cloud solutions for enterprise.",
        "location": "Atlanta, GA",
        "experience_level": "Expert",
        "skills": ["Cloud Architecture", "AWS", "Azure", "GCP", "Serverless"],
        "github_url": "https://github.com/cloud-architect",
        "linkedin_url": "https://linkedin.com/in/cloud-architect",
        "website": "https://pmartinez.cloud",
        "xp": 6800,
        "rank": "Platinum II",
        "projects": [
            {"name": "Multi-Cloud Setup", "description": "Cross-cloud deployment", "link": "https://github.com/cloud-architect/multi", "tech": "Terraform, AWS, Azure"},
            {"name": "Serverless Framework", "description": "Serverless patterns", "link": "https://github.com/cloud-architect/serverless", "tech": "Lambda, Azure Functions"}
        ]
    },
    {
        "username": "agile_coach",
        "email": "agile_coach@nexora.test",
        "display_name": "Thomas Wilson",
        "bio": "Agile Coach helping teams deliver value faster. Scrum Master certified.",
        "location": "Philadelphia, PA",
        "experience_level": "Senior",
        "skills": ["Agile", "Scrum", "Kanban", "Jira", "Team Leadership"],
        "github_url": "https://github.com/agile-coach",
        "linkedin_url": "https://linkedin.com/in/agile-coach",
        "website": "https://twilson.agile",
        "xp": 2400,
        "rank": "Bronze III",
        "projects": [
            {"name": "Sprint Board", "description": "Visual sprint management", "link": "https://github.com/agile-coach/board", "tech": "Jira, Confluence"},
            {"name": "Retrospective Tool", "description": "Team feedback tool", "link": "https://github.com/agile-coach/retro", "tech": "React, Node.js"}
        ]
    },
    {
        "username": "ml_ops_engineer",
        "email": "ml_ops_engineer@nexora.test",
        "display_name": "Lisa Anderson",
        "bio": "MLOps Engineer building production ML pipelines. MLOps best practices.",
        "location": "San Diego, CA",
        "experience_level": "Senior",
        "skills": ["MLOps", "Kubernetes", "MLflow", "Kubeflow", "Python"],
        "github_url": "https://github.com/ml-ops-engineer",
        "linkedin_url": "https://linkedin.com/in/ml-ops-engineer",
        "website": "https://landerson.mlops",
        "xp": 5700,
        "rank": "Gold III",
        "projects": [
            {"name": "ML Pipeline", "description": "End-to-end ML pipeline", "link": "https://github.com/ml-ops-engineer/pipeline", "tech": "Kubeflow, MLflow, Airflow"},
            {"name": "Model Serving", "description": "Scalable inference", "link": "https://github.com/ml-ops-engineer/serving", "tech": "TensorFlow Serving, KServe"}
        ]
    },
    {
        "username": "product_manager",
        "email": "product_manager@nexora.test",
        "display_name": "Jennifer Robinson",
        "bio": "Product Manager defining product strategy and roadmap. User-focused.",
        "location": "Austin, TX",
        "experience_level": "Mid-Level",
        "skills": ["Product Management", "Roadmapping", "Analytics", "User Research", "Jira"],
        "github_url": "https://github.com/product-manager",
        "linkedin_url": "https://linkedin.com/in/product-manager",
        "website": "https://jrobinson.pm",
        "xp": 2100,
        "rank": "Bronze II",
        "projects": [
            {"name": "Product Tracker", "description": "Feature tracking tool", "link": "https://github.com/product-manager/tracker", "tech": "Notion, Jira"},
            {"name": "Roadmap Builder", "description": "Visual roadmap builder", "link": "https://github.com/product-manager/roadmap", "tech": "Miro, Jira"}
        ]
    },
    {
        "username": "dev_advocate",
        "email": "dev_advocate@nexora.test",
        "display_name": "Brian Clark",
        "bio": "Developer Advocate bridging engineering and community. Speaker and educator.",
        "location": "Nashville, TN",
        "experience_level": "Mid-Level",
        "skills": ["Developer Relations", "Public Speaking", "Technical Content", "Community", "React"],
        "github_url": "https://github.com/dev-advocate",
        "linkedin_url": "https://linkedin.com/in/dev-advocate",
        "website": "https://bclark.dev",
        "xp": 2600,
        "rank": "Bronze I",
        "projects": [
            {"name": "Tutorial Series", "description": "Video tutorials", "link": "https://github.com/dev-advocate/tutorials", "tech": "YouTube, Gatsby"},
            {"name": "Demo App", "description": "Demo application", "link": "https://github.com/dev-advocate/demo", "tech": "React, Firebase"}
        ]
    },
    {
        "username": "database_expert",
        "email": "database_expert@nexora.test",
        "display_name": "Emily Davis",
        "bio": "Database Expert optimizing queries and designing schemas. Performance tuning pro.",
        "location": "Minneapolis, MN",
        "experience_level": "Expert",
        "skills": ["PostgreSQL", "MySQL", "Database Design", "Query Optimization", "Replication"],
        "github_url": "https://github.com/database-expert",
        "linkedin_url": "https://linkedin.com/in/database-expert",
        "website": "https://edavis.db",
        "xp": 4400,
        "rank": "Gold II",
        "projects": [
            {"name": "Query Optimizer", "description": "Query analysis tool", "link": "https://github.com/database-expert/optimizer", "tech": "PostgreSQL, Python"},
            {"name": "Schema Designer", "description": "Visual schema builder", "link": "https://github.com/database-expert/schema", "tech": "React, PostgreSQL"}
        ]
    }
]

SAMPLE_POSTS = [
    "Just launched a new feature! Excited to see the user feedback.",
    "Working on optimizing database queries. 10x performance improvement!",
    "Great team collaboration today. Agile is really working for us.",
    "Just completed another certification. Learning never stops!",
    "Building in public: sharing my journey on developing a new product.",
    "Debugging is like being a detective. Love the thrill of finding bugs!",
    "Documentation day! Making things clearer for everyone.",
    "Testing in production (not really). Love the thrill of deployment!",
    "Code review insights: always learning from the team.",
    "Just discovered an amazing new tool. Can't wait to try it!"
]

def ensure_skill(db, skill_name):
    skill = db.query(Skill).filter(Skill.canonical_name == skill_name).first()
    if not skill:
        skill = Skill(canonical_name=skill_name)
        db.add(skill)
        db.flush()
    return skill

def create_extended_users():
    engine = create_engine(os.getenv("DATABASE_URL", "postgresql://postgres:postgres@postgres:5432/nexora_master"))
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    db = Session()
    
    try:
        hashed_password = pwd_context.hash("password123")
        
        all_skills = set()
        for user_data in EXTENDED_TEST_USERS:
            for skill in user_data["skills"]:
                all_skills.add(skill)
        
        for skill_name in all_skills:
            ensure_skill(db, skill_name)
        
        db.commit()
        
        created_users = []
        
        for user_data in EXTENDED_TEST_USERS:
            existing_user = db.query(User).filter(User.username == user_data["username"]).first()
            if existing_user:
                print(f"User {user_data['username']} already exists, skipping...")
                created_users.append(existing_user)
                continue
            
            user = User(
                username=user_data["username"],
                email=user_data["email"],
                hashed_password=hashed_password,
                display_name=user_data["display_name"],
                bio=user_data["bio"],
                location=user_data["location"],
                is_active=True,
                onboarding_completed=True,
                online_status="offline"
            )
            db.add(user)
            db.flush()
            
            profile = Profile(
                user_id=user.id,
                display_name=user_data["display_name"],
                bio=user_data["bio"],
                experience_level=user_data.get("experience_level"),
                github_url=user_data.get("github_url"),
                linkedin_url=user_data.get("linkedin_url"),
                portfolio_links=[user_data.get("website")] if user_data.get("website") else [],
            )
            db.add(profile)
            
            social_stats = UserSocialStats(
                user_id=user.id,
                followers_count=0,
                following_count=0,
                posts_count=0,
                xp_total=user_data["xp"],
                rank_level=user_data["rank"]
            )
            db.add(social_stats)
            
            for skill_name in user_data["skills"]:
                skill = ensure_skill(db, skill_name)
                user_skill = UserSkill(
                    user_id=user.id,
                    skill_id=skill.id,
                    skill_name=skill.canonical_name,
                    skill_level=random.randint(2, 5),
                    xp=random.randint(500, 2000),
                    is_primary=True,
                    verified=random.choice([True, False])
                )
                db.add(user_skill)
            
            db.commit()
            db.refresh(user)
            created_users.append(user)
            print(f"Created user: {user.username}")
        
        for i, user in enumerate(created_users):
            potential_follows = [u for u in created_users if u.id != user.id]
            follow_count = random.randint(2, min(4, len(potential_follows)))
            follow_targets = random.sample(potential_follows, follow_count)
            
            for target in follow_targets:
                existing = db.query(Follower).filter(
                    Follower.follower_id == user.id,
                    Follower.following_id == target.id
                ).first()
                
                if not existing:
                    follow = Follower(follower_id=user.id, following_id=target.id)
                    db.add(follow)
        
        db.commit()
        
        for user in created_users:
            post_count = random.randint(1, 3)
            for i in range(post_count):
                content = random.choice(SAMPLE_POSTS)
                skill_post = SkillPost(
                    user_id=user.id,
                    content=content,
                    likes_count=0,
                    comments_count=0,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(0, 30))
                )
                db.add(skill_post)
        
        db.commit()
        
        for user, user_data in zip(created_users, EXTENDED_TEST_USERS):
            for proj in user_data.get("projects", [])[:2]:
                project = UserProject(
                    user_id=user.id,
                    project_name=proj["name"],
                    project_description=proj["description"],
                    project_link=proj["link"],
                    tech_stack=[tech.strip() for tech in proj["tech"].split(",")],
                )
                db.add(project)
        
        db.commit()
        
        for user in created_users:
            followers_count = db.query(Follower).filter(Follower.following_id == user.id).count()
            following_count = db.query(Follower).filter(Follower.follower_id == user.id).count()
            posts_count = db.query(SkillPost).filter(SkillPost.user_id == user.id).count()
            
            stats = db.query(UserSocialStats).filter(UserSocialStats.user_id == user.id).first()
            if stats:
                stats.followers_count = followers_count
                stats.following_count = following_count
                stats.posts_count = posts_count
        
        db.commit()
        
        print("\n" + "="*60)
        print("✅ EXTENDED TEST DATA CREATED!")
        print("="*60)
        print(f"Total new users: {len(created_users)}")
        print(f"Password: password123")
        
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    create_extended_users()