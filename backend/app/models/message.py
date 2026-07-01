"""
Message model.

Each row represents one turn in the AI conversation within an AnalysisSession.
Messages are append-only — never edited, never soft-deleted. If a session is
deleted, its messages cascade-delete.
"""
from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import MessageRole

if TYPE_CHECKING:
    from app.models.analysis_session import AnalysisSession
    from app.models.generated_query import GeneratedQuery


class Message(UUIDMixin, TimestampMixin, Base):
    """
    A single conversation turn in an AI Analyst session.

    Indexes
    -------
    - ``session_id``    (fetch full conversation for a session)
    - ``created_at``    (sort messages chronologically)
    - ``role``          (filter user vs assistant turns)
    """

    __tablename__ = "messages"
    __table_args__ = (
        sa.Index("ix_messages_session_id", "session_id"),
        sa.Index("ix_messages_created_at", "created_at"),
    )

    # ── Ownership ─────────────────────────────────────────────────────────────
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("analysis_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )

    # ── Content ───────────────────────────────────────────────────────────────
    role: Mapped[MessageRole] = mapped_column(
        sa.Enum(
            MessageRole,
            name="messagerole",
            native_enum=True,
            values_callable=lambda e: [m.value for m in e],
        ),
        nullable=False,
        index=True,
    )
    content: Mapped[str] = mapped_column(
        sa.Text,
        nullable=False,
        comment="Full message text — may include markdown",
    )

    # ── AI metadata ───────────────────────────────────────────────────────────
    has_sql: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        default=False,
        server_default=sa.false(),
        comment="True when the AI response contains a SQL block",
    )
    generated_sql: Mapped[str | None] = mapped_column(
        sa.Text,
        nullable=True,
        default=None,
        comment="Extracted SQL query from the assistant response",
    )
    model_name: Mapped[str | None] = mapped_column(
        sa.String(100),
        nullable=True,
        default=None,
        comment="AI model identifier, e.g. 'gpt-4o', 'claude-3-5-sonnet-20241022'",
    )
    tokens_used: Mapped[int | None] = mapped_column(
        sa.Integer,
        nullable=True,
        default=None,
        comment="Total tokens consumed (prompt + completion)",
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    session: Mapped[AnalysisSession] = relationship(
        "AnalysisSession",
        back_populates="messages",
        lazy="select",
    )
    queries: Mapped[list[GeneratedQuery]] = relationship(
        "GeneratedQuery",
        back_populates="message",
        lazy="select",
    )

    def __repr__(self) -> str:
        preview = self.content[:40].replace("\n", " ") if self.content else ""
        return f"<Message id={self.id!s:.8} role={self.role} preview={preview!r}>"
