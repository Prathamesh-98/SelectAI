"""
CORS middleware configuration.

Call ``setup_cors(app)`` once in the application factory (main.py).
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings


def setup_cors(app: FastAPI) -> None:
    """
    Attach the CORSMiddleware to the FastAPI application.

    In production:
      - Origins are restricted to the explicit whitelist in settings.CORS_ORIGINS
      - Credentials are allowed (required for cookie-based auth flows)
      - Only standard HTTP methods and headers are permitted

    Args:
        app: The FastAPI application instance.
    """
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        allow_credentials=settings.CORS_ALLOW_CREDENTIALS,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=[
            "Authorization",
            "Content-Type",
            "Accept",
            "Origin",
            "X-Requested-With",
            "X-Request-ID",
        ],
        expose_headers=["X-Request-ID"],
        max_age=600,   # preflight cache: 10 minutes
    )
