from __future__ import annotations

import uuid
from typing import TYPE_CHECKING, Any

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.saved_query_run import SavedQueryRun


class SavedQuery(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    """
    A persistent saved SQL query for the Query Library.
    """
    __tablename__ = "saved_queries"

    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("analysis_sessions.id", ondelete="SET NULL"),
        index=True,
        nullable=True,
        comment="The analysis session where this query was originally generated"
    )
    
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
    )

    name: Mapped[str] = mapped_column(sa.String(255), nullable=False)
    description: Mapped[str | None] = mapped_column(sa.Text, nullable=True)
    
    user_prompt: Mapped[str] = mapped_column(sa.Text, nullable=False, comment="The original natural language question")
    generated_sql: Mapped[str] = mapped_column(sa.Text, nullable=False)
    sql_hash: Mapped[str] = mapped_column(
        sa.String(64), 
        nullable=False, 
        index=True, 
        comment="SHA-256 hash of the normalized SQL for duplicate detection"
    )
    
    tags: Mapped[list[str]] = mapped_column(
        JSONB,
        nullable=False,
        server_default="[]"
    )
    
    version: Mapped[int] = mapped_column(
        sa.Integer,
        nullable=False,
        default=1,
        server_default="1"
    )

    is_favorite: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        default=False,
        server_default="false"
    )
    
    is_pinned: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        default=False,
        server_default="false"
    )

    execution_count: Mapped[int] = mapped_column(
        sa.Integer,
        nullable=False,
        default=0,
        server_default="0"
    )
    
    last_executed: Mapped[sa.DateTime | None] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=True
    )

    # Relationships
    runs: Mapped[list[SavedQueryRun]] = relationship(
        "SavedQueryRun",
        back_populates="saved_query",
        cascade="all, delete-orphan"
    )

    __table_args__ = (
        sa.UniqueConstraint("workspace_id", "sql_hash", name="uq_workspace_sql_hash"),
    )
