"""
All SQLAlchemy / Pydantic-compatible Python enums for SelectAI.

Using ``str, enum.Enum`` ensures values are JSON-serialisable and compatible
with both SQLAlchemy native PostgreSQL ENUM types and Pydantic v2 schemas.
"""
import enum


class WorkspaceRole(str, enum.Enum):
    """Role a user holds within a workspace."""
    OWNER  = "owner"
    ADMIN  = "admin"
    MEMBER = "member"
    VIEWER = "viewer"


class DatasetStatus(str, enum.Enum):
    """Processing lifecycle state of an uploaded dataset."""
    PENDING    = "pending"     # uploaded, not yet processed
    PROCESSING = "processing"  # column inference / row count running
    READY      = "ready"       # available for analysis
    ERROR      = "error"       # processing failed


class SessionStatus(str, enum.Enum):
    """Lifecycle state of an analysis session."""
    ACTIVE   = "active"
    ARCHIVED = "archived"


class MessageRole(str, enum.Enum):
    """Speaker role in an AI conversation turn."""
    USER      = "user"
    ASSISTANT = "assistant"
    SYSTEM    = "system"


class VisualizationType(str, enum.Enum):
    """Chart type for a saved visualisation."""
    BAR     = "bar"
    LINE    = "line"
    PIE     = "pie"
    SCATTER = "scatter"
    TABLE   = "table"
    HEATMAP = "heatmap"
    AREA    = "area"


class ActivityType(str, enum.Enum):
    """Discrete event types captured in the activity audit log."""
    DATASET_UPLOAD       = "dataset_upload"
    DATASET_DELETE       = "dataset_delete"
    SESSION_CREATE       = "session_create"
    SESSION_UPDATE       = "session_update"
    SESSION_ARCHIVE      = "session_archive"
    QUERY_RUN            = "query_run"
    QUERY_SAVE           = "query_save"
    VISUALIZATION_SAVE   = "visualization_save"
    MEMBER_INVITE        = "member_invite"
    MEMBER_REMOVE        = "member_remove"
    WORKSPACE_UPDATE     = "workspace_update"
    USER_LOGIN           = "user_login"
