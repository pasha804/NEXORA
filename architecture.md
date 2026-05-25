# Nexora Platform — Architecture

> Version 3.0 | May 2026

## Overview

Nexora is a skill-based social platform built on a **microservices architecture** with an API gateway, a monolithic core API for primary features, and specialized microservices for isolated domains. The frontend is a React SPA served by a Vite dev server (development) or a static build (production).

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                              │
│                    React + TypeScript (Vite)                        │
│                       http://localhost:5173                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │ HTTP / WebSocket
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    NGINX API GATEWAY (:80)                          │
│  - CORS headers (single source of truth)                            │
│  - Route-based proxying to microservices                            │
│  - /auth/* → auth_service:8000                                      │
│  - /* (all others) → core_api:8000                                  │
└──────┬──────────────────────────────────────────────────────────────┘
       │
       ├──────────────────────────────────────────────────────────────┐
       │                                                              │
       ▼                                                              ▼
┌──────────────┐                                          ┌───────────────────┐
│  AUTH SERVICE│                                          │   CORE API        │
│  FastAPI:8000│                                          │   FastAPI:8000    │
│              │                                          │                   │
│  /signup     │                                          │  /users           │
│  /login      │                                          │  /social          │
│  /me         │                                          │  /search          │
│  /onboarding │                                          │  /pvp             │
│              │                                          │  /ai              │
└──────┬───────┘                                          │  /skills          │
       │                                                  │  /posts           │
       │                                                  │  /messages        │
       │                                                  │  /notifications   │
       │                                                  │  /connections     │
       │                                                  │  /dashboard       │
       │                                                  │  /reels           │
       │                                                  │  /communities     │
       │                                                  │  /presence        │
       │                                                  │  Socket.IO        │
       │                                                  │  (/battle/socket) │
       │                                                  └────────┬──────────┘
       │                                                           │
       └──────────────────────┬────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     SHARED INFRASTRUCTURE                           │
│                                                                     │
│  ┌─────────────────────┐        ┌──────────────────────────────┐   │
│  │  PostgreSQL (:5432) │        │  Redis (:6379)               │   │
│  │  nexora_master DB   │        │  - Session cache             │   │
│  │  - All tables       │        │  - Feed cache (120s TTL)     │   │
│  │  - Single schema    │        │  - Trending cache (300s TTL) │   │
│  └─────────────────────┘        │  - Pub/Sub for events        │   │
│                                 └──────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Microservices Inventory

All services share the same PostgreSQL database and Redis instance via Docker network `nexora-net`.

| Service | Container | Port (internal) | Responsibility |
|---------|-----------|-----------------|----------------|
| `core_api` | nexora_core | 8000 | Primary API — users, social, PvP, AI, search, feed |
| `auth_service` | nexora_auth | 8000 | Authentication, signup, login, onboarding |
| `profile_service` | nexora_profile | 8000 | Extended profile management |
| `settings_service` | nexora_settings | 8000 | User account settings |
| `media_service` | nexora_media | 8000 | File/image upload and serving |
| `matchmaking_service` | nexora_matchmaking | 8000 | PvP queue management |
| `battle_engine_service` | nexora_battle_engine | 8000 | Battle logic and judging |
| `ranking_service` | nexora_ranking | 8000 | ELO/MMR calculation, leaderboards |
| `economy_service` | nexora_economy | 8000 | XP and coin rewards |
| `spectator_service` | nexora_spectator | 8000 | Live match spectating |
| `notification_service` | nexora_notifications | 8000 | Push notifications |
| `realtime_service` | nexora_realtime | 8000 | WebSocket presence |
| `feed_service` | nexora_feed | 8000 | Social feed aggregation |
| `activity_service` | nexora_activity | 8000 | User activity tracking |
| `recommendation_service` | nexora_recommendation | 8000 | AI-powered recommendations |
| `growth_engine` | nexora_growth | 8000 | Growth analytics |
| `gamification_service` | nexora_gamification | 8000 | XP, streaks, daily quests |
| `skill_intelligence_service` | nexora_skill_intelligence | 8000 | Skill graph and AI insights |
| `creator_economy_service` | nexora_creator | 8000 | Creator monetization |
| `battle_pass_service` | nexora_battlepass | 8000 | Season pass progression |
| `graph_ai_service` | nexora_graph | 8000 | Graph-based AI recommendations |
| `analytics_service` | nexora_analytics | 8000 | Platform analytics |
| `celery_worker` | nexora_ui_worker | — | Background task processing |
| `api_gateway` | nexora_gateway | 80 | Nginx reverse proxy + CORS |
| `frontend` | nexora_frontend | 5173 | React dev server |

---

## Core API Router Map

The `core_api` (`backend/main.py`) mounts all primary routers:

```
/auth/*          → routers/auth.py          (JWT auth helpers)
/users/*         → routers/users.py         (profile CRUD, achievements)
/dashboard/*     → routers/dashboard.py     (home feed data)
/skills/*        → routers/skills.py        (skill registry, progression)
/pvp/*           → routers/pvp.py           (matchmaking, battles, history)
/tournaments/*   → routers/tournaments.py   (tournament management)
/connections/*   → routers/connections.py   (connection requests)
/posts/*         → routers/posts.py         (social posts, feed)
/social/*        → routers/social.py        (follow, recommendations, trending)
/search/*        → routers/search.py        (unified search, user search)
/messages/*      → routers/messages.py      (chat, conversations)
/notifications/* → routers/notifications.py (in-app notifications)
/presence/*      → routers/presence.py      (online status)
/ai/*            → routers/ai.py            (AI coach endpoints)
/reels/*         → routers/reels.py         (short-form video)
/communities/*   → routers/communities.py   (community management)
```

---

## Authentication Flow

```
Browser                    Nginx                  Auth Service           PostgreSQL
   │                         │                        │                      │
   │  POST /auth/login        │                        │                      │
   │─────────────────────────▶│                        │                      │
   │                         │  proxy to auth:8000    │                      │
   │                         │───────────────────────▶│                      │
   │                         │                        │  SELECT user WHERE   │
   │                         │                        │  email = ?           │
   │                         │                        │─────────────────────▶│
   │                         │                        │◀─────────────────────│
   │                         │                        │  bcrypt.verify()     │
   │                         │                        │  jwt.encode()        │
   │◀─────────────────────────────────────────────────│                      │
   │  { access_token, user }  │                        │                      │
   │                         │                        │                      │
   │  localStorage.setItem   │                        │                      │
   │  ("access_token", ...)  │                        │                      │
   │                         │                        │                      │
   │  GET /auth/me           │                        │                      │
   │  Authorization: Bearer  │                        │                      │
   │─────────────────────────▶│───────────────────────▶│                      │
   │◀─────────────────────────────────────────────────│                      │
   │  { full user object }   │                        │                      │
```

JWT tokens expire after **24 hours** (configurable via `ACCESS_TOKEN_EXPIRE_MINUTES` env var).

---

## Real-Time Architecture (Socket.IO)

```
Browser ──── Socket.IO ────▶ /battle/socket.io ──▶ core_api (battle_realtime.py)
                                                         │
                                                    Socket.IO namespaces:
                                                    - /battle  (PvP matches)
                                                    - /social  (follow events,
                                                                achievements)
                                                         │
                                                    Redis Pub/Sub
                                                    channel: nexora_events
                                                         │
                                              ┌──────────┴──────────┐
                                              │                     │
                                         reputation_service    notification_service
                                         (listens for events)  (listens for events)
```

Events published to Redis:
- `social_update` — follow/unfollow
- `profile_update` — profile changes
- `security_update` — trust score changes
- `pvp_skill_result` — battle XP awarded
- `match_result` — match completed
- `follow_created` — new follower
- `achievement_unlocked` — achievement earned

---

## Database Schema Overview

Single PostgreSQL database `nexora_master` with the following table groups:

**Users & Identity**
- `users` — core user record (XP, level, ranking_score)
- `profiles` — extended profile (bio, experience, education, projects)
- `user_social_stats` — follower counts, battle stats, streak, XP total
- `user_privacy_settings`, `user_notification_settings`, `user_account_settings`

**Skills**
- `skills` — canonical skill registry
- `skill_categories` — Frontend, Backend, AI/ML, DevOps, etc.
- `user_skills` — user ↔ skill mapping with XP and level
- `skill_badges` — verified skill badges (with optional blockchain token)
- `skill_proofs` — GitHub/portfolio/certificate proof attachments
- `skill_activity_log` — XP gain events per skill
- `skill_leaderboards` — per-skill rankings
- `skill_trending_data` — trending score cache

**Social**
- `followers` — follow relationships
- `posts` — social posts
- `skill_posts` — skill-specific posts
- `post_likes`, `post_comments` — engagement
- `user_activities` — activity stream
- `user_interests` — interest tags
- `skill_endorsements` — peer endorsements per skill

**PvP**
- `pvp_matches` — active and completed matches
- `pvp_challenges` — challenge bank (code, quiz, design)
- `pvp_submissions` — player code/answer submissions
- `pvp_match_results` — per-player result with XP/MMR delta
- `pvp_match_history` — completed match archive
- `pvp_ratings` — per-user MMR
- `pvp_matchmaking_queue` — active queue entries

**Gamification**
- `achievements` — achievement definitions
- `user_achievements` — earned achievements
- `user_rank` — rank tier per user
- `user_reputation` — reputation score breakdown
- `user_security_score` — trust/toxicity scores
- `daily_quests`, `user_quest_status` — daily mission system
- `battle_pass_seasons`, `battle_pass_tiers` — season pass

**Messaging**
- `chat_rooms` — 1:1 chat rooms
- `messages` — individual messages
- `notifications` — in-app notifications
- `connection_requests`, `user_connections` — connection system

**Content**
- `reels` — short-form video
- `reel_likes` — reel engagement
- `communities`, `community_members`, `community_posts` — community system
- `user_media`, `user_projects`, `user_resumes` — media and portfolio

---

## CORS Strategy

CORS is handled **exclusively by Nginx**. FastAPI services do NOT add CORS headers.

```nginx
map $http_origin $cors_origin {
    "http://localhost:5173"   "http://localhost:5173";
    "http://127.0.0.1:5173"  "http://127.0.0.1:5173";
    ...
}
```

All routes return:
- `Access-Control-Allow-Origin: <matched origin>`
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS`

---

## Caching Strategy (Redis)

| Cache Key | TTL | Content |
|-----------|-----|---------|
| `home_feed:{user_id}` | 120s | Home feed data |
| `trending_skills` | 300s | Trending skill list |
| `follow_recommendations:{user_id}` | 300s | Follow suggestions |
| `global_activity` | 60s | Global activity stream |

---

## Development Setup

```bash
# Start all services
docker compose up -d

# Frontend dev server (hot reload)
# Already running in nexora_frontend container on :5173
# Or run locally:
npm install && npm run dev

# Seed test users (31 accounts)
docker compose exec core_api python seed_test_users.py

# View logs
docker compose logs -f core_api
docker compose logs -f auth_service
```

Environment variables (`.env`):
```
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/nexora_master
JWT_SECRET=supersecretkey
REDIS_URL=redis://redis:6379/0
VITE_API_URL=http://localhost:80
ACCESS_TOKEN_EXPIRE_MINUTES=1440
```
