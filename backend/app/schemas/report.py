from typing import Any, Dict, List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class ExportRequest(BaseModel):
    workspace_id: UUID
    saved_query_id: Optional[UUID] = None
    format: str # 'pdf', 'excel', 'csv', 'png'
    execution_result: Optional[List[Dict[str, Any]]] = None
    insight_data: Optional[Dict[str, Any]] = None
    chart_image_base64: Optional[str] = None
    
    # Metadata
    execution_time_ms: Optional[float] = None
    row_count: Optional[int] = None
    chart_type: Optional[str] = None
    workspace_name: Optional[str] = None
    saved_query_name: Optional[str] = None
    user_question: Optional[str] = None
    generated_sql: Optional[str] = None

class ReportResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    saved_query_id: Optional[UUID] = None
    created_by: Optional[UUID] = None
    format: str
    file_name: str
    status: str
    error_message: Optional[str] = None
    download_count: int
    metadata_info: Dict[str, Any]
    created_at: datetime
    expires_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class ReportListResponse(BaseModel):
    data: List[ReportResponse]
    total: int
    page: int
    page_size: int
