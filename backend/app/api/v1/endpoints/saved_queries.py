from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.saved_query import (
    SavedQueryCreate,
    SavedQueryListResponse,
    SavedQueryResponse,
    SavedQueryUpdate,
)
from app.services.saved_queries.saved_query_service import SavedQueryService

router = APIRouter()


def get_saved_query_service(db: DBSession) -> SavedQueryService:
    return SavedQueryService(db)


@router.get(
    "",
    response_model=SavedQueryListResponse,
    summary="List Saved Queries",
    description="List saved SQL queries for a workspace with pagination, search, and filters."
)
async def list_saved_queries(
    workspace_id: UUID = Query(..., description="ID of the workspace"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search term for names, tags, or SQL"),
    favorite_only: bool = Query(False, description="Filter by favorite status"),
    pinned_only: bool = Query(False, description="Filter by pinned status"),
    current_user: CurrentUser = None,
    service: SavedQueryService = Depends(get_saved_query_service),
):
    queries, total = await service.list_queries(
        workspace_id=workspace_id,
        user_id_str=current_user,
        page=page,
        page_size=page_size,
        search=search,
        favorite_only=favorite_only,
        pinned_only=pinned_only
    )
    return SavedQueryListResponse(
        data=queries,
        total=total,
        page=page,
        page_size=page_size
    )


@router.post(
    "",
    response_model=SavedQueryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create Saved Query",
    description="Saves a generated SQL query to the library. Validates SQL and enforces duplicate detection."
)
async def create_saved_query(
    query_in: SavedQueryCreate,
    current_user: CurrentUser = None,
    service: SavedQueryService = Depends(get_saved_query_service),
):
    return await service.create_saved_query(query_in, current_user)


@router.get(
    "/{id}",
    response_model=SavedQueryResponse,
    summary="Get Saved Query",
    description="Retrieves a specific saved query by ID."
)
async def get_saved_query(
    id: UUID,
    current_user: CurrentUser = None,
    service: SavedQueryService = Depends(get_saved_query_service),
):
    return await service.get_query(id, current_user)


@router.patch(
    "/{id}",
    response_model=SavedQueryResponse,
    summary="Update Saved Query",
    description="Update metadata or SQL. If SQL changes, it is re-validated and version is incremented."
)
async def update_saved_query(
    id: UUID,
    query_in: SavedQueryUpdate,
    current_user: CurrentUser = None,
    service: SavedQueryService = Depends(get_saved_query_service),
):
    return await service.update_saved_query(id, query_in, current_user)


@router.delete(
    "/{id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete Saved Query",
    description="Soft deletes a saved query."
)
async def delete_saved_query(
    id: UUID,
    current_user: CurrentUser = None,
    service: SavedQueryService = Depends(get_saved_query_service),
):
    await service.delete_saved_query(id, current_user)


@router.post(
    "/{id}/execute",
    status_code=status.HTTP_200_OK,
    summary="Execute Saved Query",
    description="Instantly runs a saved SQL query against DuckDB and returns the execution payload with charts and insights."
)
async def execute_saved_query(
    id: UUID,
    current_user: CurrentUser = None,
    service: SavedQueryService = Depends(get_saved_query_service),
):
    # Returns a raw Dict containing execution_result, chart_data, etc. 
    # FastAPI will automatically serialize it to JSON.
    return await service.execute_saved_query(id, current_user)
