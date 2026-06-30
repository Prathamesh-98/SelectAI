"""
Dataset model.

Represents an uploaded CSV file within a workspace. Processing is
asynchronous — the dataset starts in PENDING state and transitions to
READY once column inference and row counting complete.
"""
from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, SoftDeleteMixin, TimestampMixin, UUIDMixin
from app.models.enums import DatasetStatus

if TYPE_CHECKING:
    from app.models.analysis_session_dataset import AnalysisSessionDataset
    from app.models.generated_query import GeneratedQuery
    from app.models.user import User
    from app.models.workspace import Workspace


class Dataset(UUIDMixin, TimestampMixin, SoftDeleteMixin, Base):
    """
    Uploaded CSV dataset attached to a workspace.

    Indexes
    -------
    - ``workspace_id``          (list all datasets in a workspace)
    - ``uploaded_by``           (find datasets uploaded by a user)
    - ``status``                (filter by processing state)
    - ``deleted_at``            (inherited)
    """

    __tablename__ = "datasets"
    __table_args__ = (
        sa.Index("ix_datasets_workspace_id", "workspace_id"),
        sa.Index("ix_datasets_status", "status"),
    )

    # ── Ownership ─────────────────────────────────────────────────────────────
    workspace_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("workspaces.id", ondelete="CASCADE"),
        nullable=False,
    )
    uploaded_by: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("users.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )

    # ── File metadata ─────────────────────────────────────────────────────────
    name: Mapped[str] = mapped_column(
        sa.String(255),
        nullable=False,
        comment="Original filename as uploaded by the user",
    )
    storage_key: Mapped[str] = mapped_column(
        sa.String(1024),
        nullable=False,
        comment="Object storage path (S3 key, GCS object name, etc.)",
    )
    file_size_bytes: Mapped[int] = mapped_column(
        sa.BigInteger,
        nullable=False,
        default=0,
        comment="File size in bytes",
    )

    # ── Derived metadata (populated after processing) ─────────────────────────
    row_count: Mapped[int | None] = mapped_column(
        sa.Integer,
        nullable=True,
        default=None,
    )
    column_count: Mapped[int | None] = mapped_column(
        sa.Integer,
        nullable=True,
        default=None,
    )
    # JSON array of {name: str, dtype: str, nullable: bool, sample_values: list}
    columns_metadata: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
        default=None,
        comment="Per-column schema inferred during processing",
    )

    # ── Processing state ──────────────────────────────────────────────────────
    status: Mapped[DatasetStatus] = mapped_column(
        sa.Enum(
            DatasetStatus,
            name="datasetstatus",
            native_enum=True,
            values_callable=lambda e: [m.value for m in e],
        ),
        nullable=False,
        default=DatasetStatus.PENDING,
        index=True,
    )
    error_message: Mapped[str | None] = mapped_column(
        sa.Text,
        nullable=True,
        default=None,
        comment="Set when status = 'error'",
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    workspace: Mapped[Workspace] = relationship(
        "Workspace",
        back_populates="datasets",
        lazy="select",
    )
    uploaded_by_user: Mapped[User] = relationship(
        "User",
        foreign_keys=[uploaded_by],
        lazy="select",
    )
    session_datasets: Mapped[list[AnalysisSessionDataset]] = relationship(
        "AnalysisSessionDataset",
        back_populates="dataset",
        cascade="all, delete-orphan",
        lazy="select",
    )
    queries: Mapped[list[GeneratedQuery]] = relationship(
        "GeneratedQuery",
        back_populates="dataset",
        lazy="select",
    )

    def __repr__(self) -> str:
        return f"<Dataset id={self.id!s:.8} name={self.name!r} status={self.status}>"
