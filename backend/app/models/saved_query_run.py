from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, UUIDMixin

if TYPE_CHECKING:
    from app.models.saved_query import SavedQuery


class SavedQueryRun(UUIDMixin, Base):
    """
    Lightweight execution history for Saved Queries.
    """
    __tablename__ = "saved_query_runs"

    saved_query_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("saved_queries.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    
    execution_time_ms: Mapped[int | None] = mapped_column(sa.Integer, nullable=True)
    row_count: Mapped[int | None] = mapped_column(sa.Integer, nullable=True)
    
    status: Mapped[str] = mapped_column(sa.String(50), nullable=False, comment="'success' or 'failed'")
    error_message: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    
    executed_at: Mapped[sa.DateTime] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=False,
        server_default=sa.func.now()
    )

    # Relationships
    saved_query: Mapped[SavedQuery] = relationship(
        "SavedQuery",
        back_populates="runs"
    )
