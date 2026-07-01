from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from app.models.enums import MessageRole


class MessageBase(BaseModel):
    content: str = Field(..., description="Full message text")
    has_sql: bool = Field(False, description="True when the response contains a SQL block")
    generated_sql: Optional[str] = Field(None, description="Extracted SQL query from the assistant response")
    model_name: Optional[str] = Field(None, description="AI model identifier")
    tokens_used: Optional[int] = Field(None, description="Total tokens consumed")


class MessageCreate(MessageBase):
    session_id: UUID = Field(..., description="ID of the analysis session")
    role: MessageRole = Field(..., description="Role of the sender")


class MessageResponse(MessageBase):
    id: UUID
    session_id: UUID
    role: MessageRole
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class MessageListResponse(BaseModel):
    data: List[MessageResponse]
    total: int
