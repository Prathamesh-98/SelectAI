"""
AnalysisSession model.

An analysis session groups a conversation with the AI Analyst, generated SQL
queries, and saved visualisations — all scoped to a specific set of datasets
within a workspace.
"""
from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin
from app.models.enums import SessionStatus

if TYPE_CHECKING:
    from app.models.analysis_session_dataset import AnalysisSessionDataset
    from app.models.generated_query import GeneratedQuery
    from app.models.message import Message
    from app.models.saved_visualization import SavedVisualization
    from app.models.user import User
    from app.models.workspace import Workspace


class AnalysisSession(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    """
    A named analytics working session inside a workspace.

    Indexes
    -------
    - ``workspace_id``   (list sessions in a workspace)
    - ``created_by``     (sessions created by a user)
    - ``status``         (filter active vs archived)
    - ``updated_at``     (sort by recency — most recently active first)
    - ``deleted_at``     (inherited)
    """

    __tablename__ = "analysis_sessions"
    __table_args__ = (
        sa.Index("ix_analysis_sessions_workspace_id", "workspace_id"),
        sa.Index("ix_analysis_sessions_updated_at", "updated_at"),
    )

    # ── Ownership ─────────────────────────────────────────────────────────────
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    # ── Identity ──────────────────────────────────────────────────────────────
    name: Mapped[str] = mapped_column(
        sa.String(255),
        nullable=False,
    )
    description: Mapped[str | None] = mapped_column(
        sa.Text,
        nullable=True,
        default=None,
    )
    goal: Mapped[str | None] = mapped_column(
        sa.Text,
        nullable=True,
        default=None,
        comment="User-defined objective or hypothesis for this session",
    )

    # ── Lifecycle ─────────────────────────────────────────────────────────────
    status: Mapped[SessionStatus] = mapped_column(
        sa.Enum(
            SessionStatus,
            name="sessionstatus",
            native_enum=True,
            values_callable=lambda e: [m.value for m in e],
        ),
        nullable=False,
        default=SessionStatus.ACTIVE,
        index=True,
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    workspace: Mapped[Workspace] = relationship(
        "Workspace",
        back_populates="sessions",
        lazy="select",
    )
    created_by_user: Mapped[User] = relationship(
        "User",
        foreign_keys=[created_by],
        lazy="select",
    )
    session_datasets: Mapped[list[AnalysisSessionDataset]] = relationship(
        "AnalysisSessionDataset",
        back_populates="session",
        cascade="all, delete-orphan",
        lazy="select",
    )
    messages: Mapped[list[Message]] = relationship(
        "Message",
        back_populates="session",
        cascade="all, delete-orphan",
        order_by="Message.created_at",
        lazy="select",
    )
    queries: Mapped[list[GeneratedQuery]] = relationship(
        "GeneratedQuery",
        back_populates="session",
        cascade="all, delete-orphan",
        lazy="select",
    )
    visualizations: Mapped[list[SavedVisualization]] = relationship(
        "SavedVisualization",
        back_populates="session",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def __repr__(self) -> str:
        return f"<AnalysisSession id={self.id!s:.8} name={self.name!r} status={self.status}>"
