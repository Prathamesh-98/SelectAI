"""
Shared Pydantic base schemas.

All request and response schemas should inherit from these bases to ensure
consistent configuration, serialisation behaviour, and API envelope shape.

Usage:
    from app.schemas.base import BaseSchema, APIResponse, PaginatedResponse

    class WorkspaceOut(IDSchema, TimestampedSchema):
        name: str
        description: str | None = None
"""
from datetime import datetime
from typing import Generic, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict

# ─── Generic type for paginated data ─────────────────────────────────────────
DataT = TypeVar("DataT")


# ─── Base configuration ───────────────────────────────────────────────────────

class BaseSchema(BaseModel):
    """
    Root schema class.

    Configuration:
        - ``from_attributes=True``   → enable ORM-mode (read from SQLAlchemy models)
        - ``populate_by_name=True``  → allow both alias and field name
    """

    model_config = ConfigDict(
        from_attributes=True,
        populate_by_name=True,
        str_strip_whitespace=True,
    )


# ─── Common field mixins ──────────────────────────────────────────────────────

class IDSchema(BaseSchema):
    """Schema with a UUID ``id`` field."""
    id: UUID


class TimestampedSchema(BaseSchema):
    """Schema with ``created_at`` and ``updated_at`` fields."""
    created_at: datetime
    updated_at: datetime


# ─── API response envelopes ───────────────────────────────────────────────────

class APIResponse(BaseSchema, Generic[DataT]):
    """
    Standard success response envelope.

    All API endpoints should return this shape for consistency.

    Example JSON:
        {
            "success": true,
            "message": "Workspace created.",
            "data": { ... }
        }
    """
    success: bool = True
    message: str | None = None
    data: DataT | None = None


class PaginatedResponse(BaseSchema, Generic[DataT]):
    """
    Standard paginated response envelope.

    Example JSON:
        {
            "success": true,
            "total": 42,
            "page": 1,
            "page_size": 20,
            "has_next": true,
            "has_previous": false,
            "items": [ ... ]
        }
    """
    success: bool = True
    total: int
    page: int
    page_size: int
    has_next: bool
    has_previous: bool
    items: list[DataT]


class ErrorResponse(BaseSchema):
    """
    Standard error response envelope.

    Example JSON:
        {
            "success": false,
            "code": "NOT_FOUND",
            "message": "Workspace with id '...' not found."
        }
    """
    success: bool = False
    code: str
    message: str
