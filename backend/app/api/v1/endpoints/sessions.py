"""
AnalysisSession router.

Routes:
    GET    /sessions        — List all sessions in a workspace (owner-scoped)
    POST   /sessions        — Create a new session
    GET    /sessions/{id}   — Fetch a single session
    PATCH  /sessions/{id}   — Update a session
    DELETE /sessions/{id}   — Soft delete a session
"""
from __future__ import annotations

import uuid
from typing import Any

from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.analysis_session import AnalysisSessionCreate, AnalysisSessionResponse, AnalysisSessionUpdate
from app.schemas.base import APIResponse
from app.services.analysis_session_service import AnalysisSessionService

router = APIRouter()


# ── Dependency ────────────────────────────────────────────────────────────────

def get_analysis_session_service(db: DBSession) -> AnalysisSessionService:
    """Construct an AnalysisSessionService for the current request."""
    return AnalysisSessionService(db)


# ── Routes ────────────────────────────────────────────────────────────────────

@router.get(
    "",
    response_model=APIResponse[list[AnalysisSessionResponse]],
    status_code=status.HTTP_200_OK,
    summary="List sessions",
    description="List all non-deleted sessions in a workspace.",
)
async def list_sessions(
    workspace_id: uuid.UUID = Query(..., description="The workspace ID."),
    current_user: CurrentUser = None,
    service: AnalysisSessionService = Depends(get_analysis_session_service),
) -> APIResponse[list[AnalysisSessionResponse]]:
    """List sessions in a workspace."""
    sessions = await service.list_sessions(current_user, workspace_id)
    return APIResponse(
        success=True,
        message="Sessions retrieved successfully.",
        data=[AnalysisSessionResponse.model_validate(s) for s in sessions],
    )


@router.post(
    "",
    response_model=APIResponse[AnalysisSessionResponse],
    status_code=status.HTTP_201_CREATED,
    summary="Create session",
    description="Create an analysis session and attach datasets.",
)
async def create_session(
    payload: AnalysisSessionCreate,
    current_user: CurrentUser = None,
    service: AnalysisSessionService = Depends(get_analysis_session_service),
) -> APIResponse[AnalysisSessionResponse]:
    """Create an analysis session."""
    session_data = await service.create_session(
        user_id_str=current_user,
        workspace_id=payload.workspace_id,
        name=payload.name,
        description=payload.description,
        goal=payload.goal,
        dataset_ids=payload.dataset_ids,
    )
    return APIResponse(
        success=True,
        message="Session created successfully.",
        data=AnalysisSessionResponse.model_validate(session_data),
    )


@router.get(
    "/{session_id}",
    response_model=APIResponse[AnalysisSessionResponse],
    status_code=status.HTTP_200_OK,
    summary="Get session",
    description="Fetch single session metadata.",
)
async def get_session(
    session_id: uuid.UUID,
    workspace_id: uuid.UUID = Query(..., description="Workspace ID."),
    current_user: CurrentUser = None,
    service: AnalysisSessionService = Depends(get_analysis_session_service),
) -> APIResponse[AnalysisSessionResponse]:
    """Fetch single session."""
    session_data = await service.get_session(current_user, session_id, workspace_id)
    return APIResponse(
        success=True,
        message="Session retrieved successfully.",
        data=AnalysisSessionResponse.model_validate(session_data),
    )


@router.patch(
    "/{session_id}",
    response_model=APIResponse[AnalysisSessionResponse],
    status_code=status.HTTP_200_OK,
    summary="Update session",
    description="Update a session's metadata.",
)
async def update_session(
    session_id: uuid.UUID,
    payload: AnalysisSessionUpdate,
    workspace_id: uuid.UUID = Query(..., description="Workspace ID."),
    current_user: CurrentUser = None,
    service: AnalysisSessionService = Depends(get_analysis_session_service),
) -> APIResponse[AnalysisSessionResponse]:
    """Update a session."""
    patch_data = payload.model_dump(exclude_unset=True)
    session_data = await service.update_session(
        user_id_str=current_user,
        session_id=session_id,
        workspace_id=workspace_id,
        patch_data=patch_data,
    )
    return APIResponse(
        success=True,
        message="Session updated successfully.",
        data=AnalysisSessionResponse.model_validate(session_data),
    )


@router.delete(
    "/{session_id}",
    response_model=APIResponse[dict[str, Any]],
    status_code=status.HTTP_200_OK,
    summary="Delete session",
    description="Soft-delete a session.",
)
async def delete_session(
    session_id: uuid.UUID,
    workspace_id: uuid.UUID = Query(..., description="Workspace ID."),
    current_user: CurrentUser = None,
    service: AnalysisSessionService = Depends(get_analysis_session_service),
) -> APIResponse[dict[str, Any]]:
    """Delete a session."""
    await service.delete_session(current_user, session_id, workspace_id)
    return APIResponse(
        success=True,
        message="Session deleted successfully.",
        data={"id": str(session_id)},
    )
