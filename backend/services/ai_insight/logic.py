from sqlalchemy.orm import Session
from common.models import AiProfileInsights, UserSkill
import json
from datetime import datetime

def generate_insights_logic(user_id: int, db: Session):
    """
    Mock AI logic to generate career insights based on user skills.
    """
    skills = db.query(UserSkill).filter(UserSkill.user_id == user_id).all()
    skill_names = [s.skill_name.lower() for s in skills]
    
    # Mock Rules
    growth = []
    career = "Generalist"
    collab = []
    gap = []
    
    if "python" in skill_names:
        growth.append("Learn FastAPI or Django for web dev.")
        growth.append("Explore PyTorch for AI/ML.")
        career = "Backend Developer / Data Scientist"
        collab.append("Frontend Developer (React/Vue)")
    
    if "react" in skill_names:
        growth.append("Learn Next.js for SSR.")
        growth.append("Master TypeScript.")
        career = "Frontend Engineer"
        collab.append("UI/UX Designer")
        gap.append("Backend logic (Node.js/Python)")
        
    if not skills:
        growth.append("Start by adding your core skills.")
        career = "Aspiring Tech Professional"

    # Update DB
    insights = db.query(AiProfileInsights).filter(AiProfileInsights.user_id == user_id).first()
    if not insights:
        insights = AiProfileInsights(user_id=user_id)
        db.add(insights)
    
    insights.growth_suggestions = json.dumps(growth)
    insights.career_prediction = career
    insights.collab_recommendations = json.dumps(collab)
    insights.skill_gap_analysis = json.dumps(gap)
    insights.generated_at = datetime.utcnow()
    
    db.commit()
    return insights
