"""
pytest configuration and shared fixtures.

All test files in the ``tests/`` directory automatically have access to
fixtures defined here without any explicit imports.

Fixtures:
    client          — HTTPX async test client for the FastAPI app
    db_session      — isolated async database session per test (rolls back after each test)
    settings        — the application settings object

Usage:
    async def test_health(client: AsyncClient) -> None:
        response = await client.get("/health")
        assert response.status_code == 200
"""
import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import settings
from app.core.dependencies import get_db
from app.database.base import Base
from app.main import app

# ─── Test database ────────────────────────────────────────────────────────────
# Uses a separate test database to avoid polluting the development database.
# Set TEST_DATABASE_URL in your .env or CI environment, or fall back to the
# main URL with a "_test" suffix convention.

TEST_DATABASE_URL = settings.DATABASE_URL.replace(
    "/selectai",
    "/selectai_test",
    1,
)

_test_engine = create_async_engine(TEST_DATABASE_URL, echo=False)
_TestSessionLocal = async_sessionmaker(
    bind=_test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
)


# ─── Session-scoped: create / drop schema once per test session ───────────────

@pytest_asyncio.fixture(scope="session", autouse=True)
async def create_test_schema():
    """Create all tables before the test session and drop them after."""
    async with _test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield
    async with _test_engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    await _test_engine.dispose()


# ─── Function-scoped: transactional rollback per test ─────────────────────────

@pytest_asyncio.fixture()
async def db_session() -> AsyncSession:
    """
    Yield a database session that is rolled back after each test.

    This keeps tests fully isolated without truncating tables.
    """
    async with _TestSessionLocal() as session:
        yield session
        await session.rollback()


# ─── HTTPX async test client ──────────────────────────────────────────────────

@pytest_asyncio.fixture()
async def client(db_session: AsyncSession) -> AsyncClient:
    """
    Yield an HTTPX ``AsyncClient`` wired to the FastAPI app.

    The ``get_db`` dependency is overridden to use the test session
    so that all requests within a test share the same transaction.
    """
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(
        transport=ASGITransport(app=app),
        base_url="http://test",
    ) as ac:
        yield ac

    app.dependency_overrides.clear()


# ─── Settings fixture ─────────────────────────────────────────────────────────

@pytest.fixture()
def app_settings():
    """Return the application settings object."""
    return settings
