# Nexora — Folder Structure

> Version 3.0 | May 2026

```
NEXORA/
│
├── .env                          # Environment variables (DATABASE_URL, JWT_SECRET, etc.)
├── .env.local                    # Local overrides (gitignored)
├── .gitignore
├── .dockerignore
├── docker-compose.yml            # All services orchestration
├── Dockerfile.frontend           # Frontend container build
├── vite.config.ts                # Vite dev server + API proxy config
├── package.json                  # Frontend dependencies
├── bun.lockb                     # Bun lockfile
├── components.json               # shadcn/ui component config
├── eslint.config.js
├── tsconfig.json
│
├── rank.txt                      # Rank & progression system documentation
├── architecture.md               # System architecture documentation
├── folder-structure.md           # This file
├── detail.txt                    # Full platform documentation
├── AI_COACH_API.md               # AI Coach API reference
│
│
├── ── FRONTEND ──────────────────────────────────────────────────────
│
├── src/
│   ├── main.tsx                  # React entry point
│   ├── App.tsx                   # Root component, BrowserRouter, all routes
│   ├── App.css
│   ├── index.css                 # Global styles, CSS variables, Tailwind base
│   ├── vite-env.d.ts
│   │
│   ├── pages/                    # One file per route
│   │   ├── Index.tsx             # / — Landing/marketing page
│   │   ├── Auth.tsx              # /auth — Login & signup
│   │   ├── Onboarding.tsx        # /onboarding — Multi-step profile setup
│   │   ├── Dashboard.tsx         # /dashboard — Home feed
│   │   ├── Discover.tsx          # /discover — Discovery hub
│   │   ├── Profile.tsx           # /profile/:username — User profile
│   │   ├── Messages.tsx          # /messages — Messaging
│   │   ├── PvP.tsx               # /pvp — Battle arena
│   │   ├── Communities.tsx       # /communities — Community hub
│   │   ├── Reels.tsx             # /reels — Short-form video
│   │   ├── AICoach.tsx           # /ai-coach — AI learning assistant
│   │   ├── BattlePass.tsx        # /battle-pass — Season pass
│   │   ├── Settings.tsx          # /settings — Account settings
│   │   └── NotFound.tsx          # /* — 404 fallback
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx         # Authenticated shell (sidebar + outlet)
│   │   │   ├── NotificationDropdown.tsx  # Bell icon + notification list
│   │   │   └── CinematicIntro.tsx    # Animated intro on first load
│   │   │
│   │   ├── ai-coach/             # AI Coach page components
│   │   │   ├── AIChatInterface.tsx   # Chat with AI (POST /ai/chat)
│   │   │   ├── AIHeroSection.tsx     # Welcome banner + level/XP display
│   │   │   ├── AIRecommendations.tsx # Personalized skill recommendations
│   │   │   ├── CareerPathPanel.tsx   # Career path predictions
│   │   │   ├── DailyMissions.tsx     # Daily gamified tasks
│   │   │   ├── GoalsTracker.tsx      # Goals + achievements + missions
│   │   │   ├── IndustryTrends.tsx    # Market trends and salary data
│   │   │   ├── LearningRoadmap.tsx   # Week-by-week skill roadmap
│   │   │   ├── PerformanceAnalytics.tsx  # Charts and battle stats
│   │   │   ├── SkillRadarChart.tsx   # Radar visualization of skills
│   │   │   └── SmartAlerts.tsx       # AI-generated alerts and tips
│   │   │
│   │   ├── chat/                 # Messaging components
│   │   ├── communities/          # Community components
│   │   │
│   │   ├── dashboard/            # Dashboard/home feed components
│   │   │   ├── MainFeed.tsx          # Post feed (GET /posts/feed)
│   │   │   ├── HomeRightSidebar.tsx  # Trending skills + suggested users
│   │   │   └── ...
│   │   │
│   │   ├── discover/             # Discover page tab components
│   │   │   ├── PeopleDiscovery.tsx   # User search (GET /search/users)
│   │   │   ├── ForYouFeed.tsx        # AI-curated feed
│   │   │   ├── SkillsExplorer.tsx    # Skill browsing
│   │   │   ├── CommunitiesGrid.tsx   # Community discovery
│   │   │   ├── ProjectMarketplace.tsx
│   │   │   ├── OpportunitiesBoard.tsx
│   │   │   ├── EventsCalendar.tsx
│   │   │   ├── TrendingContent.tsx
│   │   │   ├── DiscoverHeader.tsx    # Search bar + filters
│   │   │   ├── DiscoverTabs.tsx      # Tab navigation
│   │   │   ├── LoadingSkeletons.tsx
│   │   │   ├── EmptyStates.tsx
│   │   │   ├── EnhancedFeatures.tsx  # RealTimeIndicator, PullToRefresh
│   │   │   └── cards/                # Card sub-components
│   │   │
│   │   ├── home/                 # Landing page sections
│   │   ├── landing/              # Marketing components
│   │   │
│   │   ├── messaging/            # Messaging UI components
│   │   │
│   │   ├── profile/              # Profile page components
│   │   │   ├── HeroProfileHeader.tsx     # Banner + avatar + stats
│   │   │   ├── ProfileEditModal.tsx      # Edit modal (all sections)
│   │   │   ├── SkillReputation.tsx       # Skills with endorsements
│   │   │   ├── ProfessionalPortfolio.tsx # Experience/Education/Projects
│   │   │   ├── ContentShowcase.tsx       # Posts and activity
│   │   │   ├── PvPStats.tsx              # Battle stats widget
│   │   │   ├── AIGrowth.tsx              # AI growth insights
│   │   │   └── SkillActivityTimeline.tsx # Skill activity log
│   │   │
│   │   ├── pvp/                  # PvP arena components
│   │   │   ├── ActiveBattleContainer.tsx # Floating active match widget
│   │   │   └── ...
│   │   │
│   │   ├── reels/                # Reels components
│   │   ├── settings/             # Settings tab components
│   │   │
│   │   └── ui/                   # shadcn/ui base components
│   │       ├── button.tsx
│   │       ├── input.tsx
│   │       ├── badge.tsx
│   │       ├── avatar.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── sheet.tsx
│   │       ├── sonner.tsx        # Toast notifications
│   │       ├── tooltip.tsx
│   │       ├── Logo.tsx
│   │       └── ...
│   │
│   ├── hooks/
│   │   ├── useAuth.tsx           # Auth context + JWT management
│   │   ├── useFeedStore.ts       # Feed state management
│   │   ├── useMessagingStore.ts  # Messaging state
│   │   ├── useSkillIntelligence.ts  # Skill progression queries
│   │   ├── useSocialSocket.ts    # Social WebSocket events
│   │   ├── useSocket.ts          # Base Socket.IO hook
│   │   ├── use-mobile.tsx        # Responsive breakpoint hook
│   │   └── use-toast.ts          # Toast helper
│   │
│   ├── context/
│   │   └── GamificationContext.tsx  # XP/level/achievement events
│   │
│   ├── types/
│   │   ├── messaging.ts          # Message/conversation types
│   │   └── reels.ts              # Reel types
│   │
│   ├── lib/
│   │   ├── utils.ts              # cn() and other utilities
│   │   └── mockData/             # Legacy mock data (not used in production)
│   │
│   ├── styles/
│   │   ├── discover-animations.css
│   │   └── scrollbar-theme.css
│   │
│   ├── integrations/
│   │   └── supabase/             # Legacy Supabase integration (unused)
│   │
│   └── test/
│       ├── example.test.ts
│       └── setup.ts
│
│
├── ── BACKEND ───────────────────────────────────────────────────────
│
├── backend/
│   ├── main.py                   # Core API entry point (FastAPI app + Socket.IO)
│   ├── auth.py                   # JWT auth helpers (root-level, used by core_api)
│   ├── schemas.py                # Pydantic request/response schemas
│   ├── social_utils.py           # user_to_dict, post_to_dict, match_to_dict
│   ├── social_realtime.py        # Social Socket.IO namespace (/social)
│   ├── battle_realtime.py        # Battle Socket.IO namespace (/battle)
│   ├── judging.py                # AIJudge — code evaluation logic
│   ├── requirements.txt          # Python dependencies
│   ├── alembic.ini               # Alembic migration config
│   ├── seed.py                   # Database reset + seed script
│   ├── seed_test_users.py        # Seed 31 official test accounts
│   │
│   ├── common/                   # Shared modules across all services
│   │   ├── __init__.py
│   │   ├── models.py             # ALL SQLAlchemy ORM models
│   │   ├── database.py           # SQLAlchemy engine + session factory
│   │   ├── auth.py               # Password hashing, JWT creation/decode
│   │   ├── celery_config.py      # Celery task queue config
│   │   ├── event_utils.py        # Redis pub/sub event emitters
│   │   ├── rate_limit.py         # Request rate limiting middleware
│   │   ├── redis_utils.py        # Redis cache get/set helpers
│   │   ├── service_discovery.py  # Inter-service HTTP client
│   │   └── social_utils.py       # Shared social utility functions
│   │
│   ├── routers/                  # Core API route handlers
│   │   ├── ai.py                 # /ai/* — AI Coach endpoints
│   │   ├── auth.py               # /auth/* — Auth router alias
│   │   ├── communities.py        # /communities/*
│   │   ├── connections.py        # /connections/*
│   │   ├── dashboard.py          # /dashboard/*
│   │   ├── messages.py           # /messages/*
│   │   ├── notifications.py      # /notifications/*
│   │   ├── posts.py              # /posts/*
│   │   ├── presence.py           # /presence/*
│   │   ├── pvp.py                # /pvp/* — Matchmaking, battles, history
│   │   ├── reels.py              # /reels/*
│   │   ├── search.py             # /search/* — User/skill/post search
│   │   ├── skills.py             # /skills/* — Skill registry, progression
│   │   ├── social.py             # /social/* — Follow, feed, trending
│   │   ├── tournaments.py        # /tournaments/*
│   │   └── users.py              # /users/* — Profile CRUD, achievements
│   │
│   ├── services/                 # Independent microservices
│   │   ├── activity/main.py      # Activity tracking service
│   │   ├── ai_insight/           # AI profile insights
│   │   │   ├── main.py
│   │   │   └── logic.py
│   │   ├── analytics/main.py     # Platform analytics
│   │   ├── auth/main.py          # Auth microservice (proxied via /auth/*)
│   │   ├── battle_engine/main.py # Battle logic service
│   │   ├── battle_pass/main.py   # Season pass service
│   │   ├── blockchain/           # Blockchain/NFT badge service
│   │   │   ├── main.py
│   │   │   └── logic.py
│   │   ├── creator_economy/main.py
│   │   ├── economy/main.py       # XP/coin reward service
│   │   ├── feed/main.py          # Feed aggregation service
│   │   ├── gamification/main.py  # XP, streaks, daily quests
│   │   ├── graph_ai/main.py      # Graph-based AI recommendations
│   │   ├── growth_engine/main.py # Growth analytics
│   │   ├── integration/          # External platform integrations
│   │   │   ├── main.py
│   │   │   └── logic.py
│   │   ├── matchmaking/          # PvP queue management
│   │   │   ├── main.py
│   │   │   ├── tasks.py
│   │   │   └── worker.py
│   │   ├── media/main.py         # File upload/serving
│   │   ├── monetization/         # Creator monetization
│   │   │   ├── main.py
│   │   │   └── logic.py
│   │   ├── notifications/        # Push notifications
│   │   │   ├── main.py
│   │   │   └── tasks.py
│   │   ├── profile/main.py       # Extended profile service
│   │   ├── ranking/main.py       # ELO/MMR ranking service
│   │   ├── realtime/main.py      # WebSocket presence service
│   │   ├── recommendation/main.py
│   │   ├── reputation/           # Reputation scoring
│   │   │   ├── main.py
│   │   │   └── logic.py
│   │   ├── security/             # Trust/toxicity scoring
│   │   │   ├── main.py
│   │   │   └── logic.py
│   │   ├── settings/main.py
│   │   ├── skill_intelligence/main.py  # Skill graph + AI insights
│   │   ├── spectator/main.py     # Live match spectating
│   │   └── verification/         # Skill verification
│   │       ├── main.py
│   │       └── logic.py
│   │
│   ├── alembic/                  # Database migrations
│   │   ├── env.py
│   │   ├── script.py.mako
│   │   └── versions/
│   │       └── 89fecc1dc91c_initial_schema.py
│   │
│   ├── Dockerfile                # Core API Dockerfile
│   ├── Dockerfile.auth           # Auth service Dockerfile
│   ├── Dockerfile.battle_engine
│   ├── Dockerfile.blockchain
│   ├── Dockerfile.celery
│   ├── Dockerfile.economy
│   ├── Dockerfile.integration
│   ├── Dockerfile.matchmaking
│   ├── Dockerfile.media
│   ├── Dockerfile.monetization
│   ├── Dockerfile.notifications
│   ├── Dockerfile.profile
│   ├── Dockerfile.ranking
│   ├── Dockerfile.realtime
│   ├── Dockerfile.reputation
│   ├── Dockerfile.security
│   ├── Dockerfile.settings
│   ├── Dockerfile.spectator
│   └── Dockerfile.verification
│
│
├── ── INFRASTRUCTURE ────────────────────────────────────────────────
│
└── nginx/
    └── nginx.conf                # API gateway config (CORS, routing)
```

