import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.dashboard import (
    DashboardCreate,
    DashboardUpdate,
    DashboardResponse,
    DashboardListResponse,
    DashboardWidgetCreate,
    DashboardWidgetUpdate,
    DashboardWidgetResponse
)
from app.services.dashboard.dashboard_service import DashboardService

router = APIRouter()

def get_dashboard_service(session: DBSession) -> DashboardService:
    return DashboardService(session)

@router.get("", response_model=DashboardListResponse)
async def list_dashboards(
    workspace_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    search: Optional[str] = None,
    current_user: CurrentUser = None,
    service: DashboardService = Depends(get_dashboard_service),
):
    dashboards, total = await service.list_dashboards(
        workspace_id=workspace_id,
        user_id_str=current_user,
        page=page,
        page_size=page_size,
        search=search,
    )
    return DashboardListResponse(
        data=dashboards,
        total=total,
        page=page,
        page_size=page_size
    )

@router.post("", response_model=DashboardResponse, status_code=status.HTTP_201_CREATED)
async def create_dashboard(
    dashboard_in: DashboardCreate,
    current_user: CurrentUser = None,
    service: DashboardService = Depends(get_dashboard_service),
):
    return await service.create_dashboard(dashboard_in, current_user)

@router.get("/{id}", response_model=DashboardResponse)
async def get_dashboard(
    id: uuid.UUID,
    current_user: CurrentUser = None,
    service: DashboardService = Depends(get_dashboard_service),
):
    return await service.get_dashboard(id, current_user)

@router.patch("/{id}", response_model=DashboardResponse)
async def update_dashboard(
    id: uuid.UUID,
    dashboard_in: DashboardUpdate,
    current_user: CurrentUser = None,
    service: DashboardService = Depends(get_dashboard_service),
):
    return await service.update_dashboard(id, dashboard_in, current_user)

@router.delete("/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_dashboard(
    id: uuid.UUID,
    current_user: CurrentUser = None,
    service: DashboardService = Depends(get_dashboard_service),
):
    await service.delete_dashboard(id, current_user)

@router.post("/{id}/widgets", response_model=DashboardWidgetResponse, status_code=status.HTTP_201_CREATED)
async def add_widget(
    id: uuid.UUID,
    widget_in: DashboardWidgetCreate,
    current_user: CurrentUser = None,
    service: DashboardService = Depends(get_dashboard_service),
):
    return await service.add_widget(id, widget_in, current_user)

@router.patch("/{id}/widgets/{widget_id}", response_model=DashboardWidgetResponse)
async def update_widget(
    id: uuid.UUID,
    widget_id: uuid.UUID,
    widget_in: DashboardWidgetUpdate,
    current_user: CurrentUser = None,
    service: DashboardService = Depends(get_dashboard_service),
):
    return await service.update_widget(id, widget_id, widget_in, current_user)

@router.delete("/{id}/widgets/{widget_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_widget(
    id: uuid.UUID,
    widget_id: uuid.UUID,
    current_user: CurrentUser = None,
    service: DashboardService = Depends(get_dashboard_service),
):
    await service.remove_widget(id, widget_id, current_user)
