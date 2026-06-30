"""Add workspace_create and workspace_delete to activitytype enum.

Revision ID: b7e1d04af382
Revises: a3f2bc91e547
Create Date: 2026-06-30 17:00:00.000000

The initial migration created the PostgreSQL ``activitytype`` enum with
``workspace_update`` but omitted ``workspace_create`` and ``workspace_delete``.

ALTER TYPE ... ADD VALUE cannot run inside a transaction on PostgreSQL < 12.
On PostgreSQL 12+ it is allowed, but only as the first statement of the
transaction. To keep this portable we execute with AUTOCOMMIT isolation.
"""
from __future__ import annotations

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

# ── Revision identifiers ──────────────────────────────────────────────────────

revision: str = "b7e1d04af382"
down_revision: str = "a3f2bc91e547"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add workspace_create and workspace_delete to the activitytype enum.

    Uses a raw DBAPI connection with AUTOCOMMIT so the ALTER TYPE statement
    runs outside any transaction block, which PostgreSQL requires.
    """
    # Grab a raw DBAPI connection and set autocommit so ALTER TYPE succeeds.
    bind = op.get_bind()
    conn = bind.engine.raw_connection()
    try:
        conn.set_isolation_level(0)  # ISOLATION_LEVEL_AUTOCOMMIT = 0
        cursor = conn.cursor()
        cursor.execute(
            "ALTER TYPE activitytype ADD VALUE IF NOT EXISTS 'workspace_create'"
        )
        cursor.execute(
            "ALTER TYPE activitytype ADD VALUE IF NOT EXISTS 'workspace_delete'"
        )
        cursor.close()
    finally:
        conn.set_isolation_level(1)  # restore READ COMMITTED
        conn.close()


def downgrade() -> None:
    """PostgreSQL does not support removing enum values.

    To fully reverse this migration you would need to recreate the enum type
    from scratch (create new, alter column, drop old, rename new). Since the
    extra values are harmless if unused, the downgrade is intentionally a no-op.
    """
    pass
