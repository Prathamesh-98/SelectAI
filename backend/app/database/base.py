"""
SQLAlchemy declarative base and shared column mixins.

All ORM models must inherit from ``Base``.
Use the mixins to add common columns without repeating them everywhere.

Usage:
    from app.database.base import Base, TimestampMixin, UUIDMixin

    class Workspace(UUIDMixin, TimestampMixin, Base):
        __tablename__ = "workspaces"
        name: Mapped[str] = mapped_column(String(255), nullable=False)
"""
import uuid
from datetime import datetime, timezone

from sqlalchemy import DateTime, MetaData, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column

# ─── Naming convention ────────────────────────────────────────────────────────
# Ensures Alembic generates deterministic constraint names across databases.
# Required for reliable --autogenerate migration diffs.

NAMING_CONVENTION: dict[str, str] = {
    "ix": "ix_%(column_0_label)s",
    "uq": "uq_%(table_name)s_%(column_0_name)s",
    "ck": "ck_%(table_name)s_%(constraint_name)s",
    "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
    "pk": "pk_%(table_name)s",
}


# ─── Base class ───────────────────────────────────────────────────────────────

class Base(DeclarativeBase):
    """Shared declarative base. All models inherit from this."""

    metadata = MetaData(naming_convention=NAMING_CONVENTION)


# ─── Mixins ───────────────────────────────────────────────────────────────────

class UUIDMixin:
    """Adds a UUID primary key column named ``id``."""

    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )


class TimestampMixin:
    """
    Adds ``created_at`` and ``updated_at`` columns with automatic management.

    - ``created_at`` is set once at INSERT time via the database default.
    - ``updated_at`` is updated on every UPDATE via an ``onupdate`` trigger.
    """

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
    )

    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        server_default=func.now(),
        onupdate=lambda: datetime.now(timezone.utc),
    )


class SoftDeleteMixin:
    """
    Adds a ``deleted_at`` column for soft-delete support.

    Rows with ``deleted_at IS NOT NULL`` are considered deleted.
    Repositories should filter these out by default.
    """

    deleted_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
        default=None,
        index=True,
    )

    @property
    def is_deleted(self) -> bool:
        return self.deleted_at is not None
