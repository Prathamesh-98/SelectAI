// ─── Auth API calls ───────────────────────────────────────────────────────────
// Thin wrappers over the apiClient for each /auth endpoint.
// Components / hooks never call apiClient directly for auth — they use these.
// src/api/auth.ts

import { apiClient } from './client'
import type {
  AccessTokenResponse,
  LoginRequest,
  RefreshRequest,
  RegisterRequest,
  TokenResponse,
  User,
} from '../types/auth'

export const authApi = {
  /**
   * POST /auth/register
   * Create a new account. Returns access token, refresh token, and user.
   */
  register(data: RegisterRequest): Promise<TokenResponse> {
    return apiClient
      .post<TokenResponse>('/auth/register', data)
      .then((r) => r.data)
  },

  /**
   * POST /auth/login
   * Authenticate with email + password. Returns access token, refresh token, and user.
   */
  login(data: LoginRequest): Promise<TokenResponse> {
    return apiClient
      .post<TokenResponse>('/auth/login', data)
      .then((r) => r.data)
  },

  /**
   * GET /auth/me
   * Fetch the currently authenticated user's profile using the stored Bearer token.
   */
  me(): Promise<User> {
    return apiClient
      .get<User>('/auth/me')
      .then((r) => r.data)
  },

  /**
   * POST /auth/refresh
   * Exchange a refresh token for a new access token.
   * Note: the apiClient interceptor calls this automatically on 401.
   * Call this directly only if you need manual control.
   */
  refresh(data: RefreshRequest): Promise<AccessTokenResponse> {
    return apiClient
      .post<AccessTokenResponse>('/auth/refresh', data)
      .then((r) => r.data)
  },
}
