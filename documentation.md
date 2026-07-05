# NEXORA Platform — Full Documentation

> Version: 5.1 (Production Ready — July 2026)
> Platform: Skill-Based Social Network with Gamification
> Stack: React 18 + TypeScript + Vite (Frontend), FastAPI + Python (Backend), PostgreSQL, Redis, Docker, Nginx, Socket.IO

---

## 1. Project Map

```
NEXORA/
├── backend/                 # FastAPI Python backend
│   ├── common/              # DB models, auth, config
│   ├── routers/             # API route handlers
│   └── seed_test_users.py   # Seed script (16 users, 5 rank tiers)
├── src/                     # React + TypeScript frontend
│   ├── components/
│   │   ├── profile/         # Profile system (28 components)
│   │   ├── discover/        # Discovery hub
│   │   ├── home/            # Dashboard sidebar components
│   │   ├── ai-coach/        # AI coaching interface
│   │   ├── pvp/             # Battle arena components
│   │   ├── communities/     # Community system
│   │   ├── messaging/       # Chat system
│   │   ├── reels/           # Short-form video
│   │   ├── settings/        # User settings
│   │   ├── landing/         # Marketing/index page
│   │   ├── layout/          # App layout, sidebar, navbar
│   │   └── ui/              # shadcn/ui primitives
│   ├── pages/               # Route pages (14 pages)
│   ├── lib/
│   │   ├── rankSystem.ts    # Rank definitions, progression math
│   │   ├── profileDistinctiveness.ts  # Visual variance engine
│   │   ├── utils.ts         # General utilities
│   │   └── mockData/        # Test/mock data
│   ├── styles/
│   │   ├── discover-animations.css  # Rank evolution animations
│   │   └── scrollbar-theme.css
│   ├── hooks/               # React hooks (useAuth, etc.)
│   ├── context/             # React contexts (Auth, Gamification)
│   ├── types/               # TypeScript types
│   └── test/                # Tests
├── graphify-out/            # Codebase graph analysis output
├── dist/                    # Production build output
├── nginx/                   # Nginx config
├── docker-compose.yml
├── Dockerfile.frontend
└── vite.config.ts
```

---

## 2. Core Architecture

### Frontend Stack
- **React 18** with functional components + hooks
- **TypeScript 5.8** strict mode
- **Vite 5** build tool with SWC
- **React Router 6** with lazy routes + Suspense
- **Framer Motion** for animations
- **TanStack React Query** for server state
- **Zustand** for client state (messaging)
- **shadcn/ui** component primitives (Radix-based)
- **Tailwind CSS 3** with custom config
- **Zod** form validation
- **Recharts** for charts
- **Socket.IO client** for real-time

### Backend Stack
- **FastAPI** Python framework
- **SQLAlchemy** ORM
- **PostgreSQL** + **Redis**
- **JWT** authentication (bcrypt hashing)
- **Pydantic** schemas
- **Docker** containerized services

---

## 3. Pages & Routes

| Route | Page Component | Access | Description |
|-------|---------------|--------|-------------|
| `/` | Index.tsx | Public | Landing/marketing page with hero, features, PvP preview, leaderboard |
| `/auth` | Auth.tsx | Public | Login/signup with JWT |
| `/onboarding` | Onboarding.tsx | Auth | Multi-step profile setup (skills, interests, profile, goals) |
| `/dashboard` | Dashboard.tsx | Auth | Home feed, trending creators, recommendations sidebar |
| `/discover` | Discover.tsx | Auth | For You / People / Skills / Communities / Projects / Opportunities / Events / Trending |
| `/pvp` | PvP.tsx | Auth | Battle arena, tournaments, match history |
| `/communities` | Communities.tsx | Auth | Community hub with channels, learning, events, projects |
| `/reels` | Reels.tsx | Auth | Short-form vertical video feed |
| `/ai-coach` | AICoach.tsx | Auth | AI chat, goals, analytics, career paths, daily missions |
| `/battle-pass` | BattlePass.tsx | Auth | Season progress, tier rewards, challenges |
| `/settings` | Settings.tsx | Auth | Profile, security, privacy, notifications, data, +more tabs |
| `/profile/:username` | Profile.tsx | Auth | User profile with rank-evolved header, portfolio, activity |
| `/messages` | Messages.tsx | Auth | 3-panel messaging with conversations, chat, info panel |
| `*` | NotFound.tsx | Public | 404 page |

