// ─── Axios HTTP client ────────────────────────────────────────────────────────
// A pre-configured axios instance that:
//   1. Points at the FastAPI backend (from VITE_API_BASE_URL)
//   2. Attaches the Bearer access token to every request
//   3. Intercepts 401 responses, silently refreshes the access token,
//      and retries the original request once.
//   4. Clears tokens and redirects to login if refresh also fails.
// src/api/client.ts

import axios from 'axios'
import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios'
import { tokenService } from '../services/tokenService'

// ── Base URL from Vite env ────────────────────────────────────────────────────
const BASE_URL = import.meta.env.VITE_API_BASE_URL as string

if (!BASE_URL) {
  console.error('[SelectAI] VITE_API_BASE_URL is not set. Check your .env file.')
}

// ── Axios instance ────────────────────────────────────────────────────────────
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15_000,
})

// ── Request interceptor: attach Bearer token ──────────────────────────────────
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = tokenService.getAccess()
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// ── Flag to prevent infinite refresh loops ────────────────────────────────────
let _isRefreshing    = false
let _refreshQueue: Array<(token: string) => void> = []

function _drainQueue(newToken: string) {
  _refreshQueue.forEach(cb => cb(newToken))
  _refreshQueue = []
}

// ── Response interceptor: silent token refresh on 401 ────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original: AxiosRequestConfig & { _retry?: boolean } = error.config ?? {}

    // Only attempt refresh for 401 errors that haven't already been retried
    const is401      = error.response?.status === 401
    const notRetried = !original._retry
    const hasRefresh = Boolean(tokenService.getRefresh())

    if (!is401 || !notRetried || !hasRefresh) {
      return Promise.reject(error)
    }

    original._retry = true

    if (_isRefreshing) {
      // Another refresh is in-flight — queue this request to be retried after
      return new Promise<string>((resolve) => {
        _refreshQueue.push(resolve)
      }).then((newToken) => {
        if (original.headers) original.headers['Authorization'] = `Bearer ${newToken}`
        return apiClient(original)
      })
    }

    _isRefreshing = true

    try {
      const { data } = await axios.post<{ access_token: string; token_type: string }>(
        `${BASE_URL}/auth/refresh`,
        { refresh_token: tokenService.getRefresh() },
        { headers: { 'Content-Type': 'application/json' } },
      )

      const newAccess = data.access_token
      // Persist the new access token (keep the existing refresh token)
      tokenService.save(newAccess, tokenService.getRefresh()!)

      // Drain any queued requests
      _drainQueue(newAccess)

      // Retry the original failed request with the new token
      if (original.headers) original.headers['Authorization'] = `Bearer ${newAccess}`
      return apiClient(original)
    } catch {
      // Refresh failed — clear tokens and force the user back to login
      tokenService.clear()
      _refreshQueue = []
      // Notify AuthContext which listens for this event and calls navigate('/login')
      window.dispatchEvent(new Event('selectai:logout'))
      return Promise.reject(error)
    } finally {
      _isRefreshing = false
    }
  },
)
