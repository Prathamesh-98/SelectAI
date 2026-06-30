"""
Custom exception hierarchy for SelectAI API.

Raise these exceptions from service/repository layers.
FastAPI exception handlers (to be registered in main.py) will convert them
to the appropriate HTTP responses.

Usage:
    from app.core.exceptions import NotFoundError, ConflictError
    raise NotFoundError("Workspace", workspace_id)
"""
from uuid import UUID


# ─── Base ─────────────────────────────────────────────────────────────────────

class SelectAIError(Exception):
    """Root exception for all application-level errors."""

    def __init__(self, message: str, code: str = "INTERNAL_ERROR") -> None:
        self.message = message
        self.code = code
        super().__init__(message)

    def __repr__(self) -> str:
        return f"{self.__class__.__name__}(code={self.code!r}, message={self.message!r})"


# ─── HTTP-mapped exceptions ────────────────────────────────────────────────────

class NotFoundError(SelectAIError):
    """Raised when a requested resource does not exist (HTTP 404)."""

    def __init__(self, resource: str, identifier: str | int | UUID | None = None) -> None:
        detail = f"{resource} not found"
        if identifier is not None:
            detail = f"{resource} with id '{identifier}' not found"
        super().__init__(message=detail, code="NOT_FOUND")
        self.resource = resource
        self.identifier = identifier


class ConflictError(SelectAIError):
    """Raised when a resource already exists or a conflict is detected (HTTP 409)."""

    def __init__(self, message: str) -> None:
        super().__init__(message=message, code="CONFLICT")


class ValidationError(SelectAIError):
    """Raised for domain-level validation failures (HTTP 422)."""

    def __init__(self, message: str) -> None:
        super().__init__(message=message, code="VALIDATION_ERROR")


class BadRequestError(SelectAIError):
    """Raised for bad request parameters or invalid files (HTTP 400)."""

    def __init__(self, message: str) -> None:
        super().__init__(message=message, code="BAD_REQUEST")


class UnauthorizedError(SelectAIError):
    """Raised when authentication credentials are missing or invalid (HTTP 401)."""

    def __init__(self, message: str = "Not authenticated") -> None:
        super().__init__(message=message, code="UNAUTHORIZED")


class ForbiddenError(SelectAIError):
    """Raised when a user lacks permission for an action (HTTP 403)."""

    def __init__(self, message: str = "Insufficient permissions") -> None:
        super().__init__(message=message, code="FORBIDDEN")


class RateLimitError(SelectAIError):
    """Raised when a rate limit is exceeded (HTTP 429)."""

    def __init__(self, message: str = "Rate limit exceeded. Please try again later.") -> None:
        super().__init__(message=message, code="RATE_LIMIT_EXCEEDED")


# ─── Domain-specific exceptions ───────────────────────────────────────────────

class DatabaseError(SelectAIError):
    """Raised on unexpected database-level failures."""

    def __init__(self, message: str = "A database error occurred") -> None:
        super().__init__(message=message, code="DATABASE_ERROR")


class AIProviderError(SelectAIError):
    """Raised when an AI provider (OpenAI / Anthropic) returns an error."""

    def __init__(self, provider: str, message: str) -> None:
        super().__init__(
            message=f"AI provider '{provider}' error: {message}",
            code="AI_PROVIDER_ERROR",
        )
        self.provider = provider


class FileProcessingError(SelectAIError):
    """Raised when a dataset file cannot be parsed or processed."""

    def __init__(self, filename: str, reason: str) -> None:
        super().__init__(
            message=f"Failed to process '{filename}': {reason}",
            code="FILE_PROCESSING_ERROR",
        )
        self.filename = filename