---

## 4. Rank System (9 Tiers)

### Rank Tiers & Divisions

| Tier | RP Range | Divisions | Colors | CSS Class Prefix |
|------|----------|-----------|--------|-----------------|
| Novice | 0–699 | 1 | Gray | `novice` |
| Bronze | 700–899 | 3 | Orange | `bronze` |
| Silver | 900–1099 | 2 | Silver/gray | `silver` |
| Gold | 1100–1299 | 3 | Gold/yellow | `gold` |
| Platinum | 1300–1599 | 5 | Cyan | `platinum` |
| Diamond | 1600–2199 | 5 | RGB sparkle | `diamond` |
| Heroic | 2200–3199 | 5 | Red-purple | `heroic` |
| Master | 3200–4199 | 5 | Red pulse | `master` |
| Grandmaster | 4200+ | 1 (unique) | RGB cosmic | `grandmaster` |

### Progression Formula
- **XP per level**: `1000 × (1 + level × 0.15)`
- **Level formula**: `floor(0.15 × sqrt(xp / 10))`
- **RP from XP**: `xp / 10` (capped at tier thresholds)

### Rank Visual Evolution (from low to high)

| Aspect | Low (Novice–Bronze) | Mid (Silver–Gold) | High (Platinum–Heroic) | Top (Master–Grandmaster) |
|--------|-------------------|-------------------|----------------------|------------------------|
| **Avatar Ring** | Simple border | Pulsing glow | Animated gradient | RGB cycling |
| **Card** | Flat dark | Gradient | Glassmorphism + shimmer | Legendary frame + fire trail |
| **XP Bar** | Static gray | Colored gradient | Animated gradient | Shimmer + RGB cycle |
| **Background** | None | Subtle glow | Radial gradient | Cosmic + energy waves |
| **Badge** | Static | Colored | Animated stars | RGB + hover scale |
| **Particles** | None | Few | Moderate | Full floating particles |

---

## 5. Profile Evolution System (Components)

### Core Components

#### `RankAura.tsx`
- **RankAura** — Animated glow ring behind avatars; opacity/intensity scales with rank tier
- **RankParticles** — Floating particles with tier-specific colors; count scales with rank
- Imports: framer-motion

#### `RankBadgeAnimated.tsx`
- Enhanced badge with rank-colored stars (1–5 per division)
- RGB color cycling for Grandmaster
- Hover scale animation
- Props: `rank`, `size`, `showStars`, `className`

#### `PrestigeOverlay.tsx`
- 5 prestige levels (I–V) with escalating visuals
- Prestige I–II: border glow
- Prestige III–IV: animated border + aura
- Prestige V: full RGB cinematic overlay with "LEGENDARY" badge
- Props: `prestigeLevel`, `rank`, `children`

#### `GrandmasterEffects.tsx`
- **GrandmasterEffects** — Cosmic background, energy waves, floating particles
- **GrandmasterCrown** — RGB animated crown icon
- **GrandmasterTitle** — Animated "THE GRANDMASTER" title with RGB text-shadow
- Props: `rank`, `type` ("banner" | "full"), `children`

#### `DynamicProfileTheme.tsx`
- Wraps children with rank-based theme styles
- **RankAvatarRing** — Avatar ring with tier-specific glow/animation
- Background gradient, border glow, text color based on rank
- Props: `rank`, `className`, `children`

#### `UserCard.tsx`
- Reusable user card with rank aura, particles, avatar ring
- **UserPreviewCard** — Hover preview with full rank info, skills, stats
- Hover appears after 400ms delay
- Props: `user`, `rank`, `size` ("sm" | "md" | "lg")

