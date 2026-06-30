"""
SavedVisualization model.

Stores chart configurations and data snapshots produced from SQL query results.
A visualisation starts as transient within a session and can be promoted to
the workspace Analytics gallery (is_saved = True).
"""
from __future__ import annotations

import uuid
from typing import TYPE_CHECKING

import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base, TimestampMixin, UUIDMixin
from app.models.enums import VisualizationType

if TYPE_CHECKING:
    from app.models.analysis_session import AnalysisSession
    from app.models.generated_query import GeneratedQuery


class SavedVisualization(UUIDMixin, TimestampMixin, Base):
    """
    A chart or data-table saved within an analysis session.

    Indexes
    -------
    - ``session_id``    (charts for a session)
    - ``is_saved``      (filter Analytics gallery items)
    - ``chart_type``    (filter by chart type)
    """

    __tablename__ = "saved_visualizations"
    __table_args__ = (
        sa.Index("ix_saved_visualizations_session_id", "session_id"),
        sa.Index("ix_saved_visualizations_is_saved", "is_saved"),
    )

    # ── Foreign keys ──────────────────────────────────────────────────────────
    session_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("analysis_sessions.id", ondelete="CASCADE"),
        nullable=False,
    )
    # Optional: links chart back to the query that produced it
    query_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        sa.ForeignKey("generated_queries.id", ondelete="SET NULL"),
        nullable=True,
        default=None,
        index=True,
    )

    # ── Identity ──────────────────────────────────────────────────────────────
    title: Mapped[str] = mapped_column(
        sa.String(255),
        nullable=False,
    )
    chart_type: Mapped[VisualizationType] = mapped_column(
        sa.Enum(
            VisualizationType,
            name="visualizationtype",
            native_enum=True,
            values_callable=lambda e: [m.value for m in e],
        ),
        nullable=False,
        default=VisualizationType.BAR,
        index=True,
    )

    # ── Chart definition ──────────────────────────────────────────────────────
    # Renderer configuration: axis labels, colours, legend, etc.
    config: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
        default=dict,
        server_default=sa.text("'{}'::jsonb"),
        comment="Chart renderer options (axes, colours, labels, legend)",
    )
    # Snapshot of the query result rows used to render the chart
    data: Mapped[list] = mapped_column(
        JSONB,
        nullable=False,
        default=list,
        server_default=sa.text("'[]'::jsonb"),
        comment="Array of data-point objects as returned by the query",
    )

    # ── Gallery promotion ─────────────────────────────────────────────────────
    is_saved: Mapped[bool] = mapped_column(
        sa.Boolean,
        nullable=False,
        default=False,
        server_default=sa.false(),
        comment="True when promoted to the workspace Analytics gallery",
    )

    # ── Relationships ─────────────────────────────────────────────────────────
    session: Mapped[AnalysisSession] = relationship(
        "AnalysisSession",
        back_populates="visualizations",
        lazy="select",
    )
    query: Mapped[GeneratedQuery | None] = relationship(
        "GeneratedQuery",
        back_populates="visualizations",
        lazy="select",
    )

    def __repr__(self) -> str:
        return (
            f"<SavedVisualization id={self.id!s:.8}"
            f" title={self.title!r} type={self.chart_type}>"
        )
