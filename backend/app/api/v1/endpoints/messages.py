from uuid import UUID

from fastapi import APIRouter, Depends, Query, status

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.message import MessageCreate, MessageListResponse, MessageResponse
from app.services.message_service import MessageService

router = APIRouter()

def get_message_service(db: DBSession) -> MessageService:
    return MessageService(db)


@router.get("", response_model=MessageListResponse)
async def list_messages(
    session_id: UUID = Query(..., description="ID of the analysis session"),
    current_user: CurrentUser = None,
    service: MessageService = Depends(get_message_service),
):
    messages = await service.list_messages(session_id, current_user)
    return MessageListResponse(data=messages, total=len(messages))


@router.post("", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def create_message(
    message_in: MessageCreate,
    current_user: CurrentUser = None,
    service: MessageService = Depends(get_message_service),
):
    return await service.create_message(message_in.session_id, message_in, current_user)


@router.get("/{id}", response_model=MessageResponse)
async def get_message(
    id: UUID,
    session_id: UUID = Query(..., description="ID of the analysis session"),
    current_user: CurrentUser = None,
    service: MessageService = Depends(get_message_service),
):
    return await service.get_message(id, session_id, current_user)
