"""
Async SQLAlchemy engine and session factory.

This module owns the database connection pool.
Nothing else should create engines or sessions — always use ``get_db()`` from dependencies.py
or ``AsyncSessionLocal`` directly when outside a request context (e.g., scripts).

Architecture:
    - Engine:   shared, module-level, created once at import time
    - Session:  per-request, yielded by the ``get_db`` dependency
"""
from typing import AsyncGenerator

from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

# ─── Engine ───────────────────────────────────────────────────────────────────

engine: AsyncEngine = create_async_engine(
    settings.DATABASE_URL,
    echo=settings.DATABASE_ECHO,
    pool_pre_ping=True,              # test connections before use (avoids stale-connection errors)
    pool_size=settings.DATABASE_POOL_SIZE,
    max_overflow=settings.DATABASE_MAX_OVERFLOW,
    pool_recycle=3600,               # recycle connections after 1 hour
)

# ─── Session factory ──────────────────────────────────────────────────────────

AsyncSessionLocal: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,          # keep objects usable after commit without re-fetching
    autoflush=False,                 # explicit control — flush manually or at commit
    autocommit=False,
)


# ─── Convenience generator (used by dependency in core/dependencies.py) ───────

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Yield an ``AsyncSession`` for a single request.

    Prefer importing ``get_db`` from ``app.core.dependencies`` in route handlers —
    this function is the implementation, exposed here for scripts and tests.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
