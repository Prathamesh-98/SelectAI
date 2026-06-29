"""Initial schema — all tables and enum types.

Revision ID: a3f2bc91e547
Revises: (none — first migration)
Create Date: 2026-06-30 00:00:00.000000

Tables created (in FK-dependency order):
    1.  users
    2.  workspaces
    3.  workspace_members
    4.  datasets
    5.  analysis_sessions
    6.  analysis_session_datasets
    7.  messages
    8.  generated_queries
    9.  saved_visualizations
    10. activity_logs

PostgreSQL ENUM types created:
    workspacerole, datasetstatus, sessionstatus,
    messagerole, visualizationtype, activitytype
"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# ── Revision identifiers ──────────────────────────────────────────────────────

revision: str = "a3f2bc91e547"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


# ── Helpers ───────────────────────────────────────────────────────────────────

def _uuid_pk() -> sa.Column:
    """Standard UUID primary-key column."""
    return sa.Column(
        "id",
        postgresql.UUID(as_uuid=True),
        primary_key=True,
        nullable=False,
    )


def _timestamps() -> list[sa.Column]:
    """created_at + updated_at columns with DB-level defaults."""
    return [
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
    ]


def _deleted_at() -> sa.Column:
    """Soft-delete column."""
    return sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True)


# ── Upgrade ───────────────────────────────────────────────────────────────────

def upgrade() -> None:
    """Apply the initial schema."""

    conn = op.get_bind()

    # ── 1. Create PostgreSQL ENUM types ──────────────────────────────────────
    postgresql.ENUM(
        "owner", "admin", "member", "viewer",
        name="workspacerole",
    ).create(conn, checkfirst=True)

    postgresql.ENUM(
        "pending", "processing", "ready", "error",
        name="datasetstatus",
    ).create(conn, checkfirst=True)

    postgresql.ENUM(
        "active", "archived",
        name="sessionstatus",
    ).create(conn, checkfirst=True)

    postgresql.ENUM(
        "user", "assistant", "system",
        name="messagerole",
    ).create(conn, checkfirst=True)

    postgresql.ENUM(
        "bar", "line", "pie", "scatter", "table", "heatmap", "area",
        name="visualizationtype",
    ).create(conn, checkfirst=True)

    postgresql.ENUM(
        "dataset_upload", "dataset_delete",
        "session_create", "session_update", "session_archive",
        "query_run", "query_save",
        "visualization_save",
        "member_invite", "member_remove",
        "workspace_update",
        "user_login",
        name="activitytype",
    ).create(conn, checkfirst=True)

    # ── 2. users ─────────────────────────────────────────────────────────────
    op.create_table(
        "users",
        _uuid_pk(),
        sa.Column("email",           sa.String(255),  nullable=False),
        sa.Column("hashed_password", sa.String(255),  nullable=False),
        sa.Column("full_name",       sa.String(255),  nullable=False),
        sa.Column("avatar_url",      sa.String(512),  nullable=True),
        sa.Column("is_active",    sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("is_verified",  sa.Boolean(), nullable=False, server_default=sa.false()),
        *_timestamps(),
        _deleted_at(),
    )
    op.create_index("ix_users_id",         "users", ["id"],         unique=False)
    op.create_index("ix_users_email",      "users", ["email"],      unique=True)
    op.create_index("ix_users_is_active",  "users", ["is_active"],  unique=False)
    op.create_index("ix_users_deleted_at", "users", ["deleted_at"], unique=False)

    # ── 3. workspaces ─────────────────────────────────────────────────────────
    op.create_table(
        "workspaces",
        _uuid_pk(),
        sa.Column("owner_id",    postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name",        sa.String(255), nullable=False),
        sa.Column("description", sa.Text,        nullable=True),
        sa.Column("color",       sa.String(7),   nullable=False, server_default="#3B82F6"),
        *_timestamps(),
        _deleted_at(),
        sa.ForeignKeyConstraint(
            ["owner_id"], ["users.id"],
            name="fk_workspaces_owner_id_users",
            ondelete="RESTRICT",
        ),
    )
    op.create_index("ix_workspaces_id",         "workspaces", ["id"],         unique=False)
    op.create_index("ix_workspaces_owner_id",   "workspaces", ["owner_id"],   unique=False)
    op.create_index("ix_workspaces_deleted_at", "workspaces", ["deleted_at"], unique=False)

    # ── 4. workspace_members ──────────────────────────────────────────────────
    op.create_table(
        "workspace_members",
        _uuid_pk(),
        sa.Column("workspace_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id",      postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "role",
            postgresql.ENUM("owner", "admin", "member", "viewer",
                            name="workspacerole", create_type=False),
            nullable=False,
        ),
        *_timestamps(),
        sa.ForeignKeyConstraint(
            ["workspace_id"], ["workspaces.id"],
            name="fk_workspace_members_workspace_id_workspaces",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"],
            name="fk_workspace_members_user_id_users",
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint(
            "workspace_id", "user_id",
            name="uq_workspace_members_workspace_user",
        ),
    )
    op.create_index("ix_workspace_members_id",
                    "workspace_members", ["id"], unique=False)
    op.create_index("ix_workspace_members_workspace_id",
                    "workspace_members", ["workspace_id"], unique=False)
    op.create_index("ix_workspace_members_user_id",
                    "workspace_members", ["user_id"], unique=False)

    # ── 5. datasets ───────────────────────────────────────────────────────────
    op.create_table(
        "datasets",
        _uuid_pk(),
        sa.Column("workspace_id",     postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("uploaded_by",      postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name",             sa.String(255),  nullable=False),
        sa.Column("storage_key",      sa.String(1024), nullable=False),
        sa.Column("file_size_bytes",  sa.BigInteger(), nullable=False, server_default="0"),
        sa.Column("row_count",        sa.Integer(),    nullable=True),
        sa.Column("column_count",     sa.Integer(),    nullable=True),
        sa.Column("columns_metadata", postgresql.JSONB(), nullable=True),
        sa.Column(
            "status",
            postgresql.ENUM("pending", "processing", "ready", "error",
                            name="datasetstatus", create_type=False),
            nullable=False,
            server_default="pending",
        ),
        sa.Column("error_message", sa.Text(), nullable=True),
        *_timestamps(),
        _deleted_at(),
        sa.ForeignKeyConstraint(
            ["workspace_id"], ["workspaces.id"],
            name="fk_datasets_workspace_id_workspaces",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["uploaded_by"], ["users.id"],
            name="fk_datasets_uploaded_by_users",
            ondelete="RESTRICT",
        ),
    )
    op.create_index("ix_datasets_id",           "datasets", ["id"],           unique=False)
    op.create_index("ix_datasets_workspace_id", "datasets", ["workspace_id"], unique=False)
    op.create_index("ix_datasets_uploaded_by",  "datasets", ["uploaded_by"],  unique=False)
    op.create_index("ix_datasets_status",       "datasets", ["status"],       unique=False)
    op.create_index("ix_datasets_deleted_at",   "datasets", ["deleted_at"],   unique=False)

    # ── 6. analysis_sessions ──────────────────────────────────────────────────
    op.create_table(
        "analysis_sessions",
        _uuid_pk(),
        sa.Column("workspace_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("created_by",   postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("name",         sa.String(255), nullable=False),
        sa.Column("description",  sa.Text(),      nullable=True),
        sa.Column("goal",         sa.Text(),      nullable=True),
        sa.Column(
            "status",
            postgresql.ENUM("active", "archived",
                            name="sessionstatus", create_type=False),
            nullable=False,
            server_default="active",
        ),
        *_timestamps(),
        _deleted_at(),
        sa.ForeignKeyConstraint(
            ["workspace_id"], ["workspaces.id"],
            name="fk_analysis_sessions_workspace_id_workspaces",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["created_by"], ["users.id"],
            name="fk_analysis_sessions_created_by_users",
            ondelete="RESTRICT",
        ),
    )
    op.create_index("ix_analysis_sessions_id",
                    "analysis_sessions", ["id"], unique=False)
    op.create_index("ix_analysis_sessions_workspace_id",
                    "analysis_sessions", ["workspace_id"], unique=False)
    op.create_index("ix_analysis_sessions_created_by",
                    "analysis_sessions", ["created_by"], unique=False)
    op.create_index("ix_analysis_sessions_status",
                    "analysis_sessions", ["status"], unique=False)
    op.create_index("ix_analysis_sessions_updated_at",
                    "analysis_sessions", ["updated_at"], unique=False)
    op.create_index("ix_analysis_sessions_deleted_at",
                    "analysis_sessions", ["deleted_at"], unique=False)

    # ── 7. analysis_session_datasets ──────────────────────────────────────────
    op.create_table(
        "analysis_session_datasets",
        _uuid_pk(),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("dataset_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "added_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["session_id"], ["analysis_sessions.id"],
            name="fk_session_datasets_session_id_analysis_sessions",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["dataset_id"], ["datasets.id"],
            name="fk_session_datasets_dataset_id_datasets",
            ondelete="CASCADE",
        ),
        sa.UniqueConstraint(
            "session_id", "dataset_id",
            name="uq_session_datasets_session_dataset",
        ),
    )
    op.create_index("ix_analysis_session_datasets_id",
                    "analysis_session_datasets", ["id"], unique=False)
    op.create_index("ix_analysis_session_datasets_session_id",
                    "analysis_session_datasets", ["session_id"], unique=False)
    op.create_index("ix_analysis_session_datasets_dataset_id",
                    "analysis_session_datasets", ["dataset_id"], unique=False)

    # ── 8. messages ───────────────────────────────────────────────────────────
    op.create_table(
        "messages",
        _uuid_pk(),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column(
            "role",
            postgresql.ENUM("user", "assistant", "system",
                            name="messagerole", create_type=False),
            nullable=False,
        ),
        sa.Column("content",     sa.Text(),     nullable=False),
        sa.Column("has_sql",     sa.Boolean(),  nullable=False, server_default=sa.false()),
        sa.Column("model_name",  sa.String(100), nullable=True),
        sa.Column("tokens_used", sa.Integer(),   nullable=True),
        *_timestamps(),
        sa.ForeignKeyConstraint(
            ["session_id"], ["analysis_sessions.id"],
            name="fk_messages_session_id_analysis_sessions",
            ondelete="CASCADE",
        ),
    )
    op.create_index("ix_messages_id",         "messages", ["id"],         unique=False)
    op.create_index("ix_messages_session_id", "messages", ["session_id"], unique=False)
    op.create_index("ix_messages_created_at", "messages", ["created_at"], unique=False)
    op.create_index("ix_messages_role",       "messages", ["role"],       unique=False)

    # ── 9. generated_queries ──────────────────────────────────────────────────
    op.create_table(
        "generated_queries",
        _uuid_pk(),
        sa.Column("session_id",        postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("message_id",        postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("dataset_id",        postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("title",             sa.String(255), nullable=False),
        sa.Column("sql",               sa.Text(),      nullable=False),
        sa.Column("is_saved",          sa.Boolean(),   nullable=False, server_default=sa.false()),
        sa.Column("ran_at",            sa.DateTime(timezone=True), nullable=True),
        sa.Column("execution_time_ms", sa.Integer(),   nullable=True),
        sa.Column("row_count",         sa.Integer(),   nullable=True),
        sa.Column("error_message",     sa.Text(),      nullable=True),
        *_timestamps(),
        sa.ForeignKeyConstraint(
            ["session_id"], ["analysis_sessions.id"],
            name="fk_generated_queries_session_id_analysis_sessions",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["message_id"], ["messages.id"],
            name="fk_generated_queries_message_id_messages",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["dataset_id"], ["datasets.id"],
            name="fk_generated_queries_dataset_id_datasets",
            ondelete="SET NULL",
        ),
    )
    op.create_index("ix_generated_queries_id",
                    "generated_queries", ["id"], unique=False)
    op.create_index("ix_generated_queries_session_id",
                    "generated_queries", ["session_id"], unique=False)
    op.create_index("ix_generated_queries_message_id",
                    "generated_queries", ["message_id"], unique=False)
    op.create_index("ix_generated_queries_dataset_id",
                    "generated_queries", ["dataset_id"], unique=False)
    op.create_index("ix_generated_queries_is_saved",
                    "generated_queries", ["is_saved"], unique=False)
    op.create_index("ix_generated_queries_ran_at",
                    "generated_queries", ["ran_at"], unique=False)

    # ── 10. saved_visualizations ──────────────────────────────────────────────
    op.create_table(
        "saved_visualizations",
        _uuid_pk(),
        sa.Column("session_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("query_id",   postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("title",      sa.String(255), nullable=False),
        sa.Column(
            "chart_type",
            postgresql.ENUM("bar", "line", "pie", "scatter", "table", "heatmap", "area",
                            name="visualizationtype", create_type=False),
            nullable=False,
        ),
        sa.Column("config",   postgresql.JSONB(), nullable=False,
                  server_default=sa.text("'{}'::jsonb")),
        sa.Column("data",     postgresql.JSONB(), nullable=False,
                  server_default=sa.text("'[]'::jsonb")),
        sa.Column("is_saved", sa.Boolean(), nullable=False, server_default=sa.false()),
        *_timestamps(),
        sa.ForeignKeyConstraint(
            ["session_id"], ["analysis_sessions.id"],
            name="fk_saved_visualizations_session_id_analysis_sessions",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["query_id"], ["generated_queries.id"],
            name="fk_saved_visualizations_query_id_generated_queries",
            ondelete="SET NULL",
        ),
    )
    op.create_index("ix_saved_visualizations_id",
                    "saved_visualizations", ["id"], unique=False)
    op.create_index("ix_saved_visualizations_session_id",
                    "saved_visualizations", ["session_id"], unique=False)
    op.create_index("ix_saved_visualizations_query_id",
                    "saved_visualizations", ["query_id"], unique=False)
    op.create_index("ix_saved_visualizations_is_saved",
                    "saved_visualizations", ["is_saved"], unique=False)
    op.create_index("ix_saved_visualizations_chart_type",
                    "saved_visualizations", ["chart_type"], unique=False)

    # ── 11. activity_logs ─────────────────────────────────────────────────────
    op.create_table(
        "activity_logs",
        _uuid_pk(),
        sa.Column("workspace_id", postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column("user_id",      postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column("session_id",   postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column(
            "activity_type",
            postgresql.ENUM(
                "dataset_upload", "dataset_delete",
                "session_create", "session_update", "session_archive",
                "query_run", "query_save",
                "visualization_save",
                "member_invite", "member_remove",
                "workspace_update",
                "user_login",
                name="activitytype", create_type=False,
            ),
            nullable=False,
        ),
        sa.Column("description", sa.String(512),    nullable=False),
        sa.Column("details",     postgresql.JSONB(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.text("now()"),
        ),
        sa.ForeignKeyConstraint(
            ["workspace_id"], ["workspaces.id"],
            name="fk_activity_logs_workspace_id_workspaces",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"], ["users.id"],
            name="fk_activity_logs_user_id_users",
            ondelete="SET NULL",
        ),
        sa.ForeignKeyConstraint(
            ["session_id"], ["analysis_sessions.id"],
            name="fk_activity_logs_session_id_analysis_sessions",
            ondelete="SET NULL",
        ),
    )
    op.create_index("ix_activity_logs_id",
                    "activity_logs", ["id"], unique=False)
    op.create_index("ix_activity_logs_workspace_id",
                    "activity_logs", ["workspace_id"], unique=False)
    op.create_index("ix_activity_logs_user_id",
                    "activity_logs", ["user_id"], unique=False)
    op.create_index("ix_activity_logs_session_id",
                    "activity_logs", ["session_id"], unique=False)
    op.create_index("ix_activity_logs_activity_type",
                    "activity_logs", ["activity_type"], unique=False)
    op.create_index("ix_activity_logs_created_at",
                    "activity_logs", ["created_at"], unique=False)
    # Composite index — recent activity feed for a workspace
    op.create_index("ix_activity_logs_workspace_created",
                    "activity_logs", ["workspace_id", "created_at"], unique=False)


# ── Downgrade ─────────────────────────────────────────────────────────────────

def downgrade() -> None:
    """Revert the initial schema — drop all tables then all enum types."""

    conn = op.get_bind()

    # ── Drop tables in reverse FK-dependency order ────────────────────────────
    op.drop_table("activity_logs")
    op.drop_table("saved_visualizations")
    op.drop_table("generated_queries")
    op.drop_table("messages")
    op.drop_table("analysis_session_datasets")
    op.drop_table("analysis_sessions")
    op.drop_table("datasets")
    op.drop_table("workspace_members")
    op.drop_table("workspaces")
    op.drop_table("users")

    # ── Drop PostgreSQL ENUM types ────────────────────────────────────────────
    postgresql.ENUM(name="activitytype").drop(conn, checkfirst=True)
    postgresql.ENUM(name="visualizationtype").drop(conn, checkfirst=True)
    postgresql.ENUM(name="messagerole").drop(conn, checkfirst=True)
    postgresql.ENUM(name="sessionstatus").drop(conn, checkfirst=True)
    postgresql.ENUM(name="datasetstatus").drop(conn, checkfirst=True)
    postgresql.ENUM(name="workspacerole").drop(conn, checkfirst=True)
