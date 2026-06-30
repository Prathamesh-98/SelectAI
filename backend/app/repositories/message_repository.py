from typing import Sequence
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.message import Message
from app.schemas.message import MessageCreate


class MessageRepository:
    def __init__(self, session: AsyncSession):
        self.session = session

    async def create(self, obj_in: MessageCreate) -> Message:
        db_obj = Message(
            session_id=obj_in.session_id,
            role=obj_in.role,
            content=obj_in.content,
            has_sql=obj_in.has_sql,
            model_name=obj_in.model_name,
            tokens_used=obj_in.tokens_used,
        )
        self.session.add(db_obj)
        await self.session.flush()
        return db_obj

    async def list_by_session(self, session_id: UUID) -> Sequence[Message]:
        stmt = (
            select(Message)
            .where(Message.session_id == session_id)
            .order_by(Message.created_at.asc())
        )
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def get_by_id(self, message_id: UUID) -> Message | None:
        stmt = select(Message).where(Message.id == message_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()
