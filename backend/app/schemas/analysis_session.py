"""
AnalysisSession Pydantic schemas.
"""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import Field

from app.models.enums import SessionStatus
from app.schemas.base import BaseSchema


class AnalysisSessionCreate(BaseSchema):
    """Payload to create an analysis session."""
    workspace_id: uuid.UUID = Field(..., description="ID of the workspace.")
    name: str = Field(..., max_length=255, description="Name of the session.")
    description: str | None = Field(default=None, description="Optional description.")
    goal: str | None = Field(default=None, description="Goal or hypothesis.")
    dataset_ids: list[uuid.UUID] = Field(
        default_factory=list, description="IDs of datasets to attach."
    )


class AnalysisSessionUpdate(BaseSchema):
    """Payload to update an analysis session."""
    name: str | None = Field(default=None, max_length=255)
    description: str | None = None
    goal: str | None = None
    status: SessionStatus | None = None


class AnalysisSessionResponse(BaseSchema):
    """Serialized representation of an AnalysisSession."""
    id: uuid.UUID
    workspace_id: uuid.UUID
    created_by: uuid.UUID
    name: str
    description: str | None = None
    goal: str | None = None
    status: SessionStatus
    dataset_ids: list[uuid.UUID]
    created_at: datetime
    updated_at: datetime


class AnalysisSessionListResponse(BaseSchema):
    """Envelope wrapping a list of analysis sessions."""
    sessions: list[AnalysisSessionResponse]
