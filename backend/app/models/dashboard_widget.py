import uuid
from sqlalchemy import Column, String, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.database.base import Base, TimestampMixin

class DashboardWidget(Base, TimestampMixin):
    __tablename__ = "dashboard_widgets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    dashboard_id = Column(UUID(as_uuid=True), ForeignKey("dashboards.id", ondelete="CASCADE"), nullable=False, index=True)
    saved_query_id = Column(UUID(as_uuid=True), ForeignKey("saved_queries.id", ondelete="CASCADE"), nullable=False, index=True)
    
    widget_type = Column(String(50), nullable=False) # 'chart', 'table', 'kpi', 'insight'
    title = Column(String(255), nullable=False)
    
    layout = Column(JSONB, nullable=False, default=dict, server_default='{}')
    settings = Column(JSONB, nullable=False, default=dict, server_default='{}')

    # Relationships
    dashboard = relationship("Dashboard", back_populates="widgets")
