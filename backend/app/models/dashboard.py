import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.database.base import Base, TimestampMixin, SoftDeleteMixin


class Dashboard(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "dashboards"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    name = Column(String(255), nullable=False)
    description = Column(String(1024), nullable=True)
    layout = Column(JSONB, nullable=False, default=list, server_default='[]')

    # Relationships
    widgets = relationship("DashboardWidget", back_populates="dashboard", cascade="all, delete-orphan")
