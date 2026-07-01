from typing import Any, Dict, List, Optional
from uuid import UUID
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class DashboardWidgetBase(BaseModel):
    widget_type: str
    title: str
    saved_query_id: UUID
    layout: Dict[str, Any] = Field(default_factory=dict)
    settings: Dict[str, Any] = Field(default_factory=dict)

class DashboardWidgetCreate(DashboardWidgetBase):
    pass

class DashboardWidgetUpdate(BaseModel):
    title: Optional[str] = None
    layout: Optional[Dict[str, Any]] = None
    settings: Optional[Dict[str, Any]] = None

class DashboardWidgetResponse(DashboardWidgetBase):
    id: UUID
    dashboard_id: UUID
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class DashboardBase(BaseModel):
    name: str
    description: Optional[str] = None
    layout: List[Dict[str, Any]] = Field(default_factory=list)

class DashboardCreate(DashboardBase):
    workspace_id: UUID

class DashboardUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    layout: Optional[List[Dict[str, Any]]] = None

class DashboardResponse(DashboardBase):
    id: UUID
    workspace_id: UUID
    created_by: Optional[UUID] = None
    created_at: datetime
    updated_at: datetime
    widgets: List[DashboardWidgetResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)

class DashboardListResponse(BaseModel):
    data: List[DashboardResponse]
    total: int
    page: int
    page_size: int
