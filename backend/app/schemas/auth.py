"""
Authentication schemas.

Covers all request bodies and response shapes for the /auth endpoints.
All schemas inherit from BaseSchema (ORM mode enabled, whitespace stripped).
"""
from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import EmailStr, Field, field_validator

from app.schemas.base import BaseSchema


# ─── Requests ─────────────────────────────────────────────────────────────────

class RegisterRequest(BaseSchema):
    """
    Body for POST /auth/register.

    Validates:
      - ``email``    is a properly formed e-mail address (pydantic EmailStr)
      - ``password`` is at least 8 characters and at most 128 characters
      - ``full_name``is non-empty after stripping whitespace
    """

    full_name: str = Field(
        ...,
        min_length=2,
        max_length=100,
        examples=["Jane Smith"],
        description="User's display name (2–100 characters).",
    )
    email: EmailStr = Field(
        ...,
        examples=["jane@example.com"],
        description="Unique e-mail address used for login.",
    )
    password: str = Field(
        ...,
        min_length=8,
        max_length=128,
        examples=["s3cur3P@ssword!"],
        description="Password (8–128 characters).",
    )

    @field_validator("full_name", mode="after")
    @classmethod
    def full_name_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("full_name must not be blank.")
        return v


class LoginRequest(BaseSchema):
    """Body for POST /auth/login."""

    email: EmailStr = Field(..., examples=["jane@example.com"])
    password: str   = Field(..., examples=["s3cur3P@ssword!"])


class RefreshRequest(BaseSchema):
    """Body for POST /auth/refresh."""

    refresh_token: str = Field(
        ...,
        description="A valid, non-expired JWT refresh token.",
    )


# ─── Responses ────────────────────────────────────────────────────────────────

class UserResponse(BaseSchema):
    """
    Public representation of a user account.

    Returned from GET /auth/me and embedded in TokenResponse.
    Never exposes ``hashed_password``.
    """

    id:          UUID
    email:       str
    full_name:   str
    avatar_url:  str | None
    is_active:   bool
    is_verified: bool
    created_at:  datetime
    updated_at:  datetime


class TokenResponse(BaseSchema):
    """
    Response for POST /auth/register and POST /auth/login.

    Both ``access_token`` and ``refresh_token`` are signed JWTs.
    ``token_type`` is always ``"bearer"``.
    """

    access_token:  str
    refresh_token: str
    token_type:    str = "bearer"
    user:          UserResponse


class AccessTokenResponse(BaseSchema):
    """
    Response for POST /auth/refresh.

    Returns only a new access token — the refresh token is unchanged.
    """

    access_token: str
    token_type:   str = "bearer"
