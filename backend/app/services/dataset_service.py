"""
Dataset service.

Orchestrates all dataset business logic.
"""
from __future__ import annotations

import io
import os
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
import uuid

import numpy as np
import pandas as pd
from sqlalchemy import delete
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import BadRequestError, FileProcessingError, NotFoundError
from app.models.activity_log import ActivityLog
from app.models.enums import ActivityType, DatasetStatus
from app.repositories.dataset_repository import DatasetRepository
from app.repositories.workspace_repository import WorkspaceRepository


class DatasetService:
    """
    Orchestrates dataset creation, listing, retrieval, deletion, and parsing.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._session = session
        self._repo = DatasetRepository(session)
        self._ws_repo = WorkspaceRepository(session)

    # ── Private helpers ────────────────────────────────────────────────────────

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
        self._session.add(log)

    def _detect_and_decode(self, file_bytes: bytes, filename: str) -> str:
        """
        Attempts to decode CSV file bytes using a set of common encodings.
        """
        if not file_bytes:
            raise BadRequestError("The uploaded CSV file is empty.")

        encodings = ["utf-8", "utf-8-sig", "latin-1", "cp1252"]
        decoded_text = None
        for enc in encodings:
            try:
                decoded_text = file_bytes.decode(enc)
                break
            except UnicodeDecodeError:
                continue

        if decoded_text is None:
            raise BadRequestError(
                f"Could not decode '{filename}' using supported encodings "
                "(UTF-8, UTF-8-SIG, Latin-1, CP1252)."
            )

        if not decoded_text.strip():
            raise BadRequestError("The uploaded CSV file is empty.")

        return decoded_text

    # ── Public methods ─────────────────────────────────────────────────────────

    async def list_datasets(self, user_id_str: str, workspace_id: uuid.UUID) -> list[Any]:
        """
        List all datasets in a workspace owned by the user.
        """
        user_id = uuid.UUID(user_id_str)
        workspace = await self._ws_repo.get_by_id(workspace_id, user_id)
        if workspace is None:
            raise NotFoundError("Workspace", workspace_id)

        return await self._repo.list_by_workspace(workspace_id)

    async def get_dataset(
        self,
        user_id_str: str,
        dataset_id: uuid.UUID,
        workspace_id: uuid.UUID,
    ) -> Any:
        """
        Fetch a single dataset within a workspace owned by the user.
        """
        user_id = uuid.UUID(user_id_str)
        workspace = await self._ws_repo.get_by_id(workspace_id, user_id)
        if workspace is None:
            raise NotFoundError("Workspace", workspace_id)

        dataset = await self._repo.get_by_id(dataset_id, workspace_id)
        if dataset is None:
            raise NotFoundError("Dataset", dataset_id)

        return dataset

    async def upload_dataset(
        self,
        user_id_str: str,
        workspace_id: uuid.UUID,
        filename: str,
        file_bytes: bytes,
    ) -> Any:
        """
        Validate, parse, save, and record a dataset within a workspace.
        """
        user_id = uuid.UUID(user_id_str)

        # ── 1. Check workspace ownership
        workspace = await self._ws_repo.get_by_id(workspace_id, user_id)
        if workspace is None:
            raise NotFoundError("Workspace", workspace_id)

        # ── 2. Validate file extension
        if not filename.lower().endswith(".csv"):
            raise BadRequestError("Only CSV files are allowed.")

        # ── 3. Validate file size (max 20MB)
        MAX_FILE_SIZE = 20 * 1024 * 1024
        if len(file_bytes) > MAX_FILE_SIZE:
            raise BadRequestError("File size exceeds the maximum limit of 20MB.")

        # ── 4. Detect encoding and decode
        decoded_text = self._detect_and_decode(file_bytes, filename)

        # ── 5. Parse using pandas and extract rich metadata
        try:
            df = pd.read_csv(io.StringIO(decoded_text))
        except Exception as e:
            raise FileProcessingError(filename, f"Invalid CSV format: {str(e)}")

        if df.empty or len(df.columns) == 0:
            raise BadRequestError("The uploaded CSV file has no columns or data rows.")

        row_count = len(df)
        column_count = len(df.columns)

        numeric_count = 0
        categorical_count = 0
        columns_list = []

        for col in df.columns:
            dtype_str = str(df[col].dtype)
            if pd.api.types.is_numeric_dtype(df[col]):
                numeric_count += 1
                mapped_dtype = "float" if "float" in dtype_str else "integer"
            elif pd.api.types.is_bool_dtype(df[col]):
                categorical_count += 1
                mapped_dtype = "boolean"
            elif pd.api.types.is_datetime64_any_dtype(df[col]):
                categorical_count += 1
                mapped_dtype = "datetime"
            else:
                categorical_count += 1
                mapped_dtype = "string"

            # up to 3 non-null sample values
            sample_series = df[col].dropna().head(3)
            sample_values = []
            for val in sample_series:
                if hasattr(val, "item"):
                    val = val.item()
                if isinstance(val, (int, float, bool, str)):
                    sample_values.append(val)
                else:
                    sample_values.append(str(val))

            columns_list.append({
                "name": str(col),
                "dtype": mapped_dtype,
                "nullable": bool(df[col].isnull().any()),
                "sample_values": sample_values,
                "missing_count": int(df[col].isnull().sum()),
            })

        columns_metadata = {
            "columns": columns_list,
            "summary": {
                "numeric_count": numeric_count,
                "categorical_count": categorical_count,
            }
        }

        # ── 6. Save file locally using absolute path
        upload_dir = Path("uploads").resolve()
        upload_dir.mkdir(parents=True, exist_ok=True)

        unique_filename = f"{uuid.uuid4()}.csv"
        absolute_path = upload_dir / unique_filename

        try:
            with open(absolute_path, "wb") as f:
                f.write(file_bytes)
        except Exception as e:
            raise FileProcessingError(filename, f"Failed to save file: {str(e)}")

        # ── 7. Insert database record (status starts as READY since we parsed it successfully)
        data = {
            "name": filename,
            "storage_key": str(absolute_path),  # absolute path saved in storage_key
            "file_size_bytes": len(file_bytes),
            "row_count": row_count,
            "column_count": column_count,
            "columns_metadata": columns_metadata,
            "status": DatasetStatus.READY,
        }

        dataset = await self._repo.create(workspace_id, user_id, data)

        # ── 8. Log activity
        await self._log(
            workspace_id=workspace_id,
            user_id=user_id,
            activity_type=ActivityType.DATASET_UPLOAD,
            description=f"Uploaded dataset '{filename}'",
            details={
                "dataset_id": str(dataset.id),
                "dataset_name": filename,
                "row_count": row_count,
                "column_count": column_count,
            },
        )

        return dataset

    async def delete_dataset(
        self,
        user_id_str: str,
        dataset_id: uuid.UUID,
        workspace_id: uuid.UUID,
    ) -> None:
        """
        Delete a dataset: removes db record, file, and activity logs.
        """
        user_id = uuid.UUID(user_id_str)

        # Enforce workspace ownership
        workspace = await self._ws_repo.get_by_id(workspace_id, user_id)
        if workspace is None:
            raise NotFoundError("Workspace", workspace_id)

        dataset = await self._repo.get_by_id(dataset_id, workspace_id)
        if dataset is None:
            raise NotFoundError("Dataset", dataset_id)

        file_path = dataset.storage_key

        # ── 1. Delete matching activity logs
        await self._session.execute(
            delete(ActivityLog).where(
                ActivityLog.workspace_id == workspace_id,
                ActivityLog.details["dataset_id"].astext == str(dataset_id)
            )
        )

        # ── 2. Delete database record
        await self._repo.delete(dataset_id, workspace_id)

        # ── 3. Delete physical file
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
            except Exception:
                pass
