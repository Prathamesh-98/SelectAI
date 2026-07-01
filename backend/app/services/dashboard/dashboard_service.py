import uuid
from typing import Tuple, List, Optional
from datetime import datetime, timezone
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status

from app.services.dashboard.dashboard_repository import DashboardRepository
from app.services.workspace_service import WorkspaceService
from app.schemas.dashboard import DashboardCreate, DashboardUpdate, DashboardWidgetCreate, DashboardWidgetUpdate
from app.models.dashboard import Dashboard
from app.models.dashboard_widget import DashboardWidget


class DashboardService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = DashboardRepository(session)
        self.workspace_service = WorkspaceService(session)

    async def _verify_workspace(self, workspace_id: uuid.UUID, user_id_str: str) -> None:
        user_id = uuid.UUID(user_id_str)
        member = await self.workspace_service.get_workspace_member(workspace_id, user_id)
        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found or access denied."
            )

    async def list_dashboards(
        self, workspace_id: uuid.UUID, user_id_str: str, page: int = 1, page_size: int = 50, search: Optional[str] = None
    ) -> Tuple[List[Dashboard], int]:
        await self._verify_workspace(workspace_id, user_id_str)
        return await self.repo.list_by_workspace(workspace_id, page, page_size, search)

    async def get_dashboard(self, id: uuid.UUID, user_id_str: str) -> Dashboard:
        db_obj = await self.repo.get_by_id(id)
        if not db_obj:
            raise HTTPException(status_code=404, detail="Dashboard not found")
        await self._verify_workspace(db_obj.workspace_id, user_id_str)
        return db_obj

    async def create_dashboard(self, obj_in: DashboardCreate, user_id_str: str) -> Dashboard:
        await self._verify_workspace(obj_in.workspace_id, user_id_str)
        data = obj_in.model_dump()
        data["created_by"] = uuid.UUID(user_id_str)
        return await self.repo.create(data)

    async def update_dashboard(self, id: uuid.UUID, obj_in: DashboardUpdate, user_id_str: str) -> Dashboard:
        db_obj = await self.get_dashboard(id, user_id_str)
        return await self.repo.update(db_obj, obj_in.model_dump(exclude_unset=True))

    async def delete_dashboard(self, id: uuid.UUID, user_id_str: str) -> None:
        db_obj = await self.get_dashboard(id, user_id_str)
        db_obj.deleted_at = datetime.now(timezone.utc)
        await self.repo.update(db_obj, {})

    async def add_widget(self, dashboard_id: uuid.UUID, obj_in: DashboardWidgetCreate, user_id_str: str) -> DashboardWidget:
        # Verify access to dashboard
        await self.get_dashboard(dashboard_id, user_id_str)
        return await self.repo.add_widget(dashboard_id, obj_in.model_dump())

    async def update_widget(self, dashboard_id: uuid.UUID, widget_id: uuid.UUID, obj_in: DashboardWidgetUpdate, user_id_str: str) -> DashboardWidget:
        await self.get_dashboard(dashboard_id, user_id_str)
        widget = await self.repo.get_widget(widget_id)
        if not widget or widget.dashboard_id != dashboard_id:
            raise HTTPException(status_code=404, detail="Widget not found")
        return await self.repo.update_widget(widget, obj_in.model_dump(exclude_unset=True))

    async def remove_widget(self, dashboard_id: uuid.UUID, widget_id: uuid.UUID, user_id_str: str) -> None:
        await self.get_dashboard(dashboard_id, user_id_str)
        widget = await self.repo.get_widget(widget_id)
        if not widget or widget.dashboard_id != dashboard_id:
            raise HTTPException(status_code=404, detail="Widget not found")
        await self.repo.delete_widget(widget)
