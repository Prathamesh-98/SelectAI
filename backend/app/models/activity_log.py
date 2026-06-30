"""
ActivityLog model.

Immutable append-only audit trail. Every significant user action creates
a new row — rows are never updated or deleted (no soft-delete, no updated_at).

The ``details`` JSONB column stores event-specific context, e.g.:
  - dataset_upload  → {filename, file_size_bytes, row_count}
  - query_run       → {sql_preview, execution_time_ms, row_count}
  - member_invite   → {invitee_email, role}
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, UUIDMixin
from app.models.enums import ActivityType

if TYPE_CHECKING:
    from app.models.analysis_session import AnalysisSession
    from app.models.user import User
    from app.models.workspace import Workspace


class ActivityLog(UUIDMixin, Base):
    """
    Immutable audit-log entry for workspace activity.

    Indexes
    -------
    - ``workspace_id``   (feed for a workspace)
    - ``user_id``        (actions taken by a specific user)
    - ``activity_type``  (filter by event kind)
    - ``created_at``     (chronological / time-range queries)

    Note: ``user_id`` is SET NULL when a user is hard-deleted so that
    historical records remain traceable even after account removal.
    """

    __tablename__ = "activity_logs"
    __table_args__ = (
        sa.Index("ix_activity_logs_workspace_id", "workspace_id"),
        sa.Index("ix_activity_logs_user_id", "user_id"),
        sa.Index("ix_activity_logs_activity_type", "activity_type"),
        sa.Index("ix_activity_logs_created_at", "created_at"),
        # Composite: fetch recent activity for a workspace ordered by time
        sa.Index("ix_activity_logs_workspace_created", "workspace_id", "created_at"),
    )

    # ── Foreign keys ──────────────────────────────────────────────────────────
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
    )
    user_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        default=None,
    )
    session_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("analysis_sessions.id", ondelete="SET NULL"),
        nullable=True,
        default=None,
        index=True,
    )

    # ── Event data ────────────────────────────────────────────────────────────
    activity_type: Mapped[ActivityType] = mapped_column(
        sa.Enum(
            ActivityType,
            name="activitytype",
            native_enum=True,
            # Use the enum member's .value (e.g. "workspace_create") when
            # writing to PostgreSQL, not its .name ("WORKSPACE_CREATE").
            values_callable=lambda e: [m.value for m in e],
        ),
        nullable=False,
    )
    description: Mapped[str] = mapped_column(
        sa.String(512),
        nullable=False,
        comment="Human-readable summary of the event",
    )
    details: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
        default=None,
        comment="Structured event-specific context",
    )

    # ── Timestamp (immutable — no updated_at) ─────────────────────────────────
    created_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=sa.func.now(),
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    workspace: Mapped[Workspace] = relationship(
        "Workspace",
        back_populates="activity_logs",
        lazy="select",
    )
    user: Mapped[User | None] = relationship(
        "User",
        back_populates="activity_logs",
        lazy="select",
    )
    session: Mapped[AnalysisSession | None] = relationship(
        "AnalysisSession",
        foreign_keys=[session_id],
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<ActivityLog id={self.id!s:.8}"
            f" type={self.activity_type} workspace={self.workspace_id!s:.8}>"
        )