#### `RecommendationCards.tsx`
- Multi-section recommendation engine
- Sections: Trending Developers, Top Ranked, Rising Stars, AI Experts, Legendary Creators
- **TrendingCreators** — Horizontal scroll strip with rank-based cards
- Uses mock data with rank-varied visual styling

### Supporting Files

#### `src/lib/profileDistinctiveness.ts`
- Generates unique visual parameters from: XP, reputation, followers, achievements, prestige
- Returns: hue offsets, animation durations, grain opacity, glow intensity, border style
- Ensures no two high-rank profiles look identical

#### `src/styles/discover-animations.css`
- 25+ CSS keyframes: `aura-pulse`, `particle-float`, `shimmer-border`, `rgb-cycle`, `crown-float`, `energy-wave`, `holographic-overlay`, `lightning-flash`, `fire-trail`, `diamond-sparkle`, `prestige-aura`, `fame-shine`, `text-gradient-anim`, `legendary-frame`
- Utility classes per rank tier: backgrounds, border glows, avatar rings, XP bars

### Modified Components

#### `HeroProfileHeader.tsx`
- Wraps in `DynamicProfileTheme`
- Shows `RankAura` + `RankParticles` for Mid+
- `RankAvatarRing` — tier-specific ring
- `GrandmasterCrown` + `GrandmasterTitle` for Grandmaster
- Fire trail borders for Grandmaster (`fire-trail-top`/`fire-trail-bottom`)
- Rank-colored animated XP bar (progressive formula)
- `PrestigeOverlay` when applicable
- Energy pulse on rank-up icon

#### `Profile.tsx`
- Dynamic ambient background based on rank tier
- Grandmaster full-screen cosmic particle effects

#### `Dashboard.tsx`
- Rank-based ambient background
- Grandmaster effects for top-tier users
- Welcome text with rank-colored glow
- `TrendingCreators` horizontal strip
- `RecommendationCards` in sidebar

#### `Discover.tsx`
- `RecommendationCards` section on the People tab
- Rank-based search suggestion icons in header

#### `PeopleDiscovery.tsx`
- Enhanced person cards with rank-based aura
- Rank-colored avatar ring (`RankAvatarRing`)
- Glowing borders for high-rank users
- Crown icon overlay for Grandmaster
- Rank level display (e.g., "Gold III")
- Hover preview via `UserPreviewCard`

#### `DiscoverHeader.tsx`
- Rank-based search suggestions with colored rank icons

#### `HomeLeftSidebar.tsx`
- Rank aura + particles around avatar
- `RankAvatarRing` with tier styling
- `RankBadgeAnimated` with hover scale
- Animated XP bar with rank-based colors
- Crown indicator for Grandmaster

#### `HomeRightSidebar.tsx`
- Enhanced Talent Hub with rank badges per user
- Rank-based glow borders for high-rank recommendations
- "Follow" + "Connect" actions on user cards

### Test User Data (`backend/seed_test_users.py`)

**16 users across 5 rank tiers:**

| Tier | Users | Visual Level |
|------|-------|-------------|
| **Grandmaster** | basha_dev | Full cinematic + RGB + fire trail |
| **Master/Heroic** | ai_researcher, backend_wizard, cloud_architect, security_expert | Cosmic background, energy waves, legendary frame |
| **Diamond/Platinum** | react_dev, devops_engineer, data_engineer, rustacean | Glassmorphism, animated gradient cards, diamond sparkle |
| **Gold/Silver** | python_dev, fullstack_dev, qa_automation, product_manager | Shimmer borders, gradient backgrounds |
| **Bronze/Novice** | ui_designer, tech_writer, agile_coach | Flat dark, simple glow, minimal |

Each user has: username, email, skills array, XP, rank string, reputation, followers count.

---

## 6. API Endpoints

