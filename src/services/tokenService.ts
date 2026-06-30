// ─── Token persistence service ────────────────────────────────────────────────
// Single source of truth for reading/writing tokens to localStorage.
// src/services/tokenService.ts

const ACCESS_KEY  = 'selectai_access_token'
const REFRESH_KEY = 'selectai_refresh_token'

export const tokenService = {
  /** Persist both tokens after login / register. */
  save(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_KEY,  accessToken)
    localStorage.setItem(REFRESH_KEY, refreshToken)
  },

  /** Return the stored access token, or null if absent. */
  getAccess(): string | null {
    return localStorage.getItem(ACCESS_KEY)
  },

  /** Return the stored refresh token, or null if absent. */
  getRefresh(): string | null {
    return localStorage.getItem(REFRESH_KEY)
  },

  /** Wipe both tokens — called on logout or hard auth failure. */
  clear(): void {
    localStorage.removeItem(ACCESS_KEY)
    localStorage.removeItem(REFRESH_KEY)
  },

  /** True if an access token exists in storage (does not validate the JWT). */
  hasAccess(): boolean {
    return Boolean(localStorage.getItem(ACCESS_KEY))
  },
}
