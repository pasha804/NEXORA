from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import socketio
from common.database import engine
from common import models
from routers import reels, communities, auth as auth_router, users, dashboard, pvp, ai as ai_router, tournaments, connections, posts, social, search, messages, notifications, skills, presence
import social_realtime
from battle_realtime import sio

# Create Tables (including new PvP tables)
models.Base.metadata.create_all(bind=engine)

# Run database migrations for missing columns
try:
    from sqlalchemy import text
    with engine.connect() as conn:
        # Add display_name to profiles if missing (PostgreSQL)
        try:
            conn.execute(text("""
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                  WHERE table_name = 'profiles' AND column_name = 'display_name') THEN
                        ALTER TABLE profiles ADD COLUMN display_name VARCHAR;
                    END IF;
                END $$;
            """))
            conn.commit()
            print("Migration: Added display_name column to profiles")
        except Exception as e:
            print(f"Profile migration: {e}")
        
        # Add rank_level to user_social_stats if missing (PostgreSQL)
        try:
            conn.execute(text("""
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                  WHERE table_name = 'user_social_stats' AND column_name = 'rank_level') THEN
                        ALTER TABLE user_social_stats ADD COLUMN rank_level VARCHAR DEFAULT 'Beginner';
                    END IF;
                END $$;
            """))
            conn.commit()
        except Exception as e:
            print(f"Stats migration: {e}")
            
        # Add skill_id to user_skills if missing (for normalized skills)
        try:
            conn.execute(text("""
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                  WHERE table_name = 'user_skills' AND column_name = 'skill_id') THEN
                        ALTER TABLE user_skills ADD COLUMN skill_id INTEGER;
                    END IF;
                END $$;
            """))
            conn.commit()
        except Exception as e:
            print(f"UserSkills migration: {e}")
            
        # Add is_primary, skill_integrity_score, verified to user_skills if missing
        try:
            conn.execute(text("""
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                  WHERE table_name = 'user_skills' AND column_name = 'is_primary') THEN
                        ALTER TABLE user_skills ADD COLUMN is_primary BOOLEAN DEFAULT FALSE;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                  WHERE table_name = 'user_skills' AND column_name = 'skill_integrity_score') THEN
                        ALTER TABLE user_skills ADD COLUMN skill_integrity_score FLOAT DEFAULT 1.0;
                    END IF;
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                  WHERE table_name = 'user_skills' AND column_name = 'verified') THEN
                        ALTER TABLE user_skills ADD COLUMN verified BOOLEAN DEFAULT FALSE;
                    END IF;
                END $$;
            """))
            conn.commit()
        except Exception as e:
            print(f"UserSkills extra columns migration: {e}")
            
        # Convert avatar_url and banner_url from VARCHAR to TEXT for base64 images
        try:
            conn.execute(text("""
                ALTER TABLE users ALTER COLUMN avatar_url TYPE TEXT;
            """))
            conn.commit()
        except Exception as e:
            print(f"Users avatar_url migration: {e}")
            
        try:
            conn.execute(text("""
                ALTER TABLE users ALTER COLUMN banner_url TYPE TEXT;
            """))
            conn.commit()
        except Exception as e:
            print(f"Users banner_url migration: {e}")
            
        try:
            conn.execute(text("""
                ALTER TABLE profiles ALTER COLUMN avatar_url TYPE TEXT;
            """))
            conn.commit()
        except Exception as e:
            print(f"Profiles avatar_url migration: {e}")
        
        try:
            conn.execute(text("""
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                  WHERE table_name = 'profiles' AND column_name = 'banner_url') THEN
                        ALTER TABLE profiles ADD COLUMN banner_url TEXT;
                    END IF;
                END $$;
            """))
            conn.commit()
            print("Migration: Added banner_url column to profiles")
        except Exception as e:
            print(f"Profiles banner_url migration: {e}")
        
        # Create notifications table if not exists
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS notifications (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id),
                    type VARCHAR NOT NULL,
                    title VARCHAR NOT NULL,
                    message TEXT NOT NULL,
                    related_id VARCHAR,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """))
            conn.commit()
            print("Migration: Created notifications table")
        except Exception as e:
            print(f"Notifications table migration: {e}")
        
        # Create chat_rooms table if not exists
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS chat_rooms (
                    id SERIAL PRIMARY KEY,
                    user1_id INTEGER NOT NULL REFERENCES users(id),
                    user2_id INTEGER NOT NULL REFERENCES users(id),
                    last_message_at TIMESTAMP WITH TIME ZONE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """))
            conn.commit()
            print("Migration: Created chat_rooms table")
        except Exception as e:
            print(f"Chat rooms table migration: {e}")
        
        # Create messages table if not exists
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS messages (
                    id SERIAL PRIMARY KEY,
                    room_id INTEGER NOT NULL REFERENCES chat_rooms(id),
                    sender_id INTEGER NOT NULL REFERENCES users(id),
                    receiver_id INTEGER NOT NULL REFERENCES users(id),
                    message_text TEXT NOT NULL,
                    message_type VARCHAR DEFAULT 'text',
                    media_url VARCHAR,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """))
            conn.commit()
            print("Migration: Created messages table")
        except Exception as e:
            print(f"Messages table migration: {e}")
        
        # Create user_presence table if not exists
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS user_presence (
                    user_id INTEGER PRIMARY KEY REFERENCES users(id),
                    is_online BOOLEAN DEFAULT FALSE,
                    last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """))
            conn.commit()
            print("Migration: Created user_presence table")
        except Exception as e:
            print(f"User presence table migration: {e}")
        
        # Create connection_requests table if not exists
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS connection_requests (
                    id SERIAL PRIMARY KEY,
                    sender_id INTEGER NOT NULL REFERENCES users(id),
                    receiver_id INTEGER NOT NULL REFERENCES users(id),
                    status VARCHAR DEFAULT 'pending',
                    message TEXT,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                    updated_at TIMESTAMP WITH TIME ZONE
                );
            """))
            conn.commit()
            print("Migration: Created connection_requests table")
        except Exception as e:
            print(f"Connection requests table migration: {e}")
        
        # Create user_connections table if not exists
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS user_connections (
                    id SERIAL PRIMARY KEY,
                    user1_id INTEGER NOT NULL REFERENCES users(id),
                    user2_id INTEGER NOT NULL REFERENCES users(id),
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """))
            conn.commit()
            print("Migration: Created user_connections table")
        except Exception as e:
            print(f"User connections table migration: {e}")
        
        # Create post_media table if not exists
        try:
            conn.execute(text("""
                CREATE TABLE IF NOT EXISTS post_media (
                    id SERIAL PRIMARY KEY,
                    post_id INTEGER NOT NULL REFERENCES posts(id),
                    media_url VARCHAR NOT NULL,
                    media_type VARCHAR DEFAULT 'image',
                    thumbnail_url VARCHAR,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                );
            """))
            conn.commit()
            print("Migration: Created post_media table")
        except Exception as e:
            print(f"Post media table migration: {e}")
        
        # Add online_status to users if missing
        try:
            conn.execute(text("""
                DO $$
                BEGIN
                    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                                  WHERE table_name = 'users' AND column_name = 'online_status') THEN
                        ALTER TABLE users ADD COLUMN online_status VARCHAR DEFAULT 'offline';
                    END IF;
                END $$;
            """))
            conn.commit()
            print("Migration: Added online_status column to users")
        except Exception as e:
            print(f"Users online_status migration: {e}")
