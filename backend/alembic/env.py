"""
Alembic migration environment.

Configured for SelectAI's synchronous migration workflow:
  - Online mode: connects to PostgreSQL via psycopg2 (DATABASE_URL_SYNC)
  - Offline mode: generates SQL without a live connection
  - Auto-imports all models so Alembic can detect schema changes

To create a new migration:
    alembic revision --autogenerate -m "add_workspaces_table"

To apply all pending migrations:
    alembic upgrade head
"""
import logging
from logging.config import fileConfig

from sqlalchemy import engine_from_config, pool

from alembic import context

# ── Load Alembic config ───────────────────────────────────────────────────────
alembic_config = context.config

# Set up logging from alembic.ini [loggers] section
if alembic_config.config_file_name is not None:
    fileConfig(alembic_config.config_file_name)

logger = logging.getLogger("alembic.env")

# ── Override sqlalchemy.url with the value from app settings ─────────────────
# This ensures migrations always run against the same database the app uses.
try:
    from app.core.config import settings as app_settings
    alembic_config.set_main_option("sqlalchemy.url", app_settings.DATABASE_URL_SYNC)
    logger.info("Using DATABASE_URL_SYNC from app settings.")
except Exception as exc:
    logger.warning(
        "Could not load app settings (%s). Falling back to alembic.ini sqlalchemy.url.", exc
    )

# ── Import all models — this ensures Alembic sees every table when generating migrations.
# The package __init__.py re-exports everything in FK-dependency order.
import app.models  # noqa: F401  — side-effect import registers all mappers
from app.database.base import Base  # noqa: F401, E402 — must run after config override


target_metadata = Base.metadata


# ── Migration runners ─────────────────────────────────────────────────────────

def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.

    Generates SQL scripts without establishing a database connection.
    Useful for review, auditing, or applying migrations manually.
    """
    url = alembic_config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,             # detect column type changes
        compare_server_default=True,   # detect server_default changes
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.

    Establishes a real database connection and applies pending migrations.
    """
    connectable = engine_from_config(
        alembic_config.get_section(alembic_config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,       # don't pool connections in migration scripts
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
