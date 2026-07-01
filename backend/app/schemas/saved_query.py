from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class SavedQueryBase(BaseModel):
    name: str = Field(..., max_length=255, description="Name of the saved query")
    description: Optional[str] = Field(None, description="Optional description of the query")
    tags: List[str] = Field(default_factory=list, description="List of tags")
    is_favorite: bool = Field(False, description="Whether the query is marked as favorite")
    is_pinned: bool = Field(False, description="Whether the query is pinned to the top")


class SavedQueryCreate(SavedQueryBase):
    workspace_id: UUID = Field(..., description="Workspace ID")
    session_id: Optional[UUID] = Field(None, description="Original session ID")
    user_prompt: str = Field(..., description="Original user prompt")
    generated_sql: str = Field(..., description="The generated SQL to save")


class SavedQueryUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    tags: Optional[List[str]] = None
    is_favorite: Optional[bool] = None
    is_pinned: Optional[bool] = None
    generated_sql: Optional[str] = Field(None, description="Updating SQL will increment the version")


class SavedQueryResponse(SavedQueryBase):
    id: UUID
    workspace_id: UUID
    session_id: Optional[UUID]
    created_by: Optional[UUID]
    created_by_name: Optional[str] = Field(None, description="Name of the creator")
    
    user_prompt: str
    generated_sql: str
    sql_hash: str
    
    version: int
    execution_count: int
    last_executed: Optional[datetime]
    
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class SavedQueryListResponse(BaseModel):
    data: List[SavedQueryResponse]
    total: int
    page: int
    page_size: int
