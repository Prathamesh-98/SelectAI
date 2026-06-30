"""
AnalysisSession service.

Orchestrates all analysis session business logic.
"""
from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, NotFoundError
from app.models.activity_log import ActivityLog
from app.models.enums import ActivityType, SessionStatus
from app.repositories.analysis_session_repository import AnalysisSessionRepository
from app.repositories.dataset_repository import DatasetRepository
from app.repositories.workspace_repository import WorkspaceRepository


class AnalysisSessionService:
    """
    Orchestrates session creation, listing, retrieval, update, and deletion.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = AnalysisSessionRepository(session)
        self._ws_repo = WorkspaceRepository(session)
        self._ds_repo = DatasetRepository(session)

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

    def _format_session(self, session_model: Any) -> dict[str, Any]:
        """Convert an AnalysisSession model to a response dict including dataset_ids."""
        return {
            "id": session_model.id,
            "workspace_id": session_model.workspace_id,
            "created_by": session_model.created_by,
            "name": session_model.name,
            "description": session_model.description,
            "goal": session_model.goal,
            "status": session_model.status,
            "dataset_ids": [ds.dataset_id for ds in session_model.session_datasets],
            "created_at": session_model.created_at,
            "updated_at": session_model.updated_at,
        }

    # ── Public methods ─────────────────────────────────────────────────────────

    async def list_sessions(self, user_id_str: str, workspace_id: uuid.UUID) -> list[dict[str, Any]]:
        """
        List all sessions in a workspace owned by the user.
        """
        user_id = uuid.UUID(user_id_str)
        workspace = await self._ws_repo.get_by_id(workspace_id, user_id)
        if workspace is None:
            raise NotFoundError("Workspace", workspace_id)

        sessions = await self._repo.list_by_workspace(workspace_id)
        return [self._format_session(s) for s in sessions]

    async def get_session(
        self,
        user_id_str: str,
        session_id: uuid.UUID,
        workspace_id: uuid.UUID,
    ) -> dict[str, Any]:
        """
        Fetch a single session within a workspace owned by the user.
        """
        user_id = uuid.UUID(user_id_str)
        workspace = await self._ws_repo.get_by_id(workspace_id, user_id)
        if workspace is None:
            raise NotFoundError("Workspace", workspace_id)

        session_model = await self._repo.get_by_id(session_id, workspace_id)
        if session_model is None:
            raise NotFoundError("AnalysisSession", session_id)

        return self._format_session(session_model)

    async def create_session(
        self,
        user_id_str: str,
        workspace_id: uuid.UUID,
        name: str,
        description: str | None,
        goal: str | None,
        dataset_ids: list[uuid.UUID],
    ) -> dict[str, Any]:
        """
        Validate and create an analysis session.
        """
        user_id = uuid.UUID(user_id_str)

        workspace = await self._ws_repo.get_by_id(workspace_id, user_id)
        if workspace is None:
            raise NotFoundError("Workspace", workspace_id)

        if dataset_ids:
            # Verify all dataset_ids belong to the workspace
            workspace_datasets = await self._ds_repo.list_by_workspace(workspace_id)
            valid_ds_ids = {ds.id for ds in workspace_datasets}
            for ds_id in dataset_ids:
                if ds_id not in valid_ds_ids:
                    raise BadRequestError(f"Dataset '{ds_id}' does not belong to this workspace.")

        data = {
            "name": name,
            "description": description,
            "goal": goal,
        }

        session_model = await self._repo.create(workspace_id, user_id, data, dataset_ids)

        await self._log(
            workspace_id=workspace_id,
            user_id=user_id,
            activity_type=ActivityType.SESSION_CREATE,
            description=f"Created analysis session '{name}'",
            details={
                "session_id": str(session_model.id),
                "session_name": name,
            },
        )

        return self._format_session(session_model)

    async def update_session(
        self,
        user_id_str: str,
        session_id: uuid.UUID,
        workspace_id: uuid.UUID,
        patch_data: dict[str, Any],
    ) -> dict[str, Any]:
        """
        Update an analysis session.
        """
        user_id = uuid.UUID(user_id_str)

        workspace = await self._ws_repo.get_by_id(workspace_id, user_id)
        if workspace is None:
            raise NotFoundError("Workspace", workspace_id)
            
        session_model = await self._repo.update(session_id, workspace_id, patch_data)
        if session_model is None:
            raise NotFoundError("AnalysisSession", session_id)

        log_activity = ActivityType.SESSION_UPDATE
        log_desc = f"Updated analysis session '{session_model.name}'"
        
        if patch_data.get("status") == SessionStatus.ARCHIVED:
            log_activity = ActivityType.SESSION_ARCHIVE
            log_desc = f"Archived analysis session '{session_model.name}'"

        await self._log(
            workspace_id=workspace_id,
            user_id=user_id,
            activity_type=log_activity,
            description=log_desc,
            details={
                "session_id": str(session_model.id),
                "session_name": session_model.name,
                "updates": list(patch_data.keys()),
            },
        )

        return self._format_session(session_model)

    async def delete_session(
        self,
        user_id_str: str,
        session_id: uuid.UUID,
        workspace_id: uuid.UUID,
    ) -> None:
        """
        Soft delete an analysis session.
        """
        user_id = uuid.UUID(user_id_str)

        workspace = await self._ws_repo.get_by_id(workspace_id, user_id)
        if workspace is None:
            raise NotFoundError("Workspace", workspace_id)

        deleted = await self._repo.delete(session_id, workspace_id)
        if not deleted:
            raise NotFoundError("AnalysisSession", session_id)