### Authentication
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/auth/signup` | Register |
| POST | `/auth/login` | Login (JSON) |
| POST | `/auth/token` | Login (OAuth2 form) |
| GET | `/auth/me` | Current user |
| POST | `/auth/onboarding/skills` | Save skills |
| POST | `/auth/onboarding/interests` | Save interests |
| POST | `/auth/onboarding/profile` | Complete onboarding |

### Users
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET/PATCH | `/users/me` | Get/update current user |
| GET | `/users/{username}` | Get user by username |
| GET | `/users/{id}/stats` | User stats |
| GET | `/users/{id}/achievements` | Achievements |
| GET | `/users/{id}/reputation` | Reputation score |
| GET | `/users/me/completeness` | Profile completeness |
| POST | `/users/profile/upload-resume` | Resume upload |
| GET | `/users/analytics/platform` | Platform analytics |

### Social
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/social/follow/{id}` | Follow user |
| POST | `/social/unfollow/{id}` | Unfollow |
| GET | `/social/followers/{id}` | Get followers |
| GET | `/social/following/{id}` | Get following |
| GET | `/social/recommendations` | Follow recommendations |
| GET | `/social/recommended` | AI recommendations |
| GET | `/social/trending-skills` | Trending skills |
| GET | `/social/home-feed` | Home feed data |
| DELETE | `/social/followers/{id}` | Remove follower |

### Search
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/search/users` | User search (q, skill, category, sort, page) |
| GET | `/search/skills` | Skill search |

### Posts
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/posts/create` | Create post |
| GET | `/posts/feed` | Get feed |
| POST | `/posts/{id}/like` | Like post |
| POST | `/posts/{id}/comment` | Comment |

### Messaging
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/messages/conversations` | List conversations |
| GET | `/messages/{user_id}` | Get messages |
| POST | `/messages/send` | Send message |
| GET | `/messages/status/{id}` | Messaging permission |
| POST | `/messages/room/get_or_create` | Create/get chat room |

### PvP
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/pvp/queue/join` | Join matchmaking |
| POST | `/pvp/queue/leave` | Leave queue |
| GET | `/pvp/matches` | Recent matches |
| GET | `/pvp/leaderboard` | Rankings |

### AI Coach
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/ai/skill-analysis` | Skill analysis |
| GET | `/ai/learning-roadmap` | Learning roadmap |
| GET | `/ai/career-predict` | Career predictions |
| GET | `/ai/recommendations` | Recommendations |
| GET | `/ai/daily-missions` | Daily missions |
| GET | `/ai/alerts` | Smart alerts |
| GET | `/ai/goals-tracker` | Goals tracking |
| GET | `/ai/performance-analytics` | Performance analytics |
| GET | `/ai/industry-trends` | Industry trends |
| POST | `/ai/chat` | AI chat |
| POST | `/ai/goals` | Create goal |

### Skills
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/skills` | List all skills |
| GET | `/skills/categories` | List categories |
| POST | `/skills/endorse` | Endorse skill |
| GET | `/skills/endorsements/{id}` | Get endorsements |
| GET | `/skills/{id}` | Skill details |

### Communities
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/communities/me` | My communities |
| GET | `/communities/discover` | Discover communities |
| POST | `/communities/create` | Create community |
| POST | `/communities/{id}/join` | Join community |

### Notifications
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/notifications/` | Get notifications |
| POST | `/notifications/{id}/read` | Mark read |
| POST | `/notifications/read-all` | Mark all read |

### Other
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/battlepass/current_season` | Battle pass |
| GET | `/battlepass/tiers` | Tier data |
| POST | `/battlepass/unlock_tier` | Unlock tier |
| GET | `/reels/feed` | Reels feed |
| POST | `/reels/{id}/like` | Like reel |
| GET | `/presence/online` | Set online |
| GET | `/presence/offline` | Set offline |
| GET | `/dashboard/data` | Dashboard data |

---

## 7. Graphify-Out Directory

**Location:** `/graphify-out/`
**Purpose:** Output of an automated codebase graph analysis tool (semantic dependency/reference graph)

**Contents:**
- `GRAPH_REPORT.md` — Full analysis: 1309 nodes, 2730 edges, 259 communities detected
- `graph.html` — Interactive HTML visualization of the codebase graph
- `graph.json` — Raw graph data (JSON)
- `cache/` — 355 JSON files containing individual analysis results

**Key Findings from Report:**
- **God Nodes** (most connected): `User` (149 edges), `UserSkill` (101), `Skill` (94), `UserSocialStats` (83), `Follower` (71)
- **Community 0** (largest): 134 nodes — goals, analytics, achievements, AI coach
- **Extraction**: 49% extracted, 51% inferred, 0% ambiguous
- **109 isolated nodes** — potential undocumented components or missing edges

---

## 8. Docker Setup

```yaml
Services:
  - postgres:5432      # PostgreSQL database
  - redis:6379         # Redis cache
  - nginx:80           # API Gateway + CORS
  - frontend:5173      # Vite dev server (HMR)
  - core_api:8000      # FastAPI backend
