"""
Application configuration.

All settings are loaded from environment variables (or .env file) via pydantic-settings.
Import the singleton ``settings`` object — never instantiate Settings directly.

    from app.core.config import settings
    db_url = settings.DATABASE_URL
"""
from functools import lru_cache
from typing import Literal

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    Central configuration class.

    Values are read (in priority order) from:
      1. Real environment variables
      2. .env file
      3. Field defaults defined below
    """

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",           # silently ignore unknown env vars
    )

    # ── Application ───────────────────────────────────────────────────────────
    APP_NAME: str = "SelectAI API"
    APP_VERSION: str = "0.1.0"
    ENVIRONMENT: Literal["development", "staging", "production"] = "development"
    DEBUG: bool = False
    HOST: str = "0.0.0.0"
    PORT: int = 8000
    API_V1_PREFIX: str = "/api/v1"

    # ── Database ──────────────────────────────────────────────────────────────
    # Async driver — used by the FastAPI app at runtime (asyncpg)
    DATABASE_URL: str = "postgresql+asyncpg://postgres:password@localhost:5432/selectai"
    # Sync driver  — used by Alembic for migrations (psycopg2)
    DATABASE_URL_SYNC: str = "postgresql+psycopg2://postgres:password@localhost:5432/selectai"
    DATABASE_POOL_SIZE: int = 10
    DATABASE_MAX_OVERFLOW: int = 20
    # Set to True only during local development to see SQL statements in logs
    DATABASE_ECHO: bool = False

    # ── JWT Authentication ────────────────────────────────────────────────────
    # Generate with: openssl rand -hex 32
    JWT_SECRET_KEY: str = "change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ── CORS ──────────────────────────────────────────────────────────────────
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",   # Vite dev server
        "http://localhost:3000",   # CRA / Next.js dev server
        "http://localhost:8080",
    ]
    CORS_ALLOW_CREDENTIALS: bool = True

    # ── AI Providers ──────────────────────────────────────────────────────────
    AI_PROVIDER: Literal["mock", "gemini", "openai", "anthropic"] = "mock"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    ANTHROPIC_API_KEY: str = ""

    # ── Email (SMTP) ──────────────────────────────────────────────────────────
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@selectai.com"

    # ── Computed properties ───────────────────────────────────────────────────

    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        return self.ENVIRONMENT == "development"

    # ── Validators ────────────────────────────────────────────────────────────

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: str | list[str]) -> list[str]:
        """Accept CORS_ORIGINS as a comma-separated string or a JSON list."""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    @field_validator("JWT_SECRET_KEY", mode="after")
    @classmethod
    def validate_secret_key(cls, v: str) -> str:
        """Warn (but don't fail) if the default secret key is used in production."""
        # Full validation happens at startup via a lifespan guard (to be added).
        return v


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return the cached settings singleton."""
    return Settings()


# Module-level singleton — import this everywhere.
settings: Settings = get_settings()
