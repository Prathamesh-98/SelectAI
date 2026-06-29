"""
FastAPI dependency injection providers.

All reusable ``Depends(...)`` callables live here.
Route handlers import what they need — this is the single source of truth for DI.

Usage:
    from app.core.dependencies import get_db, get_current_user

    @router.get("/me")
    async def me(
        db:   AsyncSession = Depends(get_db),
        user: User         = Depends(get_current_user),
    ): ...
"""
from typing import Annotated, AsyncGenerator

from fastapi import Depends, Security
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import UnauthorizedError
from app.core.security import decode_token
from app.database.session import AsyncSessionLocal

# ─── HTTP Bearer scheme ───────────────────────────────────────────────────────

_bearer = HTTPBearer(auto_error=False)


# ─── Database session ─────────────────────────────────────────────────────────

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """
    Yield an async database session for the duration of a request.

    The session is automatically committed or rolled back and then closed.
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


# ─── Current user (stub) ──────────────────────────────────────────────────────

async def get_current_user_id(
    credentials: HTTPAuthorizationCredentials | None = Security(_bearer),
) -> str:
    """
    Extract and validate the JWT token from the Authorization header.

    Returns:
        The subject (user UUID) from the token payload.

    Raises:
        UnauthorizedError: If no token is provided or the token is invalid.
    """
    if credentials is None:
        raise UnauthorizedError("Authorization header is missing.")

    payload = decode_token(credentials.credentials)
    user_id: str | None = payload.get("sub")

    if user_id is None:
        raise UnauthorizedError("Token payload is malformed.")

    return user_id


# ─── Typed aliases (use these in route signatures) ────────────────────────────

DBSession   = Annotated[AsyncSession, Depends(get_db)]
CurrentUser = Annotated[str, Depends(get_current_user_id)]
