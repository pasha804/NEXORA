# Nexora AI Coach - API Documentation

## Overview
The AI Coach system provides personalized skill analysis, career guidance, and learning recommendations through a comprehensive set of RESTful endpoints.

**Base URL**: `http://localhost:8000`  
**Authentication**: All endpoints require JWT Bearer token in Authorization header

---

## Endpoints

### 1. GET /ai/skill-analysis
**Description**: Returns comprehensive skill analysis including radar chart data and skill breakdowns.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "radar_skills": [
    {"skill": "Programming", "level": 85, "maxLevel": 100},
    {"skill": "Design", "level": 62, "maxLevel": 100},
    ...
  ],
  "skill_breakdown": [
    {
      "skill": "React Development",
      "level": 7,
      "aiScore": 82,
      "suggestion": "Improve performance optimization...",
      "color": "neon-blue"
    },
    ...
  ],
  "overall_score": 78,
  "user_level": 12,
  "xp_points": 3500
}
```

---

### 2. GET /ai/roadmap
**Description**: Generates a personalized 4-week learning roadmap based on user's skill gaps.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "weeks": [
    {
      "week": 1,
      "title": "Advanced React Patterns",
      "status": "completed",
      "tasks": [
        {"title": "Master React Hooks", "completed": true, "type": "learning"},
        ...
      ]
    },
    ...
  ],
  "estimated_completion": "4 weeks",
  "total_tasks": 14,
  "completed_tasks": 3
}
```

---

### 3. GET /ai/career-predict
**Description**: AI-predicted career directions with compatibility scores and salary data.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "career_paths": [
    {
      "title": "Frontend Specialist",
      "compatibilityScore": 92,
      "requiredSkills": ["React", "TypeScript", "CSS Architecture"],
      "timeToMastery": "3-4 months",
      "marketDemand": "High",
      "avgSalary": "$95k - $140k",
      "description": "Master modern frontend frameworks..."
    },
    ...
  ],
  "user_profile": "John Doe"
}
```

---

### 4. GET /ai/recommendations
**Description**: Personalized recommendations for courses, collaborations, battles, and projects.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "recommendations": [
    {
      "id": "1",
      "type": "course",
      "title": "Advanced TypeScript Patterns",
      "description": "Master advanced type systems...",
      "matchScore": 95,
      "tags": ["TypeScript", "Advanced", "3 hours"]
    },
    ...
  ]
}
```

**Recommendation Types**:
- `course` - Learning courses
- `collaboration` - Networking opportunities
- `battle` - PvP challenges
- `project` - Hands-on projects

---

### 5. GET /ai/daily-missions
**Description**: Auto-generated daily tasks tailored to user improvement areas.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "missions": [
    {
      "id": "1",
      "title": "Solve 2 React coding challenges",
      "description": "Practice your problem-solving skills...",
      "xpReward": 50,
      "completed": false
    },
    ...
  ],
  "totalXP": 285,
  "completedCount": 0
}
```

---

### 6. GET /ai/performance-analytics
**Description**: Returns XP growth data, battle statistics, and skill progression over time.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "xp_growth": [
    {"date": "2026-01-01", "xp": 2800},
    {"date": "2026-01-08", "xp": 3100},
    ...
  ],
  "battle_stats": {
    "total_matches": 42,
    "wins": 28,
    "losses": 14,
    "win_rate": 66.7,
    "current_streak": 5
  },
  "skill_progression": [
    {"skill": "React", "week1": 70, "week2": 75, "week3": 80, "week4": 85},
    ...
  ],
  "weekly_improvement": 12
}
```

---

### 7. POST /ai/chat
**Description**: Conversational AI coach endpoint for interactive Q&A.

**Authentication**: Required

**Request Body**:
```json
{
  "message": "How can I improve my React skills?",
  "context": {}
}
```

**Response** (200 OK):
```json
{
  "response": "That's a great question! When optimizing React...",
  "context": {"user_level": 12},
  "suggested_actions": [
    "Take a quiz",
    "Start a micro-lesson",
    "Practice challenge"
  ]
}
```

---

### 8. GET /ai/industry-trends
**Description**: Provides trending skills, salary benchmarks, and job demand forecasts.

**Authentication**: Required

**Response** (200 OK):
```json
{
  "trending_skills": [
    {"skill": "AI/ML Engineering", "growth": "+45%", "demand": "Very High"},
    {"skill": "React & Next.js", "growth": "+32%", "demand": "High"},
    ...
  ],
  "salary_trends": {
    "Frontend": "$95k - $140k",
    "Backend": "$100k - $150k",
    "Full Stack": "$110k - $165k",
    ...
  },
  "job_demand_forecast": {
    "next_6_months": "High demand for React/TypeScript developers",
    "next_year": "AI integration skills will be essential",
    "emerging_tech": ["Edge Computing", "Web3", "AI Copilots"]
  }
}
```

---

## Error Responses

All endpoints may return the following error codes:

**401 Unauthorized**:
```json
{
  "detail": "Not authenticated"
}
```

**500 Internal Server Error**:
```json
{
  "detail": "Internal server error message"
}
```

---

## Authentication

All AI Coach endpoints require authentication via JWT token:

```http
GET /ai/skill-analysis HTTP/1.1
Host: localhost:8000
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Obtaining a Token**:
1. Register: `POST /auth/register`
2. Login: `POST /auth/login` (returns `access_token`)
3. Use token in `Authorization: Bearer <token>` header

---

## Rate Limiting

Currently, there are no rate limits. In production, consider implementing:
- 100 requests per minute per user
- Burst allowance of 20 requests

---

## Swagger Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## SDK Examples

### JavaScript/TypeScript
```typescript
const API_URL = "http://localhost:8000";
const token = localStorage.getItem("access_token");

// Fetch skill analysis
const response = await fetch(`${API_URL}/ai/skill-analysis`, {
  headers: {
    "Authorization": `Bearer ${token}`
  }
});
const data = await response.json();
```

### Python
```python
import requests

API_URL = "http://localhost:8000"
token = "your_jwt_token"

response = requests.get(
    f"{API_URL}/ai/skill-analysis",
    headers={"Authorization": f"Bearer {token}"}
)
data = response.json()
```

### cURL
```bash
curl -X GET "http://localhost:8000/ai/skill-analysis" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Future ML Integration

Currently, all endpoints return mock data. To integrate real ML models:

1. **Skill Analysis**: Replace mock data with TensorFlow/PyTorch model predictions
2. **Career Prediction**: Integrate career prediction algorithm based on skill matrix
3. **Recommendations**: Implement collaborative filtering or content-based recommendations
4. **Chat**: Integrate OpenAI GPT-4 or similar LLM

Example ML integration point in `backend/routers/ai.py`:
```python
# Replace this:
skill_analysis = {"radar_skills": [...]}

# With this:
from ml_models import SkillAnalyzer
analyzer = SkillAnalyzer()
skill_analysis = analyzer.analyze_user(current_user.id)
```

---

## Support

For API issues or questions:
- GitHub Issues: [project-repo]/issues
- Email: support@nexora.dev
- Documentation: /docs
