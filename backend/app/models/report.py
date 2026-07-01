import uuid
from sqlalchemy import Column, String, ForeignKey, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.database.base import Base, TimestampMixin, SoftDeleteMixin

class Report(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    workspace_id = Column(UUID(as_uuid=True), ForeignKey("workspaces.id", ondelete="CASCADE"), nullable=False, index=True)
    saved_query_id = Column(UUID(as_uuid=True), ForeignKey("saved_queries.id", ondelete="SET NULL"), nullable=True, index=True)
    created_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    format = Column(String(50), nullable=False) # 'pdf', 'excel', 'csv', 'png'
    file_name = Column(String(255), nullable=False)
    file_path = Column(String(1024), nullable=True) # Set when generation is done
    file_size = Column(Integer, nullable=True)
    mime_type = Column(String(100), nullable=True)

    status = Column(String(50), nullable=False, default="pending") # pending, processing, completed, failed
    error_message = Column(String(1024), nullable=True)
    download_count = Column(Integer, default=0, nullable=False)

    metadata_info = Column(JSONB, nullable=False, default=dict, server_default='{}')
    expires_at = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    workspace = relationship("Workspace")
    saved_query = relationship("SavedQuery")