except Exception as e:
    print(f"Migration warning: {e}")

# ─────────────────────────────────────────────────────────
# FastAPI Application
# ─────────────────────────────────────────────────────────
_fastapi_app = FastAPI(
    title="Nexora API",
    description="Backend API for Nexora Skill Forge Platform",
    version="2.0.0"
)

# CORS Middleware
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://localhost:80",
    "*"
]

_fastapi_app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
_fastapi_app.include_router(auth_router.router)
_fastapi_app.include_router(users.router)
_fastapi_app.include_router(dashboard.router)
_fastapi_app.include_router(skills.router)
_fastapi_app.include_router(pvp.router)
_fastapi_app.include_router(tournaments.router)
_fastapi_app.include_router(connections.router)
_fastapi_app.include_router(posts.router)
_fastapi_app.include_router(social.router)
_fastapi_app.include_router(search.router)
_fastapi_app.include_router(messages.router)
_fastapi_app.include_router(notifications.router)
_fastapi_app.include_router(presence.router)
_fastapi_app.include_router(ai_router.router)
_fastapi_app.include_router(reels.router)
_fastapi_app.include_router(communities.router)

@_fastapi_app.get("/")
async def root():
    return {"message": "Welcome to Nexora API", "status": "active", "version": "2.0.0"}

@_fastapi_app.get("/health")
async def health_check():
    return {"status": "healthy"}

# ─────────────────────────────────────────────────────────
# Mount Socket.IO under /battle/socket.io
# Nginx routes /battle/* → core_api (this service)
# BattleRoom.tsx connects to: io("http://localhost:80", { path: "/battle/socket.io" })
# ─────────────────────────────────────────────────────────
# Socket.IO ASGI App
# Both Battle and Social use the same sio instance but different namespaces
# We keep /battle/socket.io as the entry point for consistency with existing routing
sio_asgi_app = socketio.ASGIApp(sio, _fastapi_app, socketio_path="/battle/socket.io")
app = sio_asgi_app
# The ASGI entrypoint is the socket.io wrapped app
app = sio_asgi_app
