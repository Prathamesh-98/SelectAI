"""
Structured logging configuration for SelectAI API.

Sets up Python's standard ``logging`` module with a consistent JSON-friendly
format suitable for both local development and production log aggregators
(Datadog, CloudWatch, GCP Logging, etc.).

Usage:
    from app.core.logging import configure_logging, get_logger

    logger = get_logger(__name__)
    logger.info("Dataset uploaded", extra={"dataset_id": str(dataset_id)})
"""
import logging
import sys
from typing import Any


# ─── Constants ────────────────────────────────────────────────────────────────

LOG_FORMAT_DEV = (
    "%(asctime)s | %(levelname)-8s | %(name)s:%(lineno)d | %(message)s"
)

LOG_FORMAT_PROD = (
    '{"time":"%(asctime)s","level":"%(levelname)s","logger":"%(name)s",'
    '"line":%(lineno)d,"message":"%(message)s"}'
)

DATE_FORMAT = "%Y-%m-%dT%H:%M:%S"


# ─── Setup ────────────────────────────────────────────────────────────────────

def configure_logging(debug: bool | None = None) -> None:
    """
    Configure root logger and silence noisy third-party loggers.

    Called once at application startup (inside the lifespan context manager).

    Args:
        debug: Override log level. When None, reads from ``app.core.config.settings``.
    """
    from app.core.config import settings

    is_debug = debug if debug is not None else settings.DEBUG
    level = logging.DEBUG if is_debug else logging.INFO
    fmt = LOG_FORMAT_DEV if is_debug else LOG_FORMAT_PROD

    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(logging.Formatter(fmt=fmt, datefmt=DATE_FORMAT))

    root_logger = logging.getLogger()
    root_logger.setLevel(level)
    root_logger.handlers = [handler]

    # ── Silence noisy third-party loggers ──────────────────────────────────
    _quiet = {
        "uvicorn.access":    logging.WARNING,
        "sqlalchemy.engine": logging.WARNING if not settings.DATABASE_ECHO else logging.INFO,
        "httpx":             logging.WARNING,
        "httpcore":          logging.WARNING,
        "passlib":           logging.WARNING,
    }
    for name, lvl in _quiet.items():
        logging.getLogger(name).setLevel(lvl)


def get_logger(name: str) -> logging.Logger:
    """
    Return a named logger.

    Args:
        name: Typically ``__name__`` of the calling module.

    Returns:
        A ``logging.Logger`` instance.
    """
    return logging.getLogger(name)
