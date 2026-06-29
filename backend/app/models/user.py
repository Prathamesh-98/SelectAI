"""
User model.

Represents an authenticated SelectAI user. Soft-delete is used so that
historical records (activity logs, messages) remain traceable after
a user deactivates their account.
"""
from __future__ import annotations

from typing import TYPE_CHECKING

import sqlalchemy as sa
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin

if TYPE_CHECKING:
    from app.models.activity_log import ActivityLog
    from app.models.workspace import Workspace
    from app.models.workspace_member import WorkspaceMember


class User(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    """
    Platform user account.

    Indexes
    -------
    - ``email``        UNIQUE  (auth lookup)
    - ``is_active``            (filter deactivated accounts)
    - ``deleted_at``           (inherited from SoftDeleteMixin)
    """

    __tablename__ = "users"

    # ── Identity ──────────────────────────────────────────────────────────────
    email: Mapped[str] = mapped_column(
        sa.String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    hashed_password: Mapped[str] = mapped_column(
        sa.String(255),
        nullable=False,
    )
    full_name: Mapped[str] = mapped_column(
        sa.String(255),
        nullable=False,
    )
    avatar_url: Mapped[str | None] = mapped_column(
        sa.String(512),
        nullable=True,
        default=None,
    )

    # ── Account flags ─────────────────────────────────────────────────────────
    is_active: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        default=True,
        index=True,
        server_default=sa.true(),
    )
    is_verified: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        default=False,
        server_default=sa.false(),
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    workspace_memberships: Mapped[list[WorkspaceMember]] = relationship(
        "WorkspaceMember",
        back_populates="user",
        cascade="all, delete-orphan",
        lazy="select",
    )
    owned_workspaces: Mapped[list[Workspace]] = relationship(
        "Workspace",
        back_populates="owner",
        foreign_keys="[Workspace.owner_id]",
        lazy="select",
    )
    activity_logs: Mapped[list[ActivityLog]] = relationship(
        "ActivityLog",
        back_populates="user",
        lazy="select",
    )

    def __repr__(self) -> str:
        return f"<User id={self.id!s:.8} email={self.email!r}>"
