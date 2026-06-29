"""
Workspace model.

A Workspace is the top-level container for all analytics work — datasets,
analysis sessions, saved queries, and visualisations. Every workspace has
exactly one owner (a User) and any number of members.
"""
from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.activity_log import ActivityLog
    from app.models.analysis_session import AnalysisSession
    from app.models.dataset import Dataset
    from app.models.user import User
    from app.models.workspace_member import WorkspaceMember


class Workspace(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    """
    Analytics environment owned by a user.

    Indexes
    -------
    - ``owner_id``    FK index (find all workspaces for a user)
    - ``deleted_at``  (inherited — filter soft-deleted)
    """

    __tablename__ = "workspaces"

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
    # UI accent colour stored as a CSS hex string, e.g. "#3B82F6"
    color: Mapped[str] = mapped_column(
        sa.String(7),
        nullable=False,
        default="#3B82F6",
        server_default="#3B82F6",
    )

    # ── Ownership ─────────────────────────────────────────────────────────────
    owner_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    owner: Mapped[User] = relationship(
        "User",
        back_populates="owned_workspaces",
        foreign_keys=[owner_id],
        lazy="select",
    )
    members: Mapped[list[WorkspaceMember]] = relationship(
        "WorkspaceMember",
        back_populates="workspace",
        cascade="all, delete-orphan",
        lazy="select",
    )
    datasets: Mapped[list[Dataset]] = relationship(
        "Dataset",
        back_populates="workspace",
        cascade="all, delete-orphan",
        lazy="select",
    )
    sessions: Mapped[list[AnalysisSession]] = relationship(
        "AnalysisSession",
        back_populates="workspace",
        cascade="all, delete-orphan",
        lazy="select",
    )
    activity_logs: Mapped[list[ActivityLog]] = relationship(
        "ActivityLog",
        back_populates="workspace",
        cascade="all, delete-orphan",
        lazy="select",
    )

    def __repr__(self) -> str:
        return f"<Workspace id={self.id!s:.8} name={self.name!r}>"
