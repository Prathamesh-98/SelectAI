"""
Workspace router.

Routes:
    GET    /workspaces              — list all workspaces owned by the caller
    POST   /workspaces              — create a new workspace
    GET    /workspaces/{id}         — get a single workspace
    PATCH  /workspaces/{id}         — partially update a workspace
    DELETE /workspaces/{id}         — soft-delete a workspace

Design contract:
  - Routes are thin: validate input → call service → return response.
  - All business logic (ownership checks, logging) lives in WorkspaceService.
  - Domain exceptions (NotFoundError, ForbiddenError) are handled globally by
    the exception handlers registered in main.py.
"""
from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends, status

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.workspace import WorkspaceCreate, WorkspaceResponse, WorkspaceUpdate
from app.services.workspace_service import WorkspaceService

router = APIRouter()


# ── Dependency ────────────────────────────────────────────────────────────────

def get_workspace_service(db: DBSession) -> WorkspaceService:
    """Construct a WorkspaceService for the current request."""
    return WorkspaceService(db)


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=list[WorkspaceResponse],
    status_code=status.HTTP_200_OK,
    summary="List workspaces",
    description="Return all non-deleted workspaces owned by the authenticated user.",
    responses={
        200: {"description": "Workspace list."},
        401: {"description": "Missing or invalid Bearer token."},
    },
)
async def list_workspaces(
    current_user: CurrentUser,
    service: WorkspaceService = Depends(get_workspace_service),
) -> list[WorkspaceResponse]:
    """List all workspaces for the authenticated user."""
    return await service.list_workspaces(current_user)


@router.post(
    "",
    response_model=WorkspaceResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create workspace",
    description="Create a new workspace owned by the authenticated user.",
    responses={
        201: {"description": "Workspace created."},
        401: {"description": "Missing or invalid Bearer token."},
        422: {"description": "Validation error (e.g. blank name)."},
    },
)
async def create_workspace(
    payload: WorkspaceCreate,
    current_user: CurrentUser,
    service: WorkspaceService = Depends(get_workspace_service),
) -> WorkspaceResponse:
    """Create a new workspace."""
    return await service.create_workspace(current_user, payload)


@router.get(
    "/{workspace_id}",
    response_model=WorkspaceResponse,
    status_code=status.HTTP_200_OK,
    summary="Get workspace",
    description="Return a single workspace by id (must be owned by the caller).",
    responses={
        200: {"description": "Workspace found."},
        401: {"description": "Missing or invalid Bearer token."},
        404: {"description": "Workspace not found."},
    },
)
async def get_workspace(
    workspace_id: uuid.UUID,
    current_user: CurrentUser,
    service: WorkspaceService = Depends(get_workspace_service),
) -> WorkspaceResponse:
    """Fetch a single workspace."""
    return await service.get_workspace(current_user, workspace_id)


@router.patch(
    "/{workspace_id}",
    response_model=WorkspaceResponse,
    status_code=status.HTTP_200_OK,
    summary="Update workspace",
    description=(
        "Partially update a workspace. "
        "Only fields included in the request body are updated."
    ),
    responses={
        200: {"description": "Workspace updated."},
        401: {"description": "Missing or invalid Bearer token."},
        404: {"description": "Workspace not found."},
        422: {"description": "Validation error."},
    },
)
async def update_workspace(
    workspace_id: uuid.UUID,
    payload: WorkspaceUpdate,
    current_user: CurrentUser,
    service: WorkspaceService = Depends(get_workspace_service),
) -> WorkspaceResponse:
    """Partially update a workspace."""
    return await service.update_workspace(current_user, workspace_id, payload)


@router.delete(
    "/{workspace_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
    summary="Delete workspace",
    description="Soft-delete a workspace (sets deleted_at). Data is retained for audit.",
    responses={
        204: {"description": "Workspace deleted."},
        401: {"description": "Missing or invalid Bearer token."},
        404: {"description": "Workspace not found."},
    },
)
async def delete_workspace(
    workspace_id: uuid.UUID,
    current_user: CurrentUser,
    service: WorkspaceService = Depends(get_workspace_service),
) -> None:
    """Soft-delete a workspace."""
    await service.delete_workspace(current_user, workspace_id)
