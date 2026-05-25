# NEXORA — Skill-Based Social Platform

![Version](https://img.shields.io/badge/Version-5.0.0-blue)
![React](https://img.shields.io/badge/React-19+-61DAFB)
![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688)
![License](https://img.shields.io/badge/License-Proprietary-green)

> **LinkedIn + Discord + TikTok + GitHub + AI** — combined into one ecosystem for developers.

---

## Vision

A high-performance platform where skills are verified through action, growth is visualized through gamification, and connections are forged through shared technical expertise.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS, Framer Motion, TanStack Query, Zustand |
| **Backend** | FastAPI, Python 3.11+, SQLAlchemy, Pydantic, Uvicorn, Socket.IO |
| **Database** | PostgreSQL 15, Redis 7 |
| **Infrastructure** | Docker, Nginx (API Gateway + CORS), Docker Compose |
| **Real-time** | Socket.IO (battle + social namespaces), Redis Pub/Sub |

---

## Architecture

```
Browser (React SPA :5173)
        │
        ▼
Nginx API Gateway (:80)          ← CORS handled here only
        │
        ├── /auth/*  ──────────► auth_service:8000
        └── /*       ──────────► core_api:8000  (FastAPI + Socket.IO)
                                        │
                                 PostgreSQL + Redis
```

Full architecture: see `architecture.md`

---

## Features

### Social
- **Followers/Following** — clickable counts open animated modal with enriched user cards (skills, rank, bio, follow/unfollow, remove follower)
- **Profile Privacy** — public/private profiles with owner bypass
- **Connection System** — send/accept/reject requests, messaging unlocked after connection
- **Real-time Follow** — instant UI updates + notifications

### Profile (LinkedIn-quality)
- Banner + avatar upload (base64)
- XP progress bar, PvP rank badge, reputation score
- Experience, Education, Projects, Skills sections — all editable
- Skill endorsements with toggle (endorse/remove)
- Verified skill badges
- Resume upload/download

### Discover
- Category filter pills (Frontend, Backend, AI/ML, DevOps, Design, Mobile, Cybersecurity, Blockchain, Database, Game Dev)
- Sort: Newest, XP High, Most Followed, Most Active
- Search by username, display_name, bio, skill_name
- Python-level deduplication (fixes PostgreSQL DISTINCT ON bug)
- Infinite scroll with Load More

### Messaging (WhatsApp/Discord-style)
- Skill-based messaging permission (shared skill OR accepted connection)
- Real-time via Socket.IO
- Typing indicators, seen status
- Conversation list with last message preview

### Communities (Discord-style)
- Create/join/leave communities
- Text channels, events, learning hub, projects
- AI assistant in community sidebar
- Real-time trending skills + top contributors

### Reels (TikTok/Instagram-style)
- Vertical snap-scroll feed
- Auto-play on viewport entry
- Like (optimistic), comment, share, save
- Double-tap to like
- Upload modal with caption + hashtags
- Empty state when no reels

### PvP Battle Arena
- ELO/MMR matchmaking (8 rank tiers: Novice → Grandmaster)
- 4 battle types: code_challenge, knowledge_quiz, problem_solving, timed_challenge
- AI Judge evaluates submissions
- Anti-cheat system (rate limiting, same-opponent detection, streak detection)
- Tournament system

### AI Coach
- Skill radar chart, learning roadmap, career predictions
- Daily missions, goals tracker, performance analytics
- Industry trends, AI recommendations
- Real-time chat interface

### Battle Pass
- Connected to real API (current_season, tiers, progress, unlock_tier)
- Graceful fallback when no season is active

### Gamification
- XP system: Level = (xp // 1000) + 1
- Daily streak multiplier: up to 2× at 70+ days
- Achievements with XP rewards
- Skill endorsements + verification badges
- Reputation score (0–100, composite)

---

## Quick Start

### Docker (recommended)

```bash
# 1. Clone
git clone <repo-url> && cd NEXORA

# 2. Start all services
docker compose up -d --build

# 3. Seed 31 test users
docker compose exec core_api python seed_test_users.py

# 4. Open
# Frontend: http://localhost:5173
# API:      http://localhost:80
# API Docs: http://localhost:80/docs
```

### Local Dev

```bash
# Frontend
npm install && npm run dev

# Backend
cd backend
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Environment Variables (`.env`)

```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/nexora_master
JWT_SECRET=supersecretkey
REDIS_URL=redis://redis:6379/0
VITE_API_URL=http://localhost:80
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```

---

## Test Credentials

All 31 test users use password: `password123`

See `test.txt` for the full list.

Quick logins:
- `cloud_engineer@nexora.test` — Gold rank, DevOps skills
- `ml_engineer@nexora.test` — Platinum rank, AI/ML skills
- `backend_wizard@nexora.test` — Platinum rank, Go/Microservices

---

## Project Structure

```
NEXORA/
├── src/                    # React frontend
│   ├── pages/             # Route pages (lazy loaded)
│   ├── components/        # Feature components
│   │   ├── profile/      # Profile + FollowersModal
│   │   ├── discover/     # PeopleDiscovery + filters
│   │   ├── messaging/    # Chat panels
│   │   ├── communities/  # Discord-style layout
│   │   ├── reels/        # TikTok-style feed
│   │   ├── pvp/          # Battle arena
│   │   ├── ai-coach/     # AI components
│   │   └── layout/       # AppLayout + CinematicIntro
│   ├── hooks/             # useAuth, useMessagingStore, useSocialSocket
│   └── context/           # GamificationContext
│
├── backend/
│   ├── main.py            # FastAPI app + Socket.IO + migrations
│   ├── routers/           # auth, users, social, pvp, ai, search, ...
│   ├── common/            # models, database, auth, social_utils
│   └── services/          # 22 microservices
│
├── nginx/nginx.conf        # API gateway + CORS
├── docker-compose.yml      # Full stack orchestration
├── architecture.md         # System architecture
├── folder-structure.md     # Full directory tree
├── rank.txt                # Rank & progression system docs
├── detail.txt              # Full platform documentation
└── test.txt                # Test credentials
```

---

## Key API Endpoints

| Category | Endpoint | Description |
|----------|---------|-------------|
| Auth | `POST /auth/login` | Login (JSON body) |
| Auth | `GET /auth/me` | Current user |
| Users | `GET /users/{username}` | Profile by username |
| Users | `PATCH /users/me` | Update profile |
| Social | `POST /social/follow/{id}` | Follow user |
| Social | `GET /social/followers/{id}` | Followers (enriched) |
| Social | `DELETE /social/followers/{id}` | Remove follower |
| Search | `GET /search/users` | User search with filters |
| PvP | `POST /pvp/queue/join` | Join matchmaking |
| AI | `GET /ai/skill-analysis` | Skill radar data |
| AI | `POST /ai/chat` | Chat with AI coach |
| Skills | `POST /skills/endorse` | Endorse a skill |
| Messages | `GET /messages/rooms` | Conversation list |
| Notifications | `GET /notifications/` | Notifications |

Full API reference: `http://localhost:80/docs`

---

## Known Limitations

- OAuth (Google/GitHub) buttons are UI-only — not wired to backend
- Reels video hosting requires CDN/S3 setup (URL-only storage currently)
- Voice/video channels in Communities are UI placeholders (WebRTC not implemented)
- AI chat uses rule-based responses — no LLM integration yet
- Battle Pass requires a `BattlePassSeason` row in DB for real season data

---

## Documentation Files

| File | Contents |
|------|---------|
| `README.md` | This file — overview and quick start |
| `detail.txt` | Full platform documentation v5.0 |
| `rank.txt` | Complete rank & progression system |
| `architecture.md` | System architecture with diagrams |
| `folder-structure.md` | Annotated directory tree |
| `test.txt` | All 31 test user credentials |
| `AI_COACH_API.md` | AI Coach API reference |

---

© 2026 NEXORA Platform. All rights reserved.
