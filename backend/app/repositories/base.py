"""
Abstract repository interface.

Every concrete repository must implement this interface.
Service classes depend on the *interface*, not the concrete implementation,
making the repository layer mockable and testable without a real database.

Usage:
    from app.repositories.base import AbstractRepository

    class WorkspaceRepository(AbstractRepository[Workspace]):
        async def get_by_id(self, id: UUID) -> Workspace | None:
            result = await self.session.get(Workspace, id)
            return result
        ...
"""
from abc import ABC, abstractmethod
from typing import Any, Generic, TypeVar
from uuid import UUID

from sqlalchemy.ext.asyncio import AsyncSession

# Generic model type parameter
ModelT = TypeVar("ModelT")


class AbstractRepository(ABC, Generic[ModelT]):
    """
    Abstract base class defining the standard repository interface.

    Concrete repositories inherit from this class and receive an
    ``AsyncSession`` at construction time (injected by the service layer).

    Standard methods cover the full CRUD surface. Repositories may add
    domain-specific query methods beyond this interface.
    """

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    # ── Read ──────────────────────────────────────────────────────────────────

    @abstractmethod
    async def get_by_id(self, id: UUID) -> ModelT | None:
        """Fetch a single record by its primary key. Returns None if not found."""
        ...

    @abstractmethod
    async def list(
        self,
        *,
        skip: int = 0,
        limit: int = 100,
        filters: dict[str, Any] | None = None,
    ) -> list[ModelT]:
        """
        Return a paginated list of records.

        Args:
            skip:    Number of records to skip (offset).
            limit:   Maximum number of records to return.
            filters: Optional key/value pairs to filter by exact column match.
        """
        ...

    @abstractmethod
    async def count(self, filters: dict[str, Any] | None = None) -> int:
        """Return the total count of records matching the given filters."""
        ...

    # ── Write ─────────────────────────────────────────────────────────────────

    @abstractmethod
    async def create(self, data: dict[str, Any]) -> ModelT:
        """
        Insert a new record.

        Args:
            data: Column/value mapping for the new row.

        Returns:
            The newly created model instance (with generated id, timestamps, etc.).
        """
        ...

    @abstractmethod
    async def update(self, id: UUID, data: dict[str, Any]) -> ModelT | None:
        """
        Update an existing record by primary key.

        Args:
            id:   The record's UUID.
            data: Partial column/value mapping of fields to update.

        Returns:
            The updated model instance, or None if the record was not found.
        """
        ...

    @abstractmethod
    async def delete(self, id: UUID) -> bool:
        """
        Permanently delete a record by primary key.

        Returns:
            True if a record was deleted, False if it was not found.
        """
        ...
