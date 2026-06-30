"""
Dataset router.

Routes:
    GET    /datasets        — List all datasets in a workspace (owner-scoped)
    POST   /datasets        — Upload a CSV dataset (multipart/form-data)
    GET    /datasets/{id}   — Fetch a single dataset metadata
    DELETE /datasets/{id}   — Delete a dataset
"""
from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, File, Form, Query, UploadFile, status

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.base import APIResponse
from app.schemas.dataset import DatasetResponse
from app.services.dataset_service import DatasetService

router = APIRouter()


# ── Dependency ────────────────────────────────────────────────────────────────

def get_dataset_service(db: DBSession) -> DatasetService:
    """Construct a DatasetService for the current request."""
    return DatasetService(db)


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=APIResponse[list[DatasetResponse]],
    status_code=status.HTTP_200_OK,
    summary="List datasets",
    description="List all non-deleted datasets in a workspace (workspace ownership required).",
)
async def list_datasets(
    workspace_id: uuid.UUID = Query(..., description="The workspace ID to list datasets from."),
    current_user: CurrentUser = None,
    service: DatasetService = Depends(get_dataset_service),
) -> APIResponse[list[DatasetResponse]]:
    """List datasets in a workspace."""
    datasets = await service.list_datasets(current_user, workspace_id)
    return APIResponse(
        success=True,
        message="Datasets retrieved successfully.",
        data=[DatasetResponse.model_validate(ds) for ds in datasets],
    )


@router.post(
    "",
    response_model=APIResponse[DatasetResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Upload dataset",
    description="Upload a CSV dataset file (multipart/form-data). Extracted metadata is saved.",
)
async def upload_dataset(
    workspace_id: uuid.UUID = Form(..., description="ID of the workspace to attach the dataset to."),
    file: UploadFile = File(..., description="The CSV dataset file to upload."),
    current_user: CurrentUser = None,
    service: DatasetService = Depends(get_dataset_service),
) -> APIResponse[DatasetResponse]:
    """Upload and parse a CSV dataset."""
    file_bytes = await file.read()
    dataset = await service.upload_dataset(
        user_id_str=current_user,
        workspace_id=workspace_id,
        filename=file.filename or "dataset.csv",
        file_bytes=file_bytes,
    )
    return APIResponse(
        success=True,
        message="Dataset uploaded and processed successfully.",
        data=DatasetResponse.model_validate(dataset),
    )


@router.get(
    "/{dataset_id}",
    response_model=APIResponse[DatasetResponse],
    status_code=status.HTTP_200_OK,
    summary="Get dataset",
    description="Get metadata of a specific dataset.",
)
async def get_dataset(
    dataset_id: uuid.UUID,
    workspace_id: uuid.UUID = Query(..., description="Workspace ID where the dataset resides."),
    current_user: CurrentUser = None,
    service: DatasetService = Depends(get_dataset_service),
) -> APIResponse[DatasetResponse]:
    """Fetch single dataset metadata."""
    dataset = await service.get_dataset(current_user, dataset_id, workspace_id)
    return APIResponse(
        success=True,
        message="Dataset retrieved successfully.",
        data=DatasetResponse.model_validate(dataset),
    )


@router.delete(
    "/{dataset_id}",
    response_model=APIResponse[dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Delete dataset",
    description="Delete a dataset, its local CSV file, and its activity log entries.",
)
async def delete_dataset(
    dataset_id: uuid.UUID,
    workspace_id: uuid.UUID = Query(..., description="Workspace ID where the dataset resides."),
    current_user: CurrentUser = None,
    service: DatasetService = Depends(get_dataset_service),
) -> APIResponse[dict[str, Any]]:
    """Delete a dataset and cleanup its resources."""
    await service.delete_dataset(current_user, dataset_id, workspace_id)
    return APIResponse(
        success=True,
        message="Dataset deleted successfully.",
        data={"id": str(dataset_id)},
    )
