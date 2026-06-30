"""
Workspace Pydantic schemas.

Used by the workspace router for request validation and response serialisation.
All schemas use Pydantic v2 (model_config + model_validate).
"""
from __future__ import annotations

import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field, field_validator


# ─── Request schemas ──────────────────────────────────────────────────────────

class WorkspaceCreate(BaseModel):
    """Payload for POST /workspaces — create a new workspace."""

    name: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="Display name for the workspace.",
    )
    description: str | None = Field(
        default=None,
        max_length=1000,
        description="Optional human-readable description.",
    )
    color: str = Field(
        default="#3B82F6",
        description="CSS hex colour string, e.g. '#3B82F6'.",
    )

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, v: str) -> str:
        stripped = v.strip()
        if not stripped:
            raise ValueError("Workspace name must not be blank.")
        return stripped

    @field_validator("color")
    @classmethod
    def color_must_be_hex(cls, v: str) -> str:
        v = v.strip()
        if not (v.startswith("#") and len(v) in (4, 7)):
            raise ValueError("Colour must be a CSS hex string like '#3B82F6'.")
        return v


class WorkspaceUpdate(BaseModel):
    """Payload for PATCH /workspaces/{id} — partial update."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = Field(default=None, max_length=1000)
    color: str | None = Field(default=None)

    @field_validator("name")
    @classmethod
    def name_must_not_be_blank(cls, v: str | None) -> str | None:
        if v is None:
            return v
        stripped = v.strip()
        if not stripped:
            raise ValueError("Workspace name must not be blank.")
        return stripped

    @field_validator("color")
    @classmethod
    def color_must_be_hex(cls, v: str | None) -> str | None:
        if v is None:
            return v
        v = v.strip()
        if not (v.startswith("#") and len(v) in (4, 7)):
            raise ValueError("Colour must be a CSS hex string like '#3B82F6'.")
        return v


# ─── Response schemas ─────────────────────────────────────────────────────────

class WorkspaceResponse(BaseModel):
    """Full workspace representation returned to the client."""

    model_config = ConfigDict(from_attributes=True)

    id:          uuid.UUID
    name:        str
    description: str | None
    color:       str
    owner_id:    uuid.UUID
    created_at:  datetime
    updated_at:  datetime

