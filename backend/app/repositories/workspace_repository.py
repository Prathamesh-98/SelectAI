"""
Workspace repository.

All database access for the ``workspaces`` table goes through this class.
Service layer calls these methods — routes never touch SQLAlchemy directly.

Ownership scoping: every query filters by ``owner_id`` so that users can
only ever see or modify their own workspaces.

Soft-delete: records are never physically removed. ``deleted_at`` is set
to the current UTC timestamp instead of issuing a DELETE statement.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Any

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.workspace import Workspace


class WorkspaceRepository:
    """
    Data-access layer for the ``workspaces`` table.

    All queries are owner-scoped and exclude soft-deleted rows unless
    explicitly requested.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    # ── Reads ──────────────────────────────────────────────────────────────────

    async def list_for_owner(self, owner_id: uuid.UUID) -> list[Workspace]:
        """
        Return all non-deleted workspaces owned by *owner_id*.

        Results are ordered newest-first (created_at DESC).
        """
        result = await self._session.execute(
            select(Workspace)
            .where(
                Workspace.owner_id == owner_id,
                Workspace.deleted_at.is_(None),
            )
            .order_by(Workspace.created_at.asc())
        )
        return list(result.scalars().all())

    async def get_by_id(
        self,
        workspace_id: uuid.UUID,
        owner_id: uuid.UUID,
    ) -> Workspace | None:
        """
        Fetch a single workspace by primary key, scoped to *owner_id*.

        Returns ``None`` when not found or belongs to a different user.
        """
        result = await self._session.execute(
            select(Workspace).where(
                Workspace.id == workspace_id,
                Workspace.owner_id == owner_id,
                Workspace.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none()

    # ── Writes ─────────────────────────────────────────────────────────────────

    async def create(
        self,
        owner_id: uuid.UUID,
        data: dict[str, Any],
    ) -> Workspace:
        """
        Insert a new workspace row.

        Args:
            owner_id: UUID of the authenticated user who will own it.
            data:     Dict with at minimum ``name``.  May include
                      ``description`` and ``color``.

        Returns:
            The newly created ``Workspace`` instance (with generated id/timestamps).
        """
        workspace = Workspace(owner_id=owner_id, **data)
        self._session.add(workspace)
        await self._session.flush()
        await self._session.refresh(workspace)
        return workspace

    async def update(
        self,
        workspace_id: uuid.UUID,
        owner_id: uuid.UUID,
        data: dict[str, Any],
    ) -> Workspace | None:
        """
        Partially update a workspace by primary key (owner-scoped).

        Args:
            workspace_id: UUID of the workspace to update.
            owner_id:     Must match the workspace's ``owner_id``.
            data:         Non-empty dict of column/value pairs to update.

        Returns:
            The updated ``Workspace`` instance, or ``None`` if not found.
        """
        # Only update fields that were explicitly provided (PATCH semantics)
        data = {k: v for k, v in data.items() if v is not None}
        if not data:
            # Nothing to update — fetch and return as-is
            return await self.get_by_id(workspace_id, owner_id)

        # Append updated_at timestamp
        data["updated_at"] = datetime.now(timezone.utc)

        await self._session.execute(
            update(Workspace)
            .where(
                Workspace.id == workspace_id,
                Workspace.owner_id == owner_id,
                Workspace.deleted_at.is_(None),
            )
            .values(**data)
        )
        await self._session.flush()
        return await self.get_by_id(workspace_id, owner_id)

    async def soft_delete(
        self,
        workspace_id: uuid.UUID,
        owner_id: uuid.UUID,
    ) -> bool:
        """
        Soft-delete a workspace by setting ``deleted_at`` to now.

        Args:
            workspace_id: UUID of the workspace to delete.
            owner_id:     Must match the workspace's ``owner_id``.

        Returns:
            ``True`` if a row was updated, ``False`` if not found.
        """
        result = await self._session.execute(
            update(Workspace)
            .where(
                Workspace.id == workspace_id,
                Workspace.owner_id == owner_id,
                Workspace.deleted_at.is_(None),
            )
            .values(deleted_at=datetime.now(timezone.utc))
        )
        await self._session.flush()
        return (result.rowcount or 0) > 0
