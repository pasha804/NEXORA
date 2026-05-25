# Nexora AI Coach — API Reference

**Version**: 5.0 | May 2026  
**Base URL**: `http://localhost:80`  
**Auth**: All endpoints require `Authorization: Bearer <token>`

---

## Endpoints

### GET /ai/skill-analysis
Returns skill radar chart data and per-skill breakdown.

**Response**:
```json
{
  "radar_skills": [
    {"skill": "React", "level": 85, "maxLevel": 100}
  ],
  "skill_breakdown": [
    {
      "skill": "React",
      "level": 7,
      "aiScore": 82,
      "suggestion": "Continue practicing React and complete challenges.",
      "color": "neon-blue"
    }
  ],
  "overall_score": 78,
  "user_level": 12,
  "xp_points": 3500
}
```

---

### GET /ai/roadmap
Personalized learning roadmap based on skill gaps vs trending skills.

**Response**:
```json
{
  "weeks": [
    {
      "week": 1,
      "title": "Master TypeScript",
      "status": "current",
      "tasks": [
        {"title": "Learn TypeScript basics", "completed": false, "type": "learning"},
        {"title": "Build TypeScript project", "completed": false, "type": "project"}
      ]
    }
  ],
  "estimated_completion": "3 weeks",
  "total_tasks": 6,
  "completed_tasks": 0
}
```

---

### GET /ai/career-predict
AI-predicted career paths with compatibility scores.

**Response**:
```json
{
  "career_paths": [
    {
      "title": "Software Engineer",
      "compatibilityScore": 85,
      "requiredSkills": ["Problem Solving", "System Design"],
      "timeToMastery": "6 months",
      "marketDemand": "High",
      "avgSalary": "$90k - $150k",
      "description": "Focus on scalable architecture and clean code."
    }
  ],
  "user_profile": "username"
}
```

---

### GET /ai/recommendations
Personalized skill recommendations based on trending skills the user doesn't have.

**Response**:
```json
{
  "recommendations": [
    {
      "id": "rec_TypeScript",
      "type": "skill",
      "title": "Master TypeScript",
      "description": "42 users have this skill - trending now!",
      "matchScore": 90,
      "tags": ["TypeScript", "Trending"]
    }
  ]
}
```

---

### GET /ai/daily-missions
Auto-generated daily tasks tailored to user's skills.

**Response**:
```json
{
  "missions": [
    {
      "id": "m1",
      "title": "Participate in 1 PvP Battle",
      "description": "Test your speed and logic against others.",
      "xpReward": 100,
      "completed": false
    },
    {
      "id": "m2",
      "title": "Practice React",
      "description": "Master the fundamentals of React.",
      "xpReward": 50,
      "completed": false
    }
  ],
  "totalXP": 150,
  "completedCount": 0
}
```

---

### GET /ai/performance-analytics
Comprehensive analytics: XP growth, battle stats, weekly progress.

**Response**:
```json
{
  "xp_growth": [{"date": "Current", "xp": 3500}],
  "battle_stats": {
    "total_matches": 42,
    "wins": 28,
    "losses": 14,
    "win_rate": 66.7,
    "current_streak": 5
  },
  "skill_progression": [
    {"skill": "React", "week1": 0, "week4": 3}
  ],
  "weekly_stats": {
    "lessons_completed": 0,
    "lessons_target": 10,
    "battles_won": 28,
    "battles_target": 7,
    "streak": 5,
    "xp_earned": 3500
  },
  "coaching_stats": {
    "total_hours": 17.5,
    "skills_improved": 3,
    "recommendations_used": 0,
    "career_readiness": "55%"
  },
  "focus_tip": {
    "tip": "Your performance peaks when you tackle new challenges.",
    "recommendation": "Block Focus Time for your next PvP battle."
  }
}
```

---

### POST /ai/chat
Conversational AI coach. Returns contextual response based on user's real data.

**Request**:
```json
{
  "message": "How can I improve my React skills?",
  "context": {"timestamp": "2026-05-01T10:00:00Z", "platform": "web"}
}
```

**Response**:
```json
{
  "response": "Based on your level 12 status and focus in React, I recommend focusing on advanced architecture patterns today.",
  "context": {"user_level": 12, "primary_skill": "React"},
  "suggested_actions": ["Take a quiz", "Start a micro-lesson", "Practice challenge"]
}
```

---

### GET /ai/industry-trends
Trending skills, salary benchmarks, job demand forecasts.

**Response**:
```json
{
  "trending_skills": [
    {"skill": "AI/ML Engineering", "growth": "+45%", "demand": "Very High"},
    {"skill": "React & Next.js", "growth": "+32%", "demand": "High"}
  ],
  "salary_trends": {
    "Frontend": "$95k - $140k",
    "Backend": "$100k - $150k",
    "Full Stack": "$110k - $165k",
    "DevOps": "$105k - $155k",
    "AI/ML": "$130k - $200k"
  },
  "job_demand_forecast": {
    "next_6_months": "High demand for React/TypeScript developers",
    "next_year": "AI integration skills will be essential",
    "emerging_tech": ["Edge Computing", "Web3", "AI Copilots"]
  }
}
```

---

### GET /ai/alerts
Smart alerts for the AI Coach panel.

**Response**:
```json
{
  "alerts": [
    {
      "id": "focus_tip",
      "type": "tip",
      "title": "Focus window detected",
      "message": "Your best performance comes from uninterrupted 45-minute practice blocks.",
      "timestamp": "2026-05-01T10:00:00Z",
      "read": false,
      "actionText": "Start now"
    }
  ]
}
```

---

### POST /ai/alerts/{alert_id}/read
Mark an alert as read.

**Response**: `{"ok": true, "alert_id": "focus_tip", "user_id": 1}`

---

### GET /ai/goals
Fetch user's active and completed goals.

**Response**: Array of `UserGoalResponse` objects.

---

### POST /ai/goals
Create a new personal goal.

**Request**:
```json
{
  "title": "Win 10 PvP battles",
  "category": "pvp",
  "target": 10.0,
  "reward": "Gold rank badge"
}
```

---

### GET /ai/achievements
All achievements (earned + locked) for the current user.

---

### GET /ai/goals-tracker
Unified endpoint for the GoalsTracker component — returns goals, achievements, and daily missions in one call.

---

## Authentication

```http
GET /ai/skill-analysis HTTP/1.1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Get a token:
1. `POST /auth/login` with `{"email": "...", "password": "..."}`
2. Use `access_token` from response

---

## Error Responses

| Code | Meaning |
|------|---------|
| 401 | Token missing or expired |
| 404 | Resource not found |
| 500 | Server error |

---

## Interactive Docs

- Swagger UI: `http://localhost:80/docs`
- ReDoc: `http://localhost:80/redoc`

---

## SDK Examples

### TypeScript
```typescript
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:80";
const token = localStorage.getItem("access_token");

const analysis = await fetch(`${API_URL}/ai/skill-analysis`, {
  headers: { "Authorization": `Bearer ${token}` }
}).then(r => r.json());
```

### Python
```python
import requests

resp = requests.get(
    "http://localhost:80/ai/skill-analysis",
    headers={"Authorization": f"Bearer {token}"}
)
data = resp.json()
```

### cURL
```bash
curl -X GET "http://localhost:80/ai/skill-analysis" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## Notes

- All AI responses are currently rule-based (no LLM integration)
- To integrate a real LLM, replace the response logic in `backend/routers/ai.py`
- The `/ai/chat` endpoint uses random selection from contextual templates
- Future: streaming responses via Server-Sent Events
