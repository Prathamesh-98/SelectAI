"""
AnalysisSession repository.
"""
from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.analysis_session import AnalysisSession
from app.models.analysis_session_dataset import AnalysisSessionDataset


class AnalysisSessionRepository:
    """
    Data-access layer for the ``analysis_sessions`` table.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_by_workspace(self, workspace_id: uuid.UUID) -> list[AnalysisSession]:
        """
        List all non-deleted sessions in a workspace.
        """
        result = await self._session.execute(
            select(AnalysisSession)
            .where(
                AnalysisSession.workspace_id == workspace_id,
                AnalysisSession.deleted_at.is_(None),
            )
            .options(selectinload(AnalysisSession.session_datasets))
            .order_by(AnalysisSession.updated_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id_global(
        self,
        session_id: uuid.UUID,
    ) -> AnalysisSession | None:
        """
        Fetch a single session globally by ID without requiring a workspace ID.
        """
        result = await self._session.execute(
            select(AnalysisSession)
            .where(
                AnalysisSession.id == session_id,
                AnalysisSession.deleted_at.is_(None),
            )
            .options(selectinload(AnalysisSession.session_datasets))
        )
        return result.scalar_one_or_none()

    async def get_by_id(
        self,
        session_id: uuid.UUID,
        workspace_id: uuid.UUID,
    ) -> AnalysisSession | None:
        """
        Fetch a single session by ID within a workspace.
        """
        result = await self._session.execute(
            select(AnalysisSession)
            .where(
                AnalysisSession.id == session_id,
                AnalysisSession.workspace_id == workspace_id,
                AnalysisSession.deleted_at.is_(None),
            )
            .options(selectinload(AnalysisSession.session_datasets))
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        workspace_id: uuid.UUID,
        created_by: uuid.UUID,
        data: dict[str, Any],
        dataset_ids: list[uuid.UUID],
    ) -> AnalysisSession:
        """
        Insert a new session record and its dataset associations.
        """
        session_model = AnalysisSession(
            workspace_id=workspace_id,
            created_by=created_by,
            **data,
        )
        self._session.add(session_model)
        await self._session.flush()

        for ds_id in dataset_ids:
            assoc = AnalysisSessionDataset(
                session_id=session_model.id,
                dataset_id=ds_id,
            )
            self._session.add(assoc)
            
        await self._session.flush()
        await self._session.refresh(session_model, ["session_datasets"])
        return session_model

    async def update(
        self,
        session_id: uuid.UUID,
        workspace_id: uuid.UUID,
        patch_data: dict[str, Any],
    ) -> AnalysisSession | None:
        """
        Update a session record.
        """
        session_model = await self.get_by_id(session_id, workspace_id)
        if session_model is None:
            return None

        for key, value in patch_data.items():
            setattr(session_model, key, value)

        await self._session.flush()
        await self._session.refresh(session_model, ["session_datasets"])
        return session_model

    async def delete(
        self,
        session_id: uuid.UUID,
        workspace_id: uuid.UUID,
    ) -> bool:
        """
        Soft-delete a session record from the database.
        """
        session_model = await self.get_by_id(session_id, workspace_id)
        if session_model is None:
            return False

        await self._session.delete(session_model)
        await self._session.flush()
        return True
