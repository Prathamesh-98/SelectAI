"""
GeneratedQuery model.

Stores SQL queries produced by the AI Analyst or typed directly by the user.
A query is either transient (runs once, not saved) or promoted to the
Query Library (is_saved = True). Execution results are stored as metadata
rather than rows, keeping the table lean.
"""
from __future__ import annotations

import uuid
from datetime import datetime
from typing import TYPE_CHECKING

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.analysis_session import AnalysisSession
    from app.models.dataset import Dataset
    from app.models.message import Message
    from app.models.saved_visualization import SavedVisualization


class GeneratedQuery(UUIDMixin, TimestampMixin, Base):
    """
    A SQL query generated or saved within an analysis session.

    Indexes
    -------
    - ``session_id``    (queries for a session)
    - ``is_saved``      (filter Library queries)
    - ``ran_at``        (sort by last execution)
    """

    __tablename__ = "generated_queries"
    __table_args__ = (
        sa.Index("ix_generated_queries_session_id", "session_id"),
        sa.Index("ix_generated_queries_is_saved", "is_saved"),
    )

    # ── Foreign keys ──────────────────────────────────────────────────────────
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("analysis_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    # The AI message that produced this query (nullable — may be user-authored)
    message_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("messages.id", ondelete="SET NULL"),
        nullable=True,
        default=None,
        index=True,
    )
    # The dataset this query ran against (nullable — session may have multiple)
    dataset_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("datasets.id", ondelete="SET NULL"),
        nullable=True,
        default=None,
        index=True,
    )

    # ── Query ─────────────────────────────────────────────────────────────────
    title: Mapped[str] = mapped_column(
        sa.String(255),
        nullable=False,
        comment="Human-readable label, e.g. 'Top 5 regions by sales'",
    )
    sql: Mapped[str] = mapped_column(
        sa.Text,
        nullable=False,
    )

    # ── Library promotion ─────────────────────────────────────────────────────
    is_saved: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        default=False,
        server_default=sa.false(),
        comment="True when promoted to the workspace Query Library",
    )

    # ── Execution metadata ────────────────────────────────────────────────────
    ran_at: Mapped[datetime | None] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=True,
        default=None,
        index=True,
    )
    execution_time_ms: Mapped[int | None] = mapped_column(
        sa.Integer,
        nullable=True,
        default=None,
    )
    row_count: Mapped[int | None] = mapped_column(
        sa.Integer,
        nullable=True,
        default=None,
    )
    error_message: Mapped[str | None] = mapped_column(
        sa.Text,
        nullable=True,
        default=None,
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    session: Mapped[AnalysisSession] = relationship(
        "AnalysisSession",
        back_populates="queries",
        lazy="select",
    )
    message: Mapped[Message | None] = relationship(
        "Message",
        back_populates="queries",
        lazy="select",
    )
    dataset: Mapped[Dataset | None] = relationship(
        "Dataset",
        back_populates="queries",
        lazy="select",
    )
    visualizations: Mapped[list[SavedVisualization]] = relationship(
        "SavedVisualization",
        back_populates="query",
        lazy="select",
    )

    def __repr__(self) -> str:
        return f"<GeneratedQuery id={self.id!s:.8} title={self.title!r} saved={self.is_saved}>"
