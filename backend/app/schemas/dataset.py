"""
Dataset Pydantic schemas.

Used for validation of dataset creation and serialization of dataset responses.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field

from app.models.enums import DatasetStatus
from app.schemas.base import BaseSchema


class DatasetCreate(BaseSchema):
    """Payload to create/register a dataset."""
    workspace_id: uuid.UUID = Field(..., description="ID of the workspace to attach the dataset to.")


class DatasetResponse(BaseSchema):
    """Serialized representation of a Dataset ORM model."""
    id: uuid.UUID
    workspace_id: uuid.UUID
    uploaded_by: uuid.UUID
    name: str
    storage_key: str
    file_size_bytes: int
    row_count: int | None = None
    column_count: int | None = None
    columns_metadata: dict[str, Any] | list[Any] | None = None
    status: DatasetStatus
    error_message: str | None = None
    created_at: datetime
    updated_at: datetime


class DatasetListResponse(BaseSchema):
    """Envelope wrapping a list of datasets."""
    datasets: list[DatasetResponse]
