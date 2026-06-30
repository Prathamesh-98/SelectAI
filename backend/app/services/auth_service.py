"""
Authentication service.

Contains all business logic for user registration, login, token refresh,
and fetching the current authenticated user.

Architecture contract:
  - This service calls the UserRepository for DB access.
  - This service calls security.py helpers for hashing and JWT work.
  - Routes call this service and nothing else.
  - No SQLAlchemy statements here — all DB access goes through the repository.
"""
from __future__ import annotations

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.exceptions import ConflictError, NotFoundError, UnauthorizedError
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    AccessTokenResponse,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
)


class AuthService:
    """
    Orchestrates authentication flows.

    Constructor
    -----------
    session : AsyncSession
        The per-request session injected by ``get_db()``.
        Passed straight through to ``UserRepository``.
    """

    def __init__(self, session: AsyncSession) -> None:
        self._repo = UserRepository(session)

    # ── Private helpers ────────────────────────────────────────────────────────

    @staticmethod
    def _build_token_response(user: User) -> TokenResponse:
        """
        Create a full ``TokenResponse`` (access + refresh + user) for a given user.
        """
        return TokenResponse(
            access_token=create_access_token(subject=str(user.id)),
            refresh_token=create_refresh_token(subject=str(user.id)),
            user=UserResponse.model_validate(user),
        )

    # ── Public methods ─────────────────────────────────────────────────────────

    async def register(self, payload: RegisterRequest) -> TokenResponse:
        """
        Create a new user account and return a JWT pair.

        Steps
        -----
        1. Check that the e-mail is not already registered (HTTP 409 if taken).
        2. Hash the plain-text password with bcrypt.
        3. Persist the new user via the repository.
        4. Issue access + refresh tokens.

        Args:
            payload: Validated ``RegisterRequest`` schema.

        Returns:
            ``TokenResponse`` containing access token, refresh token, and user data.

        Raises:
            ConflictError: If the e-mail is already associated with an account.
        """
        if await self._repo.email_exists(payload.email):
            raise ConflictError(
                f"An account with e-mail '{payload.email}' already exists."
            )

        user = await self._repo.create(
            {
                "email":           payload.email,
                "hashed_password": hash_password(payload.password),
                "full_name":       payload.full_name,
            }
        )

        return self._build_token_response(user)

    async def login(self, payload: LoginRequest) -> TokenResponse:
        """
        Authenticate an existing user and return a JWT pair.

        Steps
        -----
        1. Look up the user by e-mail (HTTP 401 if not found — avoids e-mail enumeration).
        2. Reject deactivated accounts (HTTP 401).
        3. Verify the password against the stored bcrypt hash.
        4. Issue access + refresh tokens.

        Args:
            payload: Validated ``LoginRequest`` schema.

        Returns:
            ``TokenResponse`` containing access token, refresh token, and user data.

        Raises:
            UnauthorizedError: If credentials are invalid or the account is inactive.
        """
        _BAD_CREDS = "Invalid e-mail or password."   # generic — avoids enumeration

        user = await self._repo.get_by_email(payload.email)
        if user is None:
            raise UnauthorizedError(_BAD_CREDS)

        if not user.is_active:
            raise UnauthorizedError("This account has been deactivated.")

        if not verify_password(payload.password, user.hashed_password):
            raise UnauthorizedError(_BAD_CREDS)

        return self._build_token_response(user)

    async def refresh_access_token(self, payload: RefreshRequest) -> AccessTokenResponse:
        """
        Exchange a valid refresh token for a new access token.

        Steps
        -----
        1. Decode + validate the refresh token (UnauthorizedError if invalid/expired).
        2. Verify the token type claim is ``"refresh"`` (reject access tokens).
        3. Fetch the user from the database (ensures account still exists and is active).
        4. Issue a new access token (refresh token is unchanged).

        Args:
            payload: ``RefreshRequest`` containing the refresh JWT string.

        Returns:
            ``AccessTokenResponse`` with a fresh access token.

        Raises:
            UnauthorizedError: If the token is invalid, expired, wrong type,
                               or the user no longer exists / is deactivated.
        """
        token_data = decode_token(payload.refresh_token)

        # Reject non-refresh tokens (e.g., someone passing an access token here)
        if token_data.get("type") != "refresh":
            raise UnauthorizedError("Expected a refresh token, not an access token.")

        raw_user_id: str | None = token_data.get("sub")
        if not raw_user_id:
            raise UnauthorizedError("Token payload is malformed.")

        try:
            user_id = uuid.UUID(raw_user_id)
        except ValueError:
            raise UnauthorizedError("Token subject is not a valid UUID.")

        user = await self._repo.get_by_id(user_id)
        if user is None:
            raise UnauthorizedError("User account not found or has been deleted.")
        if not user.is_active:
            raise UnauthorizedError("This account has been deactivated.")

        return AccessTokenResponse(
            access_token=create_access_token(subject=str(user.id)),
        )

    async def get_current_user(self, user_id_str: str) -> UserResponse:
        """
        Resolve the currently authenticated user from their UUID string.

        Called by the ``GET /auth/me`` route after ``get_current_user_id``
        extracts the subject from the bearer token.

        Args:
            user_id_str: UUID string from the JWT ``sub`` claim.

        Returns:
            ``UserResponse`` (public fields only, no password hash).

        Raises:
            UnauthorizedError: If the UUID is malformed, the user no longer
                               exists, or the account is deactivated.
        """
        try:
            user_id = uuid.UUID(user_id_str)
        except ValueError:
            raise UnauthorizedError("Token subject is not a valid UUID.")

        user = await self._repo.get_by_id(user_id)
        if user is None:
            raise UnauthorizedError("User account not found or has been deleted.")
        if not user.is_active:
            raise UnauthorizedError("This account has been deactivated.")

        return UserResponse.model_validate(user)
