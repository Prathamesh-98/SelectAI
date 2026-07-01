from typing import Any, Dict, List, Optional, Tuple
from uuid import UUID
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi.encoders import jsonable_encoder

from app.models.report import Report

class ReportRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, obj_in: Dict[str, Any]) -> Report:
        db_obj = Report(**obj_in)
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def get_by_id(self, id: UUID) -> Optional[Report]:
        stmt = select(Report).where(Report.id == id, Report.deleted_at.is_(None))
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_workspace(
        self, workspace_id: UUID, page: int = 1, page_size: int = 50, status: Optional[str] = None
    ) -> Tuple[List[Report], int]:
        stmt = select(Report).where(Report.workspace_id == workspace_id, Report.deleted_at.is_(None))
        
        if status:
            stmt = stmt.where(Report.status == status)

        count_stmt = select(func.count()).select_from(stmt.subquery())
        total = await self.session.scalar(count_stmt) or 0

        stmt = stmt.order_by(Report.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
        result = await self.session.execute(stmt)
        reports = list(result.scalars().all())

        return reports, total

    async def update(self, db_obj: Report, obj_in: Dict[str, Any]) -> Report:
        obj_data = jsonable_encoder(db_obj)
        for field in obj_data:
            if field in obj_in:
                setattr(db_obj, field, obj_in[field])
        self.session.add(db_obj)
        await self.session.commit()
        await self.session.refresh(db_obj)
        return db_obj

    async def increment_download(self, id: UUID) -> None:
        db_obj = await self.get_by_id(id)
        if db_obj:
            db_obj.download_count += 1
            await self.session.commit()
