// ─── useAuth hook (re-export) ─────────────────────────────────────────────────
// Convenience re-export so consumers don't need to know where the context lives.
// src/auth/useAuth.ts
//
// Usage:
//   import { useAuth } from '../auth/useAuth'
//   const { user, login, logout, isAuth, isLoading } = useAuth()

export { useAuth } from './AuthContext'
