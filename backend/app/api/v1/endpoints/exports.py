import uuid
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from fastapi.responses import FileResponse

from app.core.dependencies import CurrentUser, DBSession
from app.schemas.report import ExportRequest, ReportResponse, ReportListResponse
from app.services.reports.report_service import ReportService

router = APIRouter()

def get_report_service(session: DBSession) -> ReportService:
    return ReportService(session)

@router.post("/exports/pdf", response_model=ReportResponse, status_code=status.HTTP_202_ACCEPTED)
async def export_pdf(
    request: ExportRequest,
    current_user: CurrentUser = None,
    service: ReportService = Depends(get_report_service),
):
    request.format = "pdf"
    return await service.start_export(request, current_user)

@router.post("/exports/excel", response_model=ReportResponse, status_code=status.HTTP_202_ACCEPTED)
async def export_excel(
    request: ExportRequest,
    current_user: CurrentUser = None,
    service: ReportService = Depends(get_report_service),
):
    request.format = "excel"
    return await service.start_export(request, current_user)

@router.post("/exports/csv", response_model=ReportResponse, status_code=status.HTTP_202_ACCEPTED)
async def export_csv(
    request: ExportRequest,
    current_user: CurrentUser = None,
    service: ReportService = Depends(get_report_service),
):
    request.format = "csv"
    return await service.start_export(request, current_user)

@router.post("/exports/png", response_model=ReportResponse, status_code=status.HTTP_202_ACCEPTED)
async def export_png(
    request: ExportRequest,
    current_user: CurrentUser = None,
    service: ReportService = Depends(get_report_service),
):
    request.format = "png"
    return await service.start_export(request, current_user)

@router.get("/reports", response_model=ReportListResponse)
async def list_reports(
    workspace_id: uuid.UUID,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    report_status: Optional[str] = Query(None, alias="status"),
    current_user: CurrentUser = None,
    service: ReportService = Depends(get_report_service),
):
    reports, total = await service.list_reports(
        workspace_id=workspace_id,
        user_id_str=current_user,
        page=page,
        page_size=page_size,
        status=report_status
    )
    return ReportListResponse(
        data=reports,
        total=total,
        page=page,
        page_size=page_size
    )

@router.get("/reports/{id}", response_model=ReportResponse)
async def get_report(
    id: uuid.UUID,
    current_user: CurrentUser = None,
    service: ReportService = Depends(get_report_service),
):
    return await service.get_report(id, current_user)

@router.delete("/reports/{id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_report(
    id: uuid.UUID,
    current_user: CurrentUser = None,
    service: ReportService = Depends(get_report_service),
):
    await service.delete_report(id, current_user)

@router.get("/reports/{id}/download")
async def download_report(
    id: uuid.UUID,
    current_user: CurrentUser = None,
    service: ReportService = Depends(get_report_service),
):
    file_path, file_name, mime_type = await service.download_report(id, current_user)
    return FileResponse(
        path=file_path,
        filename=file_name,
        media_type=mime_type,
        content_disposition_type="attachment"
    )
