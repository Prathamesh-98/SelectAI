// ─── React Router v7 Configuration ───────────────────────────────────────────
// src/router.tsx

import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'

import { AuthProvider }        from './auth/AuthContext'
import { ProtectedRoute }      from './auth/ProtectedRoute'
import { LoginPage }           from './auth/LoginPage'
import { RegisterPage }        from './auth/RegisterPage'
import { ForgotPasswordPage }  from './auth/ForgotPasswordPage'
import { ResetPasswordPage }   from './auth/ResetPasswordPage'

import { WorkspacesPage }       from './app/pages/WorkspacesPage'
import { DatasetsPage }         from './app/pages/DatasetsPage'
import { AnalysisSessionsPage } from './app/pages/AnalysisSessionsPage'
import { SessionDetailPage }    from './app/pages/SessionDetailPage'
import { SavedQueriesPage }     from './app/pages/SavedQueriesPage'
import { DashboardsPage }       from './app/pages/DashboardsPage'
import { DashboardEditor }      from './app/pages/DashboardEditor'
import { ReportHistoryPage }    from './app/pages/ReportHistoryPage'
import { AnalyticsPage }        from './app/pages/AnalyticsPage'
import { HistoryPage }          from './app/pages/HistoryPage'
import { SettingsPage }         from './app/pages/SettingsPage'

import LandingPage from './App'
import { ToastProvider } from './design-system/components/Toast'

// ── Root layout — provides AuthProvider to every route ────────────────────────
function RootLayout() {
  return (
    <ToastProvider>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </ToastProvider>
  )
}

// ── Router ────────────────────────────────────────────────────────────────────
export const router = createBrowserRouter([
  {
    // Root layout wraps all routes so AuthProvider is inside the Router tree
    element: <RootLayout />,
    children: [

      // ── Public routes ────────────────────────────────────────────────────────
      { path: '/',                  element: <LandingPage /> },
      { path: '/login',             element: <LoginPage /> },
      { path: '/register',          element: <RegisterPage /> },
      { path: '/forgot-password',   element: <ForgotPasswordPage /> },
      { path: '/reset-password',    element: <ResetPasswordPage /> },

      // ── Protected app routes (all rendered inside AppShell) ──────────────────
      {
        // ProtectedRoute checks auth and renders AppShell (layout with <Outlet />)
        element: <ProtectedRoute />,
        children: [
          { path: '/dashboard',              element: <WorkspacesPage /> },
          { path: '/datasets',               element: <DatasetsPage /> },
          { path: '/sessions',               element: <AnalysisSessionsPage /> },
          { path: '/analysis/:sessionId',    element: <SessionDetailPage /> },
          { path: '/saved-queries',          element: <SavedQueriesPage /> },
          { path: '/dashboards',             element: <DashboardsPage /> },
          { path: '/dashboards/:id',         element: <DashboardEditor /> },
          { path: '/exports',                element: <ReportHistoryPage /> },
          { path: '/analytics',              element: <AnalyticsPage /> },
          { path: '/history',                element: <HistoryPage /> },
          { path: '/settings',               element: <SettingsPage /> },
          // Convenience: /app → dashboard
          { path: '/app',                    element: <Navigate to="/dashboard" replace /> },
        ],
      },

      // ── 404 → Landing ────────────────────────────────────────────────────────
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])
