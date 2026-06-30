// ─── Auth type definitions ────────────────────────────────────────────────────
// Mirror the Pydantic schemas from the FastAPI backend exactly.
// src/types/auth.ts

export interface User {
  id:          string
  email:       string
  full_name:   string
  avatar_url:  string | null
  is_active:   boolean
  is_verified: boolean
  created_at:  string
  updated_at:  string
}

export interface TokenResponse {
  access_token:  string
  refresh_token: string
  token_type:    'bearer'
  user:          User
}

export interface AccessTokenResponse {
  access_token: string
  token_type:   'bearer'
}

export interface RegisterRequest {
  full_name: string
  email:     string
  password:  string
}

export interface LoginRequest {
  email:    string
  password: string
}

export interface RefreshRequest {
  refresh_token: string
}

// Shape used in AuthContext
export interface AuthState {
  user:         User | null
  accessToken:  string | null
  isAuth:       boolean
  isLoading:    boolean
}
