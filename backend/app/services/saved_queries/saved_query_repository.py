import uuid
from typing import Sequence, Optional
from datetime import datetime, timezone
import sqlalchemy as sa
from sqlalchemy import select, or_, desc, asc
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.saved_query import SavedQuery
from app.models.saved_query_run import SavedQueryRun


class SavedQueryRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, db_obj: SavedQuery) -> SavedQuery:
        self.session.add(db_obj)
        await self.session.flush()
        return db_obj

    async def get_by_id(self, query_id: uuid.UUID) -> Optional[SavedQuery]:
        stmt = select(SavedQuery).where(SavedQuery.id == query_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_hash(self, workspace_id: uuid.UUID, sql_hash: str) -> Optional[SavedQuery]:
        stmt = select(SavedQuery).where(
            SavedQuery.workspace_id == workspace_id,
            SavedQuery.sql_hash == sql_hash
        )
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def list_by_workspace(
        self, 
        workspace_id: uuid.UUID, 
        page: int = 1, 
        page_size: int = 20,
        search: Optional[str] = None,
        favorite_only: bool = False,
        pinned_only: bool = False
    ) -> tuple[Sequence[SavedQuery], int]:
        
        stmt = select(SavedQuery).where(SavedQuery.workspace_id == workspace_id)
        count_stmt = select(sa.func.count()).select_from(SavedQuery).where(SavedQuery.workspace_id == workspace_id)
        
        if favorite_only:
            stmt = stmt.where(SavedQuery.is_favorite == True)
            count_stmt = count_stmt.where(SavedQuery.is_favorite == True)
            
        if pinned_only:
            stmt = stmt.where(SavedQuery.is_pinned == True)
            count_stmt = count_stmt.where(SavedQuery.is_pinned == True)
            
        if search:
            search_term = f"%{search}%"
            # Using ILIKE implicitly with .ilike()
            condition = or_(
                SavedQuery.name.ilike(search_term),
                SavedQuery.description.ilike(search_term),
                SavedQuery.user_prompt.ilike(search_term),
                SavedQuery.generated_sql.ilike(search_term),
                SavedQuery.tags.cast(sa.String).ilike(search_term)
            )
            stmt = stmt.where(condition)
            count_stmt = count_stmt.where(condition)

        # Sort: Pinned -> Favorite -> Newest
        stmt = stmt.order_by(
            SavedQuery.is_pinned.desc(),
            SavedQuery.is_favorite.desc(),
            SavedQuery.created_at.desc()
        )
        
        stmt = stmt.offset((page - 1) * page_size).limit(page_size)
        
        total = await self.session.scalar(count_stmt)
        result = await self.session.execute(stmt)
        data = result.scalars().all()
        
        return data, total or 0

    async def update(self, db_obj: SavedQuery) -> SavedQuery:
        self.session.add(db_obj)
        await self.session.flush()
        return db_obj

    async def delete(self, db_obj: SavedQuery) -> None:
        db_obj.deleted_at = datetime.now(timezone.utc)
        self.session.add(db_obj)
        await self.session.flush()

    async def log_execution(self, run_obj: SavedQueryRun) -> SavedQueryRun:
        self.session.add(run_obj)
        await self.session.flush()
        return run_obj
