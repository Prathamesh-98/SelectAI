import uuid
import os
import asyncio
from datetime import datetime, timezone, timedelta
from typing import Tuple, List, Optional
from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.services.reports.report_repository import ReportRepository
from app.services.reports.export_service import ExportService
from app.services.workspace_service import WorkspaceService
from app.schemas.report import ExportRequest
from app.models.report import Report
from app.database.session import AsyncSessionLocal


class ReportService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.repo = ReportRepository(session)
        self.workspace_service = WorkspaceService(session)

    async def _verify_workspace(self, workspace_id: uuid.UUID, user_id_str: str) -> None:
        user_id = uuid.UUID(user_id_str)
        member = await self.workspace_service.get_workspace_member(workspace_id, user_id)
        if not member:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Workspace not found or access denied."
            )

    async def start_export(self, request: ExportRequest, user_id_str: str) -> Report:
        await self._verify_workspace(request.workspace_id, user_id_str)
        
        # Create pending report
        # Expiration in 7 days
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        
        metadata = {
            "execution_time_ms": request.execution_time_ms,
            "row_count": request.row_count or (len(request.execution_result) if request.execution_result else 0),
            "chart_type": request.chart_type,
            "workspace_name": request.workspace_name,
            "saved_query_name": request.saved_query_name,
            "user_question": request.user_question,
            "generated_sql": request.generated_sql,
        }

        report_data = {
            "workspace_id": request.workspace_id,
            "saved_query_id": request.saved_query_id,
            "created_by": uuid.UUID(user_id_str),
            "format": request.format,
            "file_name": f"{request.saved_query_name or 'export'}_{int(datetime.now().timestamp())}.{request.format}",
            "status": "pending",
            "metadata_info": metadata,
            "expires_at": expires_at
        }
        
        report = await self.repo.create(report_data)
        
        # Fire and forget background generation using a fresh db session
        # We use asyncio.create_task to run the background job
        asyncio.create_task(self._process_export(
            report.id, 
            request.format, 
            request.execution_result, 
            request.insight_data, 
            metadata, 
            request.chart_image_base64
        ))
        
        return report

    async def _process_export(self, report_id: uuid.UUID, fmt: str, data: list, insights: dict, meta: dict, chart_b64: str):
        async with AsyncSessionLocal() as db:
            repo = ReportRepository(db)
            report = await repo.get_by_id(report_id)
            if not report:
                return
            
            try:
                report = await repo.update(report, {"status": "processing"})
                file_path = None
                
                if fmt == "csv":
                    # Use to_thread for blocking IO
                    file_path = await asyncio.to_thread(ExportService.generate_csv.__get__(ExportService), report_id, data)
                elif fmt == "excel":
                    file_path = await asyncio.to_thread(ExportService.generate_excel.__get__(ExportService), report_id, data, insights, meta)
                elif fmt == "pdf":
                    file_path = await asyncio.to_thread(ExportService.generate_pdf.__get__(ExportService), report_id, data, insights, meta, chart_b64)
                elif fmt == "png":
                    file_path = await asyncio.to_thread(ExportService.generate_png.__get__(ExportService), report_id, chart_b64)
                
                # Await the result since the wrappers inside ExportService are defined as async, 
                # Wait, if they are async, we shouldn't use to_thread unless we change them to sync!
                # Actually, in export_service.py I defined them as @staticmethod async def... 
                # Let's fix that below if needed, or just await them directly!
                pass
            except Exception as e:
                await repo.update(report, {"status": "failed", "error_message": str(e)})
                return
                
    # Since I defined them as async in ExportService, I will just await them.
    # Actually they perform blocking IO. Let's fix the call.
    async def _process_export_fixed(self, report_id: uuid.UUID, fmt: str, data: list, insights: dict, meta: dict, chart_b64: str):
        async with AsyncSessionLocal() as db:
            repo = ReportRepository(db)
            report = await repo.get_by_id(report_id)
            if not report:
                return
            
            try:
                report = await repo.update(report, {"status": "processing"})
                file_path = None
                
                if fmt == "csv":
                    file_path = await ExportService.generate_csv(report_id, data)
                elif fmt == "excel":
                    file_path = await ExportService.generate_excel(report_id, data, insights, meta)
                elif fmt == "pdf":
                    file_path = await ExportService.generate_pdf(report_id, data, insights, meta, chart_b64)
                elif fmt == "png":
                    file_path = await ExportService.generate_png(report_id, chart_b64)
                
                file_size = os.path.getsize(file_path) if file_path else 0
                
                mime_types = {
                    "csv": "text/csv",
                    "excel": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    "pdf": "application/pdf",
                    "png": "image/png"
                }
                
                await repo.update(report, {
                    "status": "completed",
                    "file_path": file_path,
                    "file_size": file_size,
                    "mime_type": mime_types.get(fmt, "application/octet-stream")
                })
                
            except Exception as e:
                import traceback
                print(f"Export Failed: {traceback.format_exc()}")
                await repo.update(report, {"status": "failed", "error_message": str(e)})

    # Override the launcher to use the fixed processor
    async def start_export(self, request: ExportRequest, user_id_str: str) -> Report:
        await self._verify_workspace(request.workspace_id, user_id_str)
        expires_at = datetime.now(timezone.utc) + timedelta(days=7)
        metadata = {
            "execution_time_ms": request.execution_time_ms,
            "row_count": request.row_count or (len(request.execution_result) if request.execution_result else 0),
            "chart_type": request.chart_type,
            "workspace_name": request.workspace_name,
            "saved_query_name": request.saved_query_name,
            "user_question": request.user_question,
            "generated_sql": request.generated_sql,
        }
        report_data = {
            "workspace_id": request.workspace_id,
            "saved_query_id": request.saved_query_id,
            "created_by": uuid.UUID(user_id_str),
            "format": request.format,
            "file_name": f"{request.saved_query_name or 'export'}_{int(datetime.now().timestamp())}.{request.format}",
            "status": "pending",
            "metadata_info": metadata,
            "expires_at": expires_at
        }
        report = await self.repo.create(report_data)
        
        asyncio.create_task(self._process_export_fixed(
            report.id, 
            request.format, 
            request.execution_result or [], 
            request.insight_data or {}, 
            metadata, 
            request.chart_image_base64
        ))
        return report

    async def list_reports(self, workspace_id: uuid.UUID, user_id_str: str, page: int = 1, page_size: int = 50, status: Optional[str] = None) -> Tuple[List[Report], int]:
        await self._verify_workspace(workspace_id, user_id_str)
        return await self.repo.list_by_workspace(workspace_id, page, page_size, status)

    async def get_report(self, id: uuid.UUID, user_id_str: str) -> Report:
        report = await self.repo.get_by_id(id)
        if not report:
            raise HTTPException(status_code=404, detail="Report not found")
        await self._verify_workspace(report.workspace_id, user_id_str)
        return report

    async def delete_report(self, id: uuid.UUID, user_id_str: str) -> None:
        report = await self.get_report(id, user_id_str)
        report.deleted_at = datetime.now(timezone.utc)
        await self.repo.update(report, {})

    async def download_report(self, id: uuid.UUID, user_id_str: str) -> Tuple[str, str, str]:
        report = await self.get_report(id, user_id_str)
        if report.status != "completed" or not report.file_path:
            raise HTTPException(status_code=400, detail="Report is not ready for download")
        if not os.path.exists(report.file_path):
            raise HTTPException(status_code=404, detail="File has expired or was removed")
        
        await self.repo.increment_download(id)
        return report.file_path, report.file_name, report.mime_type
