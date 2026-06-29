"""
Request / response logging middleware.

Logs every incoming HTTP request and its response with:
  - HTTP method and path
  - Response status code
  - Request duration in milliseconds
  - A unique X-Request-ID header (echoed back in the response)

Usage is automatic once registered in main.py via ``app.add_middleware(RequestLoggingMiddleware)``.
"""
import time
import uuid

from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint
from starlette.requests import Request
from starlette.responses import Response

from app.core.logging import get_logger

logger = get_logger(__name__)


class RequestLoggingMiddleware(BaseHTTPMiddleware):
    """Log every request with method, path, status code, and duration."""

    async def dispatch(
        self,
        request: Request,
        call_next: RequestResponseEndpoint,
    ) -> Response:
        # Attach a unique request ID for distributed tracing
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id

        start = time.perf_counter()

        response: Response = await call_next(request)

        duration_ms = (time.perf_counter() - start) * 1000

        # Attach request ID to the response so clients can correlate logs
        response.headers["X-Request-ID"] = request_id

        log_level = (
            "warning" if response.status_code >= 400 else
            "error"   if response.status_code >= 500 else
            "info"
        )
        getattr(logger, log_level)(
            "%s %s → %d (%.1fms) [%s]",
            request.method,
            request.url.path,
            response.status_code,
            duration_ms,
            request_id,
        )

        return response