---

## Key File Relationships

```
useAuth.tsx
  └── fetches → /auth/me (auth_service)
  └── fetches → /auth/login (auth_service)

AppLayout.tsx
  └── uses → useAuth (loading guard, onboarding redirect)
  └── renders → NotificationDropdown → GET /notifications/

AICoach.tsx (page)
  └── renders → AIHeroSection → GET /ai/skill-analysis
  └── renders → SmartAlerts → GET /ai/alerts
  └── renders → DailyMissions → GET /ai/daily-missions
  └── renders → GoalsTracker → GET /ai/goals-tracker
  └── renders → LearningRoadmap → GET /ai/roadmap
  └── renders → AIRecommendations → GET /ai/recommendations
  └── renders → SkillRadarChart → GET /ai/skill-analysis
  └── renders → PerformanceAnalytics → GET /ai/performance-analytics
  └── renders → IndustryTrends → GET /ai/industry-trends
  └── renders → CareerPathPanel → GET /ai/career-predict
  └── renders → AIChatInterface → POST /ai/chat

Discover.tsx (page)
  └── renders → PeopleDiscovery → GET /search/users
  └── renders → ForYouFeed → GET /social/recommended

Profile.tsx (page)
  └── fetches → GET /users/me (own profile)
  └── fetches → GET /users/{username} (other profiles)
  └── renders → ProfileEditModal → PATCH /users/me

pvp.py (router)
  └── uses → models.PvPMatch (challenge_id FK → pvp_challenges)
  └── uses → models.PvPSubmission (code submissions)
  └── uses → judging.AIJudge (code evaluation)
  └── emits → Redis events → reputation_service, notification_service
```

---

## Naming Conventions

| Layer | Convention | Example |
|-------|-----------|---------|
| React components | PascalCase | `AIHeroSection.tsx` |
| React hooks | camelCase with `use` prefix | `useAuth.tsx` |
| API routes | kebab-case | `/ai-coach`, `/battle-pass` |
| Python files | snake_case | `social_utils.py` |
| DB tables | snake_case | `pvp_match_results` |
| Env variables | UPPER_SNAKE_CASE | `JWT_SECRET` |
| Docker containers | nexora_{service} | `nexora_auth` |
