"""
Dataset repository.

All database queries/mutations for the ``datasets`` table pass through this repository.
"""
from __future__ import annotations

import uuid
from typing import Any

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.dataset import Dataset


class DatasetRepository:
    """
    Data-access layer for the ``datasets`` table.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    async def list_by_workspace(self, workspace_id: uuid.UUID) -> list[Dataset]:
        """
        List all non-deleted datasets in a workspace.
        """
        result = await self._session.execute(
            select(Dataset)
            .where(
                Dataset.workspace_id == workspace_id,
                Dataset.deleted_at.is_(None),
            )
            .order_by(Dataset.created_at.desc())
        )
        return list(result.scalars().all())

    async def get_by_id(
        self,
        dataset_id: uuid.UUID,
        workspace_id: uuid.UUID,
    ) -> Dataset | None:
        """
        Fetch a single dataset by ID within a workspace.
        """
        result = await self._session.execute(
            select(Dataset).where(
                Dataset.id == dataset_id,
                Dataset.workspace_id == workspace_id,
                Dataset.deleted_at.is_(None),
            )
        )
        return result.scalar_one_or_none()

    async def create(
        self,
        workspace_id: uuid.UUID,
        uploaded_by: uuid.UUID,
        data: dict[str, Any],
    ) -> Dataset:
        """
        Insert a new dataset record.
        """
        dataset = Dataset(
            workspace_id=workspace_id,
            uploaded_by=uploaded_by,
            **data,
        )
        self._session.add(dataset)
        await self._session.flush()
        await self._session.refresh(dataset)
        return dataset

    async def delete(
        self,
        dataset_id: uuid.UUID,
        workspace_id: uuid.UUID,
    ) -> bool:
        """
        Hard-delete a dataset record from the database.
        """
        dataset = await self.get_by_id(dataset_id, workspace_id)
        if dataset is None:
            return False

        await self._session.delete(dataset)
        await self._session.flush()
        return True
