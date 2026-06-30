"""
Workspace service.

Orchestrates all workspace business logic:
  - Ownership enforcement (only the owner can modify their workspaces)
  - Activity log recording (create / update / delete events)
  - Schema conversion (ORM → Pydantic response)

Architecture contract:
  - Routes call this service, nothing else.
  - This service calls WorkspaceRepository for DB access.
  - This service writes ActivityLog rows directly (append-only audit trail).
  - No SQLAlchemy statements here — all DB access goes through the repository.
"""
from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ForbiddenError, NotFoundError
from app.models.activity_log import ActivityLog
from app.models.enums import ActivityType
from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.workspace import (
    WorkspaceCreate,
    WorkspaceResponse,
    WorkspaceUpdate,
)


class WorkspaceService:
    """
    Orchestrates workspace CRUD and activity logging.

    Constructor
    -----------
    session : AsyncSession
        Per-request async SQLAlchemy session injected by ``get_db()``.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = WorkspaceRepository(session)

    # ── Private helpers ────────────────────────────────────────────────────────

    async def _log(
        self,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
        activity_type: ActivityType,
        description: str,
        details: dict | None = None,
    ) -> None:
        """Append an immutable activity-log entry."""
        log = ActivityLog(
            workspace_id=workspace_id,
            user_id=user_id,
            activity_type=activity_type,
            description=description,
            details=details,
        )
        self._session.add(log)
        # No flush needed here — the outer transaction will commit everything.

    # ── Public methods ─────────────────────────────────────────────────────────

    async def list_workspaces(self, user_id_str: str) -> list[WorkspaceResponse]:
        """
        Return all workspaces owned by the authenticated user.

        Args:
            user_id_str: UUID string from the JWT ``sub`` claim.

        Returns:
            List of ``WorkspaceResponse`` ordered by creation date (oldest first).
        """
        user_id = uuid.UUID(user_id_str)
        workspaces = await self._repo.list_for_owner(user_id)
        return [WorkspaceResponse.model_validate(w) for w in workspaces]

    async def create_workspace(
        self,
        user_id_str: str,
        payload: WorkspaceCreate,
    ) -> WorkspaceResponse:
        """
        Create a new workspace and record a WORKSPACE_CREATE log entry.

        Args:
            user_id_str: UUID string from the JWT ``sub`` claim.
            payload:     Validated ``WorkspaceCreate`` schema.

        Returns:
            The created ``WorkspaceResponse``.
        """
        user_id = uuid.UUID(user_id_str)

        workspace = await self._repo.create(
            owner_id=user_id,
            data={
                "name":        payload.name,
                "description": payload.description,
                "color":       payload.color,
            },
        )

        await self._log(
            workspace_id=workspace.id,
            user_id=user_id,
            activity_type=ActivityType.WORKSPACE_CREATE,
            description=f"Created workspace '{workspace.name}'",
            details={"name": workspace.name, "color": workspace.color},
        )

        return WorkspaceResponse.model_validate(workspace)

    async def get_workspace(
        self,
        user_id_str: str,
        workspace_id: uuid.UUID,
    ) -> WorkspaceResponse:
        """
        Fetch a single workspace by id (owner-scoped).

        Args:
            user_id_str:  JWT subject.
            workspace_id: UUID of the workspace to retrieve.

        Returns:
            ``WorkspaceResponse``

        Raises:
            NotFoundError: If the workspace does not exist or belongs to another user.
        """
        user_id = uuid.UUID(user_id_str)
        workspace = await self._repo.get_by_id(workspace_id, user_id)

        if workspace is None:
            raise NotFoundError("Workspace", workspace_id)

        return WorkspaceResponse.model_validate(workspace)

    async def update_workspace(
        self,
        user_id_str: str,
        workspace_id: uuid.UUID,
        payload: WorkspaceUpdate,
    ) -> WorkspaceResponse:
        """
        Partially update a workspace (PATCH semantics).

        Only fields provided in *payload* are written — ``None`` values are
        ignored so clients can omit unchanged fields.

        Args:
            user_id_str:  JWT subject.
            workspace_id: UUID of the workspace to update.
            payload:      ``WorkspaceUpdate`` (all fields optional).

        Returns:
            The updated ``WorkspaceResponse``.

        Raises:
            NotFoundError:  Workspace not found or belongs to another user.
        """
        user_id = uuid.UUID(user_id_str)

        # Verify ownership first
        existing = await self._repo.get_by_id(workspace_id, user_id)
        if existing is None:
            raise NotFoundError("Workspace", workspace_id)

        update_data = payload.model_dump(exclude_none=True)

        workspace = await self._repo.update(
            workspace_id=workspace_id,
            owner_id=user_id,
            data=update_data,
        )

        if workspace is None:
            raise NotFoundError("Workspace", workspace_id)

        await self._log(
            workspace_id=workspace.id,
            user_id=user_id,
            activity_type=ActivityType.WORKSPACE_UPDATE,
            description=f"Updated workspace '{workspace.name}'",
            details=update_data,
        )

        return WorkspaceResponse.model_validate(workspace)

    async def delete_workspace(
        self,
        user_id_str: str,
        workspace_id: uuid.UUID,
    ) -> None:
        """
        Soft-delete a workspace (sets ``deleted_at``).

        The workspace and all its child records remain in the database for
        audit purposes but are excluded from all future queries.

        Args:
            user_id_str:  JWT subject.
            workspace_id: UUID of the workspace to delete.

        Raises:
            NotFoundError: Workspace not found or belongs to another user.
        """
        user_id = uuid.UUID(user_id_str)

        # Capture name before deletion for the log description
        existing = await self._repo.get_by_id(workspace_id, user_id)
        if existing is None:
            raise NotFoundError("Workspace", workspace_id)

        deleted = await self._repo.soft_delete(workspace_id, user_id)
        if not deleted:
            raise NotFoundError("Workspace", workspace_id)

        # Write activity log *after* soft-delete succeeds.
        # Note: we add the log to the session; the parent get_db() will commit.
        log = ActivityLog(
            workspace_id=workspace_id,
            user_id=user_id,
            activity_type=ActivityType.WORKSPACE_DELETE,
            description=f"Deleted workspace '{existing.name}'",
            details={"name": existing.name},
        )
        self._session.add(log)
