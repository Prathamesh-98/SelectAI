from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID
from sqlalchemy import select, func, or_
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.encoders import jsonable_encoder

from app.models.dashboard import Dashboard
from app.models.dashboard_widget import DashboardWidget


class DashboardRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, obj_in: Dict[str, Any]) -> Dashboard:
        db_obj = Dashboard(**obj_in)
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return await self.get_by_id(db_obj.id)

    async def get_by_id(self, id: UUID) -> Optional[Dashboard]:
        stmt = select(Dashboard).options(selectinload(Dashboard.widgets)).where(Dashboard.id == id, Dashboard.deleted_at.is_(None))
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_workspace(
        self, workspace_id: UUID, page: int = 1, page_size: int = 50, search: Optional[str] = None
    ) -> Tuple[List[Dashboard], int]:
        stmt = select(Dashboard).where(Dashboard.workspace_id == workspace_id, Dashboard.deleted_at.is_(None))
        
        if search:
            stmt = stmt.where(Dashboard.name.ilike(f"%{search}%"))

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.session.scalar(count_stmt) or 0

        stmt = stmt.options(selectinload(Dashboard.widgets)).order_by(Dashboard.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(stmt)
        dashboards = list(result.scalars().all())

        return dashboards, total

    async def update(self, db_obj: Dashboard, obj_in: Dict[str, Any]) -> Dashboard:
        obj_data = jsonable_encoder(db_obj)
        for field in obj_data:
            if field in obj_in:
                setattr(db_obj, field, obj_in[field])
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def add_widget(self, dashboard_id: UUID, obj_in: Dict[str, Any]) -> DashboardWidget:
        db_obj = DashboardWidget(dashboard_id=dashboard_id, **obj_in)
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def get_widget(self, widget_id: UUID) -> Optional[DashboardWidget]:
        stmt = select(DashboardWidget).where(DashboardWidget.id == widget_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def update_widget(self, db_obj: DashboardWidget, obj_in: Dict[str, Any]) -> DashboardWidget:
        obj_data = jsonable_encoder(db_obj)
        for field in obj_data:
            if field in obj_in:
                setattr(db_obj, field, obj_in[field])
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def delete_widget(self, db_obj: DashboardWidget) -> None:
        await self.session.delete(db_obj)
        await self.session.commit()
