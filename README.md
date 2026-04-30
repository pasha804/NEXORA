# NEXORA: Premium Skill-Based Social Platform

![NEXORA](https://img.shields.io/badge/Version-2.0.0-blue) ![React](https://img.shields.io/badge/React-19+-61DAFB) ![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688) ![License](https://img.shields.io/badge/License-Proprietary-green)

NEXORA is a state-of-the-art, skill-based social network designed for the future of professional networking and talent development. Combining the professional utility of LinkedIn with the real-time engagement of Discord and the gamified mechanics of modern competitive gaming.

---

## Vision

To build a high-performance ecosystem where skills are verified through action, growth is visualized through gamification, and connections are forged through shared technical expertise.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface                        │
│              (React 19 + Vite + Tailwind)                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Nginx Gateway                        │
│                   (Port :80)                         │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   FastAPI Backend                    │
│              (Python 3.11+ + SQLAlchemy)                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL + Redis                         │
│              (Database + Cache)                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, TailwindCSS, Framer Motion, Lucide Icons, TanStack Query |
| **Backend** | FastAPI, Python 3.11+, SQLAlchemy, Pydantic, Uvicorn, Socket.IO |
| **Database** | PostgreSQL 15, Redis 7 |
| **Infrastructure** | Docker, Nginx |

---

## Features

### Core Features

- **AI-Powered Discovery** - Smart matching based on complementary skill sets and growth goals
- **PvP Battle Arena** - Real-time technical challenges to earn XP and increase your Global Rank
- **AI Coach** - Personalized learning roadmaps and career predictions
- **Professional Portfolio** - LinkedIn-style profile with experience, projects, and skills
- **Real-time Messaging** - Socket.IO powered instant messaging
- **Communities & Reels** - Social features for content sharing

### Gamification

- XP Points & Level System
- Skill Progression Tracking
- Achievements & Badges
- Battle Pass System
- Global Leaderboards

---

## Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL 15+
- Redis 7+ (optional for caching)
- Docker & Docker Compose (recommended)

---

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/NEXORA.git
cd NEXORA
```

### 2. Install Dependencies

```bash
# Frontend
npm install

# Backend (recommended: use virtual environment)
python -m venv venv
source venv/bin/activate  # Linux/Mac
# or
venv\Scripts\activate  # Windows
pip install -r requirements.txt
```

### 3. Configure Environment

Create `.env` file in the root directory:

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/nexora

# Redis (optional)
REDIS_URL=redis://localhost:6379

# JWT Secret
JWT_SECRET=your-secret-key-change-in-production

# API URL
VITE_API_URL=http://localhost:80
```

### 4. Start Backend

```bash
# Direct
cd backend
uvicorn main:app --host 0.0.0.0 --port 80 --reload

# Docker
docker-compose up -d backend
```

### 5. Start Frontend

```bash
npm run dev
```

### 6. Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:80
- **API Docs**: http://localhost:80/docs

---

## Project Structure

```
NEXORA/
├── src/                      # React Frontend
│   ├── components/          # Reusable UI components
│   │   ├── discover/       # Discover page components
│   │   ├── layout/        # Layout components
│   │   ├── profile/       # Profile components
│   │   ├── pvp/          # PvP Battle components
│   │   └── ui/           # Base UI components
│   ├── context/           # React Context providers
│   ├── hooks/            # Custom React hooks
│   ├── integrations/      # External integrations
│   ├── pages/            # Page components
│   ├── styles/           # Global styles
│   └── types/            # TypeScript types
│
├── backend/               # FastAPI Backend
│   ├── common/           # Shared utilities
│   ├── routers/          # API route handlers
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic services
│   └── main.py          # Application entry point
│
├── public/               # Static assets
├── package.json          # Frontend dependencies
└── vite.config.ts        # Vite configuration
```

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|---------|-----------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/me` | Get current user |

### Users & Profile

| Method | Endpoint | Description |
|--------|---------|-----------|
| GET | `/users/me` | Get current user profile |
| GET | `/users/{username}` | Get user profile |
| PUT | `/users/me` | Update profile |
| GET | `/users/{id}/skills` | Get user skills |

### Discovery

| Method | Endpoint | Description |
|--------|---------|-----------|
| GET | `/search/users` | Search users |
| GET | `/search/skills` | Search skills |
| GET | `/search/` | Unified search |

### PvP

| Method | Endpoint | Description |
|--------|---------|-----------|
| POST | `/pvp/queue/join` | Join matchmaking |
| POST | `/pvp/queue/leave` | Leave matchmaking |
| GET | `/pvp/battles` | Get active battles |

### AI Coach

| Method | Endpoint | Description |
|--------|---------|-----------|
| GET | `/ai/skill-analysis` | Get skill analysis |
| GET | `/ai/roadmap` | Get learning roadmap |
| GET | `/ai/recommendations` | Get AI recommendations |

### Messaging

| Method | Endpoint | Description |
|--------|---------|-----------|
| GET | `/messages` | Get conversations |
| GET | `/messages/{userId}` | Get messages |
| POST | `/messages` | Send message |

---

## Development

### Running Tests

```bash
# Frontend tests
npm run test

# Backend tests
cd backend && pytest
```

### Building for Production

```bash
# Frontend build
npm run build

# Backend build (Docker)
docker-compose build
```

### Running in Production

```bash
# Using Docker Compose
docker-compose up -d
```

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## License

Copyright © 2026 NEXORA Platform. All rights reserved.

---

## Support

- **Documentation**: See the `/docs` endpoint for API docs
- **Issues**: Report issues on GitHub
- **Discord**: Join our community for real-time support