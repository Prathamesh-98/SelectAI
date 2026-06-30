// ─── Protected Route ──────────────────────────────────────────────────────────
// Used as a layout route element in the router config.
// - Shows a full-screen loader while the auth bootstrap completes.
// - Unauthenticated users are redirected to /login with React Router Navigate.
// - Authenticated users see AppShell (which renders <Outlet /> for child routes).
// src/auth/ProtectedRoute.tsx

import { Navigate } from 'react-router-dom'
import { useAuth }  from './useAuth'
import AppShell     from '../app/AppShell'

export function ProtectedRoute() {
  const { isAuth, isLoading } = useAuth()

  // ── Loading state: spinner while bootstrap runs ────────────────────────────
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#09090B]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <svg className="w-5 h-5 text-primary animate-pulse" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <svg className="w-5 h-5 text-primary animate-spin" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p className="text-[13px] text-zinc-500 font-medium">Loading SelectAI…</p>
        </div>
      </div>
    )
  }

  // ── Not authenticated → redirect to /login ─────────────────────────────────
  if (!isAuth) {
    return <Navigate to="/login" replace />
  }

  // ── Authenticated → render the app shell with child routes via Outlet ──────
  return <AppShell />
}
