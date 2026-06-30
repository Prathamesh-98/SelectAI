"""
WorkspaceMember model.

Join table that assigns a User to a Workspace with an explicit role.
The combination of (workspace_id, user_id) is unique — a user can hold
only one role per workspace.
"""
from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import WorkspaceRole

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.workspace import Workspace


class WorkspaceMember(UUIDMixin, TimestampMixin, Base):
    """
    Membership record linking a User to a Workspace with a role.

    Constraints
    -----------
    - UNIQUE ``(workspace_id, user_id)`` — one role per user per workspace
    - FK ``workspace_id`` CASCADE DELETE — removed when workspace is deleted
    - FK ``user_id``      CASCADE DELETE — removed when user is deleted

    Indexes
    -------
    - ``workspace_id``  (list members of a workspace)
    - ``user_id``       (list workspaces a user belongs to)
    """

    __tablename__ = "workspace_members"
    __table_args__ = (
        sa.UniqueConstraint("workspace_id", "user_id", name="uq_workspace_members_workspace_user"),
        sa.Index("ix_workspace_members_workspace_id", "workspace_id"),
        sa.Index("ix_workspace_members_user_id", "user_id"),
    )

    # ── Foreign keys ──────────────────────────────────────────────────────────
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
    )

    # ── Role ──────────────────────────────────────────────────────────────────
    role: Mapped[WorkspaceRole] = mapped_column(
        sa.Enum(
            WorkspaceRole,
            name="workspacerole",
            native_enum=True,
            values_callable=lambda e: [m.value for m in e],
        ),
        nullable=False,
        default=WorkspaceRole.MEMBER,
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    workspace: Mapped[Workspace] = relationship(
        "Workspace",
        back_populates="members",
        lazy="select",
    )
    user: Mapped[User] = relationship(
        "User",
        back_populates="workspace_memberships",
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<WorkspaceMember workspace={self.workspace_id!s:.8}"
            f" user={self.user_id!s:.8} role={self.role}>"
        )
