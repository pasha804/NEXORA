from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

_db_url = os.getenv("DATABASE_URL", "")

# Shared fallback logic: use PostgreSQL if URL is provided, otherwise SQLite
if not _db_url:
    # Use absolute path or consistent relative path to avoid different DB files per service
    # Points to backend/nexora_dev.db relative to the project root
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    _db_url = f"sqlite:///{os.path.join(base_dir, 'nexora_dev.db')}"
    _connect_args = {"check_same_thread": False}
else:
    _connect_args = {}

DATABASE_URL = _db_url
engine = create_engine(DATABASE_URL, connect_args=_connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
