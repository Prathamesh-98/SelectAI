import hashlib
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, Any, List

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.saved_query import SavedQuery
from app.models.saved_query_run import SavedQueryRun
from app.schemas.saved_query import SavedQueryCreate, SavedQueryUpdate

from app.services.saved_queries.saved_query_repository import SavedQueryRepository
from app.repositories.workspace_repository import WorkspaceRepository
from app.repositories.analysis_session_repository import AnalysisSessionRepository
from app.repositories.dataset_repository import DatasetRepository

from app.services.sql.sql_validator import SQLValidator
from app.services.sql.sql_executor import SQLExecutor
from app.services.charts.chart_recommender import ChartRecommender
from app.services.insights.insight_builder import InsightBuilder


class SavedQueryService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.sq_repo = SavedQueryRepository(session)
        self.workspace_repo = WorkspaceRepository(session)
        self.session_repo = AnalysisSessionRepository(session)
        self.dataset_repo = DatasetRepository(session)

    def _normalize_tags(self, tags: List[str]) -> List[str]:
        if not tags:
            return []
        cleaned = {tag.strip().lower() for tag in tags if tag.strip()}
        return sorted(list(cleaned))

    def _generate_sql_hash(self, sql: str) -> str:
        # Normalize sql lightly: lowercase and single spaces
        normalized_sql = " ".join(sql.strip().lower().split())
        return hashlib.sha256(normalized_sql.encode('utf-8')).hexdigest()

    async def _verify_workspace(self, workspace_id: uuid.UUID, user_id_str: str):
        workspace = await self.workspace_repo.get_by_id(workspace_id, uuid.UUID(user_id_str))
        if not workspace:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found or access denied."
            )
        return workspace

    async def create_saved_query(self, obj_in: SavedQueryCreate, user_id_str: str) -> SavedQuery:
        await self._verify_workspace(obj_in.workspace_id, user_id_str)
        
        # 1. SQL Validation
        validator = SQLValidator()
        val_result = validator.validate(obj_in.generated_sql)
        if not val_result.is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid SQL: {val_result.error}"
            )
            
        # 2. Duplicate Detection
        sql_hash = self._generate_sql_hash(val_result.normalized_sql)
        existing = await self.sq_repo.get_by_hash(obj_in.workspace_id, sql_hash)
        if existing:
            return existing

        # 3. Build Model
        db_obj = SavedQuery(
            workspace_id=obj_in.workspace_id,
            session_id=obj_in.session_id,
            created_by=uuid.UUID(user_id_str),
            user_prompt=obj_in.user_prompt,
            generated_sql=val_result.normalized_sql,
            sql_hash=sql_hash,
            name=obj_in.name,
            description=obj_in.description,
            tags=self._normalize_tags(obj_in.tags),
            is_favorite=obj_in.is_favorite,
            is_pinned=obj_in.is_pinned
        )
        return await self.sq_repo.create(db_obj)

    async def execute_saved_query(self, query_id: uuid.UUID, user_id_str: str) -> Dict[str, Any]:
        sq = await self.sq_repo.get_by_id(query_id)
        if not sq or sq.is_deleted:
            raise HTTPException(status_code=404, detail="Saved query not found.")
            
        await self._verify_workspace(sq.workspace_id, user_id_str)
        
        # Double check SQL safety
        validator = SQLValidator()
        val_result = validator.validate(sq.generated_sql)
        if not val_result.is_valid:
            # If the database was tampered with
            raise HTTPException(status_code=400, detail="Stored SQL is unsafe or invalid.")
            
        # Fetch datasets for execution context
        datasets = await self.dataset_repo.list_by_workspace(sq.workspace_id)
        
        # Metrics setup
        start_time = time.time()
        row_count = None
        exec_status = "success"
        err_msg = None
        
        result_payload = {}
        
        try:
            # 1. Execute
            execution_result, execution_time_ms = SQLExecutor.execute(val_result.normalized_sql, datasets)
            
            if execution_result and "error" in execution_result:
                exec_status = "failed"
                err_msg = execution_result["error"]
                result_payload["error"] = err_msg
            else:
                row_count = execution_result.get("row_count", 0)
                
                # 2. Charts
                chart_data = ChartRecommender.generate_chart_data(execution_result)
                
                # 3. Insights
                is_execution_empty = not execution_result or row_count == 0
                is_chart_none = chart_data and chart_data.get("chart_type") == "none"
                insight_data = None
                
                if not is_execution_empty and not is_chart_none:
                    insight_data = await InsightBuilder.generate(
                        user_question=sq.user_prompt,
                        generated_sql=val_result.normalized_sql,
                        execution_result=execution_result,
                        chart_data=chart_data
                    )
                    
                result_payload = {
                    "execution_result": execution_result,
                    "execution_time_ms": execution_time_ms,
                    "chart_data": chart_data,
                    "insight_data": insight_data
                }
        except Exception as e:
            exec_status = "failed"
            err_msg = str(e)
            result_payload["error"] = err_msg
            
        # Logging Execution natively inside Postgres
        duration_ms = int((time.time() - start_time) * 1000)
        run_log = SavedQueryRun(
            saved_query_id=sq.id,
            execution_time_ms=duration_ms,
            row_count=row_count,
            status=exec_status,
            error_message=err_msg
        )
        await self.sq_repo.log_execution(run_log)
        
        if exec_status == "success":
            sq.execution_count += 1
            sq.last_executed = datetime.now(timezone.utc)
            await self.sq_repo.update(sq)
            
        return result_payload

    async def update_saved_query(self, query_id: uuid.UUID, obj_in: SavedQueryUpdate, user_id_str: str) -> SavedQuery:
        sq = await self.sq_repo.get_by_id(query_id)
        if not sq or sq.is_deleted:
            raise HTTPException(status_code=404, detail="Saved query not found.")
            
        await self._verify_workspace(sq.workspace_id, user_id_str)
        
        # Apply updates
        if obj_in.name is not None:
            sq.name = obj_in.name
        if obj_in.description is not None:
            sq.description = obj_in.description
        if obj_in.tags is not None:
            sq.tags = self._normalize_tags(obj_in.tags)
        if obj_in.is_favorite is not None:
            sq.is_favorite = obj_in.is_favorite
        if obj_in.is_pinned is not None:
            sq.is_pinned = obj_in.is_pinned
            
        if obj_in.generated_sql is not None and obj_in.generated_sql != sq.generated_sql:
            # Re-validate
            validator = SQLValidator()
            val_result = validator.validate(obj_in.generated_sql)
            if not val_result.is_valid:
                raise HTTPException(status_code=400, detail=f"Invalid SQL: {val_result.error}")
            
            sq.generated_sql = val_result.normalized_sql
            sq.sql_hash = self._generate_sql_hash(val_result.normalized_sql)
            sq.version += 1

        return await self.sq_repo.update(sq)

    async def delete_saved_query(self, query_id: uuid.UUID, user_id_str: str):
        sq = await self.sq_repo.get_by_id(query_id)
        if not sq or sq.is_deleted:
            raise HTTPException(status_code=404, detail="Saved query not found.")
            
        await self._verify_workspace(sq.workspace_id, user_id_str)
        await self.sq_repo.delete(sq)

    async def list_queries(
        self, 
        workspace_id: uuid.UUID, 
        user_id_str: str, 
        page: int = 1, 
        page_size: int = 20,
        search: str | None = None,
        favorite_only: bool = False,
        pinned_only: bool = False
    ):
        await self._verify_workspace(workspace_id, user_id_str)
        return await self.sq_repo.list_by_workspace(
            workspace_id, page, page_size, search, favorite_only, pinned_only
        )

    async def get_query(self, query_id: uuid.UUID, user_id_str: str) -> SavedQuery:
        sq = await self.sq_repo.get_by_id(query_id)
        if not sq or sq.is_deleted:
            raise HTTPException(status_code=404, detail="Saved query not found.")
            
        await self._verify_workspace(sq.workspace_id, user_id_str)
        return sq
