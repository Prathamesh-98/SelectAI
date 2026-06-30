// ─── Authentication context ───────────────────────────────────────────────────
// Provides auth state and actions to the entire React tree.
// Now uses useNavigate() from React Router instead of window.history.pushState.
// src/auth/AuthContext.tsx

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { authApi }      from '../api/auth'
import { tokenService } from '../services/tokenService'
import type { AuthState, LoginRequest, RegisterRequest, User } from '../types/auth'

// ── Context shape ─────────────────────────────────────────────────────────────

interface AuthContextValue extends AuthState {
  login(data: LoginRequest):       Promise<void>
  register(data: RegisterRequest): Promise<void>
  logout():                        void
  /** Force-refresh the user profile from /auth/me */
  refreshUser():                   Promise<void>
}

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  const [user,        setUser]        = useState<User | null>(null)
  const [accessToken, setAccessToken] = useState<string | null>(null)
  const [isLoading,   setIsLoading]   = useState(true)   // true until bootstrap completes
  const mountedRef = useRef(true)

  // ── Computed derived state ──────────────────────────────────────────────────
  const isAuth = Boolean(user && accessToken)

  // ── Bootstrap: restore session on first load ───────────────────────────────
  useEffect(() => {
    mountedRef.current = true

    const bootstrap = async () => {
      const storedToken = tokenService.getAccess()
      if (!storedToken) {
        setIsLoading(false)
        return
      }

      try {
        // Validate the token by calling /auth/me
        // If expired, the apiClient interceptor will auto-refresh first
        const me = await authApi.me()
        if (mountedRef.current) {
          setUser(me)
          setAccessToken(storedToken)
        }
      } catch {
        // Token invalid and refresh also failed — clear everything
        tokenService.clear()
      } finally {
        if (mountedRef.current) setIsLoading(false)
      }
    }

    bootstrap()

    return () => { mountedRef.current = false }
  }, [])

  // ── Listen for force-logout events from the axios interceptor ─────────────
  useEffect(() => {
    const handle = () => {
      setUser(null)
      setAccessToken(null)
      navigate('/login', { replace: true })
    }
    window.addEventListener('selectai:logout', handle)
    return () => window.removeEventListener('selectai:logout', handle)
  }, [navigate])

  // ── Actions ────────────────────────────────────────────────────────────────

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authApi.login(data)
    tokenService.save(response.access_token, response.refresh_token)
    setAccessToken(response.access_token)
    setUser(response.user)
    navigate('/dashboard', { replace: true })
  }, [navigate])

  const register = useCallback(async (data: RegisterRequest) => {
    const response = await authApi.register(data)
    tokenService.save(response.access_token, response.refresh_token)
    setAccessToken(response.access_token)
    setUser(response.user)
    navigate('/dashboard', { replace: true })
  }, [navigate])

  const logout = useCallback(() => {
    tokenService.clear()
    setUser(null)
    setAccessToken(null)
    navigate('/login', { replace: true })
  }, [navigate])

  const refreshUser = useCallback(async () => {
    try {
      const me = await authApi.me()
      setUser(me)
    } catch {
      logout()
    }
  }, [logout])

  // ── Value ──────────────────────────────────────────────────────────────────

  const value: AuthContextValue = {
    user,
    accessToken,
    isAuth,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth() must be used inside <AuthProvider>.')
  }
  return ctx
}

export { AuthContext }
