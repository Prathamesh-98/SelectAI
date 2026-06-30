"""
User repository.

Encapsulates all database access for the User model.
The service layer calls this; routes never touch SQLAlchemy directly.

All methods accept an ``AsyncSession`` injected by ``get_db()``.
"""
from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.user import User


class UserRepository:
    """
    Data-access layer for the ``users`` table.

    Constructor
    -----------
    session : AsyncSession
        The per-request async SQLAlchemy session (injected via Depends).
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ── Reads ──────────────────────────────────────────────────────────────────

    async def get_by_email(self, email: str) -> User | None:
        """
        Fetch an active user by e-mail address.

        Args:
            email: Case-insensitive e-mail lookup (lowercased before query).

        Returns:
            The matching ``User`` ORM instance, or ``None`` if not found.
        """
        result = await self._session.execute(
            select(User).where(
                User.email == email.lower().strip(),
                User.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none()

    async def get_by_id(self, user_id: uuid.UUID) -> User | None:
        """
        Fetch an active user by primary key.

        Args:
            user_id: UUID of the user to retrieve.

        Returns:
            The matching ``User`` ORM instance, or ``None`` if not found.
        """
        result = await self._session.execute(
            select(User).where(
                User.id == user_id,
                User.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none()

    async def email_exists(self, email: str) -> bool:
        """
        Check whether a given e-mail is already registered.

        Faster than ``get_by_email`` — avoids fetching the full row.

        Args:
            email: The e-mail to check.

        Returns:
            True if a non-deleted user with this e-mail exists.
        """
        result = await self._session.execute(
            select(User.id).where(
                User.email == email.lower().strip(),
                User.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none() is not None

    # ── Writes ─────────────────────────────────────────────────────────────────

    async def create(self, data: dict[str, Any]) -> User:
        """
        Insert a new user row and return the persisted instance.

        The caller is responsible for committing the session.
        The ``get_db`` dependency commits automatically after the request.

        Args:
            data: Column/value mapping. Must include at minimum:
                  ``email``, ``hashed_password``, ``full_name``.

        Returns:
            The newly created ``User`` instance (with generated id, timestamps).
        """
        # Normalise e-mail before persisting
        if "email" in data:
            data["email"] = data["email"].lower().strip()

        user = User(**data)
        self._session.add(user)
        await self._session.flush()   # flush to obtain auto-generated id/timestamps
        await self._session.refresh(user)
        return user