```

### Environment Variables
- `DATABASE_URL` — PostgreSQL connection string
- `JWT_SECRET` — JWT signing secret
- `REDIS_URL` — Redis connection string
- `VITE_API_URL` — Backend API URL (http://nexora_gateway:80 in Docker)

### Build & Run
```bash
# Frontend
npm install && npm run build

# Backend
pip install -r requirements.txt

# Full stack
docker-compose up -d

# Seed test users
docker compose exec core_api python seed_test_users.py
```

---

## 9. Authentication Flow

1. User logs in → `POST /auth/login` → receives `access_token` (JWT)
2. Token stored in `localStorage` as `access_token`
3. `AuthProvider` checks token on mount → `GET /auth/me`
4. Token restored from localStorage on page refresh (hydration)
5. Auth state blocks rendering until hydration completes
6. Invalid/expired token → automatic redirect to `/auth`
7. Sign out clears token from localStorage

### Auth-related Components
- `Auth.tsx` — Login/signup page
- `useAuth.tsx` — Auth context provider + hook
- `App.tsx` — Route guards, hydration logic, error boundaries

---

## 10. Known Issues

| Issue | Status | Notes |
|-------|--------|-------|
| React Router v6 future flag warnings | Non-breaking | Add `v7_startTransition`, `v7_relativeSplatPath` to BrowserRouter |
| Economy service references `user.xp`/`user.coins` | Standalone service | Not in core_api, won't crash main app |
| Battle Pass requires DB rows | Graceful fallback | Falls back to static tier data |
| OAuth buttons (Google, GitHub) | UI-only | Not wired to backend |
| Reels video upload | URL storage only | Requires CDN/S3 for production |
| Voice/video channels | UI placeholders | WebRTC not implemented |
| AI chat | Rule-based | No LLM integration yet |
| `/auth/me` 401 on expired token | Expected | Backend auth, auto-redirects to login |
| `/communities/{slug}/feed` 404 | Backend missing | Community feed endpoint not yet implemented |
| CORS battle socket.io | Backend config | Duplicate `Access-Control-Allow-Origin` header in Nginx |

---

## 11. Build & Test Commands

```bash
npm run dev          # Start dev server (port 5173)
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint check
npm run test         # Vitest tests
npx tsc --noEmit    # TypeScript type check
```

---

## 12. File Index (Key Files)

### Profile Evolution System
| File | Lines | Purpose |
|------|-------|---------|
| `src/components/profile/RankAura.tsx` | ~100 | Animated aura + particles |
| `src/components/profile/RankBadgeAnimated.tsx` | ~120 | Enhanced rank badge |
| `src/components/profile/PrestigeOverlay.tsx` | ~80 | Prestige I–V overlays |
| `src/components/profile/GrandmasterEffects.tsx` | ~200 | Cinematic Grandmaster effects |
| `src/components/profile/DynamicProfileTheme.tsx` | ~150 | Rank-based theming + avatar ring |
| `src/components/profile/UserCard.tsx` | ~180 | User card + hover preview |
| `src/components/profile/RecommendationCards.tsx` | ~250 | Recommendation engine |
| `src/lib/profileDistinctiveness.ts` | ~80 | Profile variance utility |
| `src/styles/discover-animations.css` | ~180 | All rank animations CSS |

### Core System
| File | Lines | Purpose |
|------|-------|---------|
| `src/lib/rankSystem.ts` | 261 | Rank definitions, progression math |
| `src/App.tsx` | ~280 | Root app, routing, error boundaries |
| `src/hooks/useAuth.tsx` | ~180 | Auth context + token management |

### Pages
| File | Lines | Purpose |
|------|-------|---------|
| `src/pages/Dashboard.tsx` | ~150 | Home page |
| `src/pages/Discover.tsx` | ~100 | Discovery hub |
| `src/pages/Profile.tsx` | ~200 | User profile |
| `src/pages/AICoach.tsx` | ~180 | AI coaching |
| `src/pages/PvP.tsx` | ~150 | Battle arena |

### Backend
| File | Lines | Purpose |
|------|-------|---------|
| `backend/seed_test_users.py` | 127 | 16 test users seeder |
| `backend/common/models.py` | ~500 | SQLAlchemy models |
| `backend/common/auth.py` | ~100 | JWT auth logic |

### Config
| File | Purpose |
|------|---------|
| `vite.config.ts` | Vite config with proxy |
| `tailwind.config.ts` | Tailwind theme |
| `tsconfig.json` | TypeScript config |
| `docker-compose.yml` | Docker services |
| `nginx/nginx.conf` | API gateway config |

---

## 13. CSS Animation Reference

All rank evolution animations are in `src/styles/discover-animations.css`:

| Animation Class | Purpose |
|----------------|---------|
| `aura-pulse` | Aura glow oscillation |
| `particle-float` | Particle floating motion |
| `shimmer-border` | Animated gradient border |
| `rgb-cycle` | Rainbow color cycling |
| `rgb-glow` | Rainbow glowing shadow |
| `rgb-border` | Rainbow animated border |
| `crown-float` | Crown bob animation |
| `energy-wave` | Expanding energy ring |
| `holographic-overlay` | Shimmering holographic effect |
| `lightning-flash` | Random lightning bursts |
| `fire-trail` | Animated fire border path |
| `diamond-sparkle` | Diamond star sparkle |
| `prestige-aura` | Prestige level aura |
| `fame-shine` | Fame indicator shine |
| `text-gradient-anim` | Animated text gradient |
| `legendary-frame` | Legendary card frame |
| `xp-bar-grandmaster` | RGB cycling XP bar |
| `xp-bar-master` | Shimmer XP bar |
| `card-hover-glow` | Card hover glow effect |

Rank utility classes: `.rank-bg-{tier}`, `.rank-border-{tier}`, `.rank-glow-{tier}`, `.avatar-ring-{tier}`, `.xp-bar-{tier}`, `.rank-glow-text-{tier}`

---

## 14. Seed Data — User Distribution

| Username | Tier | RP Range | XP | Followers |
|----------|------|----------|----|-----------|
| basha_dev | Grandmaster | 4200+ | 99999 | 250000 |
| ai_researcher | Master I | 3200–4199 | 45000 | 15000 |
| backend_wizard | Master V | 3200–4199 | 35000 | 12000 |
| cloud_architect | Heroic I | 2200–3199 | 29000 | 9000 |
| security_expert | Heroic II | 2200–3199 | 28500 | 8500 |
| react_dev | Diamond III | 1600–2199 | 22000 | 5000 |
| devops_engineer | Diamond V | 1600–2199 | 21500 | 4500 |
| data_engineer | Platinum I | 1300–1599 | 15000 | 3800 |
| rustacean | Platinum II | 1300–1599 | 14800 | 3500 |
| python_dev | Gold II | 1100–1299 | 9500 | 1500 |
| fullstack_dev | Gold III | 1100–1299 | 9200 | 1200 |
| qa_automation | Silver I | 900–1099 | 5800 | 800 |
| product_manager | Silver II | 900–1099 | 5600 | 750 |
| ui_designer | Bronze I | 700–899 | 2800 | 300 |
| tech_writer | Bronze II | 700–899 | 2600 | 250 |
| agile_coach | Novice | 0–699 | 800 | 100 |

---

*End of documentation*
