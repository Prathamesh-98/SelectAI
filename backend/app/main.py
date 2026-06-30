"""
SelectAI API — Application entry point and factory.

Usage:
    uvicorn app.main:app --reload            # development
    uvicorn app.main:app --host 0.0.0.0 --port 8000  # production
"""
from contextlib import asynccontextmanager
from typing import AsyncGenerator

import uvicorn
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.logging import configure_logging


# ─── Lifespan ─────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Manage application startup and shutdown lifecycle.

    Startup:
      - Configure structured logging
      - Initialise database connection pool
      - Warm up AI client sessions (future)

    Shutdown:
      - Drain and close database connection pool
      - Close AI client sessions (future)
    """
    # ── Startup ───────────────────────────────────────────────────────────────
    configure_logging()

    # TODO: import and initialise the async engine pool
    # from app.database.session import engine
    # async with engine.begin() as conn:
    #     pass  # verify connectivity

    yield

    # ── Shutdown ──────────────────────────────────────────────────────────────
    # TODO: dispose the async engine pool
    # await engine.dispose()


# ─── Application factory ──────────────────────────────────────────────────────

def create_application() -> FastAPI:
    """Create, configure, and return the FastAPI application instance."""
    application = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=(
            "AI-powered data analytics platform. "
            "Upload CSV datasets, query them in natural language, "
            "and receive AI-generated SQL, visualisations, and insights."
        ),
        openapi_url=f"{settings.API_V1_PREFIX}/openapi.json" if settings.DEBUG else None,
        docs_url=f"{settings.API_V1_PREFIX}/docs" if settings.DEBUG else None,
        redoc_url=f"{settings.API_V1_PREFIX}/redoc" if settings.DEBUG else None,
        lifespan=lifespan,
    )

    _register_middleware(application)
    _register_exception_handlers(application)
    _register_routers(application)

    return application


def _register_middleware(app: FastAPI) -> None:
    """
    Register all middleware.

    Order matters: middleware is executed in LIFO order (last registered = first to run).
    Register from lowest to highest priority.
    """
    from app.middleware.cors import setup_cors
    from app.middleware.logging import RequestLoggingMiddleware

    setup_cors(app)
    app.add_middleware(RequestLoggingMiddleware)


def _register_routers(app: FastAPI) -> None:
    """Register all versioned API routers."""
    from app.api.v1.router import api_router

    app.include_router(api_router, prefix=settings.API_V1_PREFIX)


def _register_exception_handlers(app: FastAPI) -> None:
    """
    Map domain exceptions to HTTP responses globally.

    This means every router automatically converts SelectAI domain
    exceptions to the correct HTTP status code + ErrorResponse JSON body
    without any try/except boilerplate in individual route handlers.
    """
    from fastapi import status
    from app.core.exceptions import (
        ConflictError,
        ForbiddenError,
        NotFoundError,
        RateLimitError,
        SelectAIError,
        UnauthorizedError,
        ValidationError,
        BadRequestError,
        FileProcessingError,
    )

    def _err(status_code: int, exc: SelectAIError) -> JSONResponse:
        return JSONResponse(
            status_code=status_code,
            content={"success": False, "code": exc.code, "message": exc.message},
        )

    @app.exception_handler(UnauthorizedError)
    async def _unauthorized(_: Request, exc: UnauthorizedError) -> JSONResponse:
        response = _err(status.HTTP_401_UNAUTHORIZED, exc)
        response.headers["WWW-Authenticate"] = "Bearer"
        return response

    @app.exception_handler(ForbiddenError)
    async def _forbidden(_: Request, exc: ForbiddenError) -> JSONResponse:
        return _err(status.HTTP_403_FORBIDDEN, exc)

    @app.exception_handler(NotFoundError)
    async def _not_found(_: Request, exc: NotFoundError) -> JSONResponse:
        return _err(status.HTTP_404_NOT_FOUND, exc)

    @app.exception_handler(ConflictError)
    async def _conflict(_: Request, exc: ConflictError) -> JSONResponse:
        return _err(status.HTTP_409_CONFLICT, exc)

    @app.exception_handler(ValidationError)
    async def _validation(_: Request, exc: ValidationError) -> JSONResponse:
        return _err(status.HTTP_422_UNPROCESSABLE_ENTITY, exc)

    @app.exception_handler(BadRequestError)
    async def _bad_request(_: Request, exc: BadRequestError) -> JSONResponse:
        return _err(status.HTTP_400_BAD_REQUEST, exc)

    @app.exception_handler(FileProcessingError)
    async def _file_processing(_: Request, exc: FileProcessingError) -> JSONResponse:
        return _err(status.HTTP_400_BAD_REQUEST, exc)

    @app.exception_handler(RateLimitError)
    async def _rate_limit(_: Request, exc: RateLimitError) -> JSONResponse:
        return _err(status.HTTP_429_TOO_MANY_REQUESTS, exc)

    @app.exception_handler(SelectAIError)
    async def _generic(_: Request, exc: SelectAIError) -> JSONResponse:
        return _err(status.HTTP_500_INTERNAL_SERVER_ERROR, exc)


# ─── Application instance ─────────────────────────────────────────────────────

app = create_application()


# ─── Built-in endpoints ───────────────────────────────────────────────────────

@app.get(
    "/health",
    tags=["Health"],
    summary="Health check",
    description="Returns the current health status of the API.",
)
async def health_check() -> JSONResponse:
    return JSONResponse(
        content={
            "status": "ok",
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
        }
    )


@app.get(
    "/",
    tags=["Health"],
    summary="Root",
    include_in_schema=False,
)
async def root() -> JSONResponse:
    return JSONResponse(
        content={
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "docs": f"{settings.API_V1_PREFIX}/docs" if settings.DEBUG else "disabled in production",
        }
    )


# ─── Entry point ──────────────────────────────────────────────────────────────

if __name__ == "__main__":
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level="debug" if settings.DEBUG else "info",
    )
