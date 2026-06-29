import { useState }             from 'react'
import { Menu }                  from 'lucide-react'
import { AppSidebar }            from './AppSidebar'
import type { AppPage }          from './AppSidebar'
import { CreateWorkspaceModal }  from './CreateWorkspaceModal'
import { WorkspacesPage }        from './pages/WorkspacesPage'
import { DatasetsPage }          from './pages/DatasetsPage'
import { AnalysisSessionsPage }  from './pages/AnalysisSessionsPage'
import { SessionDetailPage }     from './pages/SessionDetailPage'
import { QueryLibraryPage }      from './pages/QueryLibraryPage'
import { AnalyticsPage }         from './pages/AnalyticsPage'
import { HistoryPage }           from './pages/HistoryPage'
import { SettingsPage }          from './pages/SettingsPage'
import { initialWorkspaces }     from './mockData'
import type { Workspace, AnalysisSession } from './types'

const PAGE_TITLE: Record<AppPage, string> = {
  workspaces: 'Overview',
  datasets:   'Datasets',
  sessions:   'Analysis Sessions',
  queries:    'Query Library',
  analytics:  'Analytics',
  history:    'History',
  settings:   'Settings',
}

export default function AppShell() {
  const [workspaces,      setWorkspaces]      = useState<Workspace[]>(initialWorkspaces)
  const [activeWsId,      setActiveWsId]      = useState<string>(initialWorkspaces[0].id)
  const [activePage,      setActivePage]      = useState<AppPage>('workspaces')
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [sidebarOpen,     setSidebarOpen]     = useState(false)
  const [createWsOpen,    setCreateWsOpen]    = useState(false)

  const activeWorkspace = workspaces.find(w => w.id === activeWsId) ?? workspaces[0]
  const activeSession   = activeWorkspace.sessions.find(s => s.id === activeSessionId) ?? null

  // ── Workspace actions ──────────────────────────────────────────────────────
  const handleCreateWorkspace = (data: { name: string; description: string; color: string }) => {
    const next: Workspace = {
      id:           `ws-${Date.now()}`,
      name:         data.name,
      description:  data.description,
      color:        data.color,
      datasets:     [],
      sessions:     [],
      savedQueries: [],
      savedCharts:  [],
      history:      [],
      createdAt:    new Date().toISOString(),
    }
    setWorkspaces(prev => [...prev, next])
    setActiveWsId(next.id)
    setActivePage('workspaces')
    setActiveSessionId(null)
  }

  const handleUpdateWorkspace = (patch: Partial<Pick<Workspace, 'name' | 'description' | 'color'>>) => {
    setWorkspaces(prev => prev.map(w => w.id === activeWsId ? { ...w, ...patch } : w))
  }

  // ── Session actions ────────────────────────────────────────────────────────
  const handleCreateSession = (name: string, datasetIds: string[], description: string) => {
    const newSession: AnalysisSession = {
      id:          `sess-${Date.now()}`,
      name,
      description: description || undefined,
      datasetIds,
      messages:    [],
      queries:     [],
      charts:      [],
      insights:    [],
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    }
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWsId
        ? { ...w, sessions: [...w.sessions, newSession] }
        : w
    ))
    setActiveSessionId(newSession.id)
    setActivePage('sessions')
  }

  const handleOpenSession = (id: string) => {
    setActiveSessionId(id)
    setActivePage('sessions')
  }

  const handleBackFromSession = () => setActiveSessionId(null)

  const handleSessionUpdate = (patch: Partial<AnalysisSession>) => {
    if (!activeSessionId) return
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWsId
        ? { ...w, sessions: w.sessions.map(s => s.id === activeSessionId ? { ...s, ...patch } : s) }
        : w
    ))
  }

  // ── Navigation ─────────────────────────────────────────────────────────────
  const handlePageChange = (p: AppPage) => {
    setActivePage(p)
    if (p !== 'sessions') setActiveSessionId(null)
  }

  const handleWorkspaceSwitch = (id: string) => {
    setActiveWsId(id)
    setActivePage('workspaces')
    setActiveSessionId(null)
  }

  // ── Page renderer ──────────────────────────────────────────────────────────
  const renderPage = () => {
    // Session detail overrides the sessions list
    if (activePage === 'sessions' && activeSession) {
      return (
        <SessionDetailPage
          session={activeSession}
          workspace={activeWorkspace}
          onBack={handleBackFromSession}
          onUpdate={handleSessionUpdate}
        />
      )
    }

    switch (activePage) {
      case 'workspaces':
        return <WorkspacesPage workspace={activeWorkspace} onPageChange={handlePageChange} onOpenSession={handleOpenSession} onCreateWorkspace={() => setCreateWsOpen(true)} />
      case 'datasets':
        return <DatasetsPage workspace={activeWorkspace} />
      case 'sessions':
        return <AnalysisSessionsPage workspace={activeWorkspace} onOpenSession={handleOpenSession} onCreateSession={handleCreateSession} />
      case 'queries':
        return <QueryLibraryPage workspace={activeWorkspace} />
      case 'analytics':
        return <AnalyticsPage workspace={activeWorkspace} />
      case 'history':
        return <HistoryPage workspace={activeWorkspace} />
      case 'settings':
        return <SettingsPage workspace={activeWorkspace} onUpdate={handleUpdateWorkspace} />
      default:
        return <WorkspacesPage workspace={activeWorkspace} onPageChange={handlePageChange} onOpenSession={handleOpenSession} onCreateWorkspace={() => setCreateWsOpen(true)} />
    }
  }

  // Sessions page (both list and detail) needs flex-column full-height layout
  const isFullHeight = activePage === 'sessions'

  return (
    <div className="flex h-screen bg-[#09090B] text-white overflow-hidden">

      {/* Sidebar */}
      <AppSidebar
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
        activePage={activePage}
        mobileOpen={sidebarOpen}
        onPageChange={handlePageChange}
        onWorkspaceSwitch={handleWorkspaceSwitch}
        onCreateWorkspace={() => setCreateWsOpen(true)}
        onMobileClose={() => setSidebarOpen(false)}
      />

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Mobile topbar */}
        <header className="lg:hidden flex items-center gap-3 h-14 px-4 border-b border-white/[0.06] bg-[#09090B] flex-shrink-0">
          <button type="button" onClick={() => setSidebarOpen(true)} aria-label="Open menu"
            className="w-8 h-8 rounded-lg text-zinc-500 hover:text-zinc-200 hover:bg-white/5 flex items-center justify-center transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-[14px] font-semibold text-white truncate">
            {activePage === 'sessions' && activeSession ? activeSession.name : PAGE_TITLE[activePage]}
          </span>
          <div className="ml-auto flex items-center gap-2 flex-shrink-0">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: activeWorkspace.color }} />
            <span className="text-[12px] text-zinc-500 truncate max-w-[110px]">{activeWorkspace.name}</span>
          </div>
        </header>

        {/* Page */}
        <main className={`flex-1 overflow-hidden ${isFullHeight ? 'flex flex-col' : 'overflow-y-auto'}`}>
          {renderPage()}
        </main>
      </div>

      {/* Create Workspace Modal */}
      <CreateWorkspaceModal
        open={createWsOpen}
        onClose={() => setCreateWsOpen(false)}
        onCreate={handleCreateWorkspace}
      />
    </div>
  )
}
