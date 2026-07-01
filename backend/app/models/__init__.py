"""
SQLAlchemy ORM models package.

All models are imported here so that:
  1. Alembic's ``target_metadata`` (in alembic/env.py) discovers every table.
  2. Relationship back-references resolve correctly at mapper configuration time.

Import order follows FK dependency (parents before children).
"""
from app.models.enums import (  # noqa: F401
    ActivityType,
    DatasetStatus,
    MessageRole,
    SessionStatus,
    VisualizationType,
    WorkspaceRole,
)
from app.models.user import User  # noqa: F401
from app.models.workspace import Workspace  # noqa: F401
from app.models.workspace_member import WorkspaceMember  # noqa: F401
from app.models.dataset import Dataset  # noqa: F401
from app.models.analysis_session import AnalysisSession  # noqa: F401
from app.models.analysis_session_dataset import AnalysisSessionDataset  # noqa: F401
from app.models.message import Message  # noqa: F401
from app.models.generated_query import GeneratedQuery  # noqa: F401
from app.models.saved_visualization import SavedVisualization  # noqa: F401
from app.models.saved_query import SavedQuery  # noqa: F401
from app.models.saved_query_run import SavedQueryRun  # noqa: F401
from app.models.activity_log import ActivityLog  # noqa: F401
from app.models.dashboard import Dashboard  # noqa: F401
from app.models.dashboard_widget import DashboardWidget  # noqa: F401
from app.models.report import Report  # noqa: F401

__all__ = [
    # Enums
    "ActivityType",
    "DatasetStatus",
    "MessageRole",
    "SessionStatus",
    "VisualizationType",
    "WorkspaceRole",
    # Models
    "User",
    "Workspace",
    "WorkspaceMember",
    "Dataset",
    "AnalysisSession",
    "AnalysisSessionDataset",
    "Message",
    "GeneratedQuery",
    "SavedVisualization",
    "SavedQuery",
    "SavedQueryRun",
    "ActivityLog",
    "Dashboard",
    "DashboardWidget",
    "Report",
]
