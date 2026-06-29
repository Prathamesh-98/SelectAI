"""
AnalysisSessionDataset model.

Many-to-many join table linking AnalysisSession ↔ Dataset.
A dataset can be attached to multiple sessions; a session can query
multiple datasets.
"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import TYPE_CHECKING

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, UUIDMixin

if TYPE_CHECKING:
    from app.models.analysis_session import AnalysisSession
    from app.models.dataset import Dataset


class AnalysisSessionDataset(UUIDMixin, Base):
    """
    Association record: a Dataset attached to an AnalysisSession.

    Constraints
    -----------
    - UNIQUE ``(session_id, dataset_id)`` — a dataset can only be attached once per session
    - CASCADE DELETE on both FKs

    Indexes
    -------
    - ``session_id``  (list datasets for a session)
    - ``dataset_id``  (list sessions using a dataset)
    """

    __tablename__ = "analysis_session_datasets"
    __table_args__ = (
        sa.UniqueConstraint(
            "session_id",
            "dataset_id",
            name="uq_session_datasets_session_dataset",
        ),
        sa.Index("ix_analysis_session_datasets_session_id", "session_id"),
        sa.Index("ix_analysis_session_datasets_dataset_id", "dataset_id"),
    )

    # ── Foreign keys ──────────────────────────────────────────────────────────
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("analysis_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    dataset_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("datasets.id", ondelete="CASCADE"),
        nullable=False,
    )

    # ── Timestamps ────────────────────────────────────────────────────────────
    added_at: Mapped[datetime] = mapped_column(
        sa.DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        server_default=sa.func.now(),
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    session: Mapped[AnalysisSession] = relationship(
        "AnalysisSession",
        back_populates="session_datasets",
        lazy="select",
    )
    dataset: Mapped[Dataset] = relationship(
        "Dataset",
        back_populates="session_datasets",
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<AnalysisSessionDataset session={self.session_id!s:.8}"
            f" dataset={self.dataset_id!s:.8}>"
        )
