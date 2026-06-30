// ─── App Shell ────────────────────────────────────────────────────────────────
// Layout route rendered by ProtectedRoute.
// Provides WorkspaceContext to all child pages and renders <Outlet /> where
// the current child route's page component is mounted.
// src/app/AppShell.tsx

import { useState }            from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Menu }                from 'lucide-react'
import { AppSidebar }          from './AppSidebar'
import { CreateWorkspaceModal } from './CreateWorkspaceModal'
import { WorkspaceProvider, useWorkspace } from './WorkspaceContext'

// ── Route → title mapping for the mobile topbar ───────────────────────────────
const PATH_TITLE: Record<string, string> = {
  '/dashboard': 'Overview',
  '/datasets':  'Datasets',
  '/sessions':  'Analysis Sessions',
  '/queries':   'Query Library',
  '/analytics': 'Analytics',
  '/history':   'History',
  '/settings':  'Settings',
}

// ── Inner shell (needs WorkspaceContext) ──────────────────────────────────────
function ShellInner() {
  const { activeWorkspace, createWsOpen, setCreateWsOpen, createWorkspace } = useWorkspace()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  // Derive mobile title from path
  const mobileTitle = PATH_TITLE[location.pathname]
    ?? (location.pathname.startsWith('/analysis/') ? 'Analysis' : 'SelectAI')

  // Sessions + analysis pages need full-height flex layout for the chat UI
  const isFullHeight =
    location.pathname.startsWith('/sessions') ||
    location.pathname.startsWith('/analysis/')

  return (
    <div className="flex h-screen bg-[#09090B] text-white overflow-hidden">

      {/* Sidebar */}
      <AppSidebar
        mobileOpen={sidebarOpen}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 h-14 px-4 border-b border-white/[0.06] bg-[#09090B] flex-shrink-0">
          <button
            type="button"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open menu"
            className="w-8 h-8 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 flex items-center justify-center transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-[14px] font-semibold text-white truncate">{mobileTitle}</span>
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeWorkspace.color }} />
            <span className="text-[12px] text-zinc-500 truncate max-w-[110px]">{activeWorkspace.name}</span>
          </div>
        </header>

        {/* Page — child route renders here */}
        <main className={`flex-1 overflow-hidden ${isFullHeight ? 'flex flex-col' : 'overflow-y-auto'}`}>
          <Outlet />
        </main>
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        open={createWsOpen}
        onClose={() => setCreateWsOpen(false)}
        onCreate={createWorkspace}
      />
    </div>
  )
}

// ── Exported shell — wraps ShellInner in WorkspaceProvider ────────────────────
export default function AppShell() {
  return (
    <WorkspaceProvider>
      <ShellInner />
    </WorkspaceProvider>
  )
}
