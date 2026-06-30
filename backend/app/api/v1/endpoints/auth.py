"""
Authentication router.

Routes:
    POST /auth/register  — create a new account, receive JWT pair
    POST /auth/login     — authenticate, receive JWT pair
    POST /auth/refresh   — exchange refresh token for a new access token
    GET  /auth/me        — return the currently authenticated user

Design contract:
  - Routes are thin: validate input → call service → return response.
  - All business logic lives in AuthService.
  - HTTP exception mapping (domain exceptions → HTTP status codes) is
    done here via the FastAPI exception handlers registered in main.py,
    but each handler also maps exceptions explicitly for clarity.
"""
from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import CurrentUser, DBSession
from app.core.exceptions import ConflictError, NotFoundError, UnauthorizedError
from app.schemas.auth import (
    AccessTokenResponse,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter()


# ── Dependency ────────────────────────────────────────────────────────────────

def get_auth_service(db: DBSession) -> AuthService:
    """Construct an AuthService for the current request."""
    return AuthService(db)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _map_exception(exc: Exception) -> HTTPException:
    """
    Convert a domain exception into a FastAPI HTTPException.

    Centralised here so each route stays a one-liner.
    """
    if isinstance(exc, UnauthorizedError):
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail={"code": exc.code, "message": exc.message},
            headers={"WWW-Authenticate": "Bearer"},
        )
    if isinstance(exc, ConflictError):
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail={"code": exc.code, "message": exc.message},
        )
    if isinstance(exc, NotFoundError):
        return HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail={"code": exc.code, "message": exc.message},
        )
    # Fallback — re-raise unknown exceptions as 500
    return HTTPException(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        detail={"code": "INTERNAL_ERROR", "message": "An unexpected error occurred."},
    )


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new account",
    description=(
        "Create a new SelectAI user account. "
        "Returns an access token and refresh token on success."
    ),
    responses={
        201: {"description": "Account created successfully."},
        409: {"description": "E-mail address already registered."},
        422: {"description": "Validation error (e.g. weak password, invalid email)."},
    },
)
async def register(
    payload: RegisterRequest,
    service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    """Register a new user and return JWT tokens."""
    try:
        return await service.register(payload)
    except (ConflictError, UnauthorizedError) as exc:
        raise _map_exception(exc) from exc


@router.post(
    "/login",
    response_model=TokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Log in",
    description=(
        "Authenticate with e-mail and password. "
        "Returns an access token (short-lived) and a refresh token (long-lived)."
    ),
    responses={
        200: {"description": "Login successful."},
        401: {"description": "Invalid credentials or deactivated account."},
        422: {"description": "Validation error."},
    },
)
async def login(
    payload: LoginRequest,
    service: AuthService = Depends(get_auth_service),
) -> TokenResponse:
    """Authenticate a user and return JWT tokens."""
    try:
        return await service.login(payload)
    except UnauthorizedError as exc:
        raise _map_exception(exc) from exc


@router.post(
    "/refresh",
    response_model=AccessTokenResponse,
    status_code=status.HTTP_200_OK,
    summary="Refresh access token",
    description=(
        "Exchange a valid refresh token for a fresh access token. "
        "The refresh token itself is NOT rotated — store it securely."
    ),
    responses={
        200: {"description": "New access token issued."},
        401: {"description": "Refresh token is invalid, expired, or wrong type."},
        422: {"description": "Validation error."},
    },
)
async def refresh_token(
    payload: RefreshRequest,
    service: AuthService = Depends(get_auth_service),
) -> AccessTokenResponse:
    """Return a fresh access token given a valid refresh token."""
    try:
        return await service.refresh_access_token(payload)
    except UnauthorizedError as exc:
        raise _map_exception(exc) from exc


@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current user",
    description="Return the authenticated user's profile. Requires a valid Bearer token.",
    responses={
        200: {"description": "User profile."},
        401: {"description": "Missing or invalid Bearer token."},
    },
)
async def get_me(
    current_user_id: CurrentUser,
    service: AuthService = Depends(get_auth_service),
) -> UserResponse:
    """Return the currently authenticated user."""
    try:
        return await service.get_current_user(current_user_id)
    except UnauthorizedError as exc:
        raise _map_exception(exc) from exc
