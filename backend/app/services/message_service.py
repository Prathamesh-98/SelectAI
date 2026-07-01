from typing import Sequence
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
import uuid

from app.models.enums import ActivityType
from app.models.message import Message
from app.models.activity_log import ActivityLog
from app.repositories.analysis_session_repository import AnalysisSessionRepository
from app.repositories.dataset_repository import DatasetRepository
from app.repositories.message_repository import MessageRepository
from app.repositories.workspace_repository import WorkspaceRepository
from app.schemas.message import MessageCreate
from app.services.ai.ai_service import AIService
from app.services.sql.sql_executor import SQLExecutor
from app.services.charts.chart_recommender import ChartRecommender
from app.models.enums import MessageRole


class MessageService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.message_repo = MessageRepository(session)
        self.session_repo = AnalysisSessionRepository(session)
        self.workspace_repo = WorkspaceRepository(session)
        self.dataset_repo = DatasetRepository(session)

    async def _log(
        self,
        workspace_id: uuid.UUID,
        user_id: uuid.UUID,
        activity_type: ActivityType,
        description: str,
        details: dict | None = None,
    ) -> None:
        """Append an immutable activity-log entry."""
        log = ActivityLog(
            workspace_id=workspace_id,
            user_id=user_id,
            activity_type=activity_type,
            description=description,
            details=details,
        )
        self.session.add(log)

    async def verify_session_access(self, session_id: UUID, user_id_str: str) -> None:
        """Verify the user has access to the workspace that owns the session."""
        analysis_session = await self.session_repo.get_by_id_global(session_id)
        if not analysis_session:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Analysis session not found.",
            )
        # Verify workspace access
        user_id = uuid.UUID(user_id_str)
        workspace = await self.workspace_repo.get_by_id(analysis_session.workspace_id, user_id)
        if workspace is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found or access denied.",
            )

    async def create_message(
        self, session_id: UUID, obj_in: MessageCreate, user_id_str: str
    ) -> Message:
        # Verify ownership
        await self.verify_session_access(session_id, user_id_str)
        
        # Ensure the session_id matches
        if obj_in.session_id != session_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Path session_id does not match body session_id.",
            )
            
        message = await self.message_repo.create(obj_in)
        
        # If the user sent a message, we should generate an AI response
        if obj_in.role == MessageRole.USER:
            # 1. Fetch full context
            analysis_session = await self.session_repo.get_by_id_global(session_id)
            if analysis_session:
                workspace = await self.workspace_repo.get_by_id(analysis_session.workspace_id, uuid.UUID(user_id_str))
                history = await self.message_repo.list_by_session(session_id)
                
                # Fetch actual dataset models
                dataset_ids = {assoc.dataset_id for assoc in analysis_session.session_datasets}
                all_ws_datasets = await self.dataset_repo.list_by_workspace(analysis_session.workspace_id)
                datasets = [ds for ds in all_ws_datasets if ds.id in dataset_ids]
                
                # Let's initialize AIService
                ai_service = AIService(self.session)
                
                assistant_text, generated_sql, validation_error = await ai_service.generate_response(
                    workspace=workspace,
                    analysis_session=analysis_session,
                    datasets=datasets,
                    history=history,
                    user_message=obj_in.content
                )
                
                # 3. Execute SQL automatically if validation passed
                execution_result = None
                execution_time_ms = None
                chart_data = None
                
                if generated_sql and not validation_error:
                    execution_result, execution_time_ms = SQLExecutor.execute(generated_sql, datasets)
                    chart_data = ChartRecommender.generate_chart_data(execution_result)
                
                # Save assistant message
                assistant_msg_in = MessageCreate(
                    session_id=session_id,
                    role=MessageRole.ASSISTANT,
                    content=assistant_text,
                    generated_sql=generated_sql,
                    validation_error=validation_error,
                    execution_result=execution_result,
                    execution_time_ms=execution_time_ms,
                    chart_data=chart_data,
                    has_sql=bool(generated_sql)
                )
                await self.message_repo.create(assistant_msg_in)
        
        if message.has_sql:
            analysis_session = await self.session_repo.get_by_id_global(session_id)
            if analysis_session:
                await self._log(
                    workspace_id=analysis_session.workspace_id,
                    user_id=uuid.UUID(user_id_str),
                    activity_type=ActivityType.QUERY_RUN,
                    description=f"Generated SQL query in session {analysis_session.name}",
                    details={"status": "success"}
                )
                
        return message

    async def list_messages(self, session_id: UUID, user_id_str: str) -> Sequence[Message]:
        await self.verify_session_access(session_id, user_id_str)
        return await self.message_repo.list_by_session(session_id)

    async def get_message(self, message_id: UUID, session_id: UUID, user_id_str: str) -> Message:
        await self.verify_session_access(session_id, user_id_str)
        message = await self.message_repo.get_by_id(message_id)
        if not message or message.session_id != session_id:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Message not found.",
            )
        return message
