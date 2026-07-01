// ─── App Sidebar ─────────────────────────────────────────────────────────────
// Uses React Router NavLink for active-state detection.
// Reads workspace data from WorkspaceContext instead of props.
// src/app/AppSidebar.tsx

import { motion, AnimatePresence } from 'framer-motion'
import { NavLink, useNavigate }    from 'react-router-dom'
import {
  Database, MessageSquare, BookMarked, BarChart2, 
  Clock, Settings, Sparkles, ChevronDown, Plus, LogOut, LayoutDashboard,
  FolderOpen, FlaskConical, X, DownloadCloud
} from 'lucide-react'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'
import { AvatarMenu }        from '../design-system/components/AvatarMenu'
import { useAuth }           from '../auth/useAuth'
import { useWorkspace }      from './WorkspaceContext'
import { useDatasets }       from './DatasetContext'
import { useSessions }       from './SessionContext'
import type { Workspace, AnalysisSession }    from './types'

type DashboardWorkspace = Workspace & { sessions: AnalysisSession[] }

// ── Nav definitions ───────────────────────────────────────────────────────────

interface NavDef {
  label:   string
  icon:    React.FC<{ className?: string }>
  path:    string
  badge?:  (ws: DashboardWorkspace) => number | null
  section: 'workspace' | 'library' | 'account'
  // extra paths that should also count as "active" for this item
  matchPaths?: string[]
}

const NAV: NavDef[] = [
  { path: '/dashboard', label: 'Overview',         icon: LayoutDashboard, section: 'workspace' },
  { path: '/datasets',  label: 'Datasets',          icon: FolderOpen,  section: 'workspace', badge: ws => ws.datasets.length     || null },
  { path: '/sessions',  label: 'Analysis Sessions', icon: FlaskConical, section: 'workspace',
    badge: ws => ws.sessions.length || null,
    matchPaths: ['/analysis'] },                       // /analysis/:id also highlights Sessions
  { path: '/saved-queries',   label: 'Saved Queries',     icon: BookMarked,  section: 'workspace' },
  { path: '/dashboards',      label: 'Dashboards',        icon: LayoutDashboard, section: 'workspace' },
  { path: '/exports',         label: 'Exports & Reports', icon: DownloadCloud, section: 'workspace' },
  { path: '/analytics', label: 'Analytics',         icon: BarChart2,   section: 'library',   badge: ws => ws.savedCharts.length  || null },
  { path: '/history',   label: 'History',           icon: Clock,       section: 'library'   },
  { path: '/settings',  label: 'Settings',          icon: Settings,    section: 'account'   },
]

const SECTIONS = [
  { key: 'workspace', label: 'Workspace' },
  { key: 'library',   label: 'Library'   },
  { key: 'account',   label: 'Account'   },
] as const

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  mobileOpen:    boolean
  onMobileClose: () => void
}

// ── Nav item ──────────────────────────────────────────────────────────────────

function NavItem({ def, workspace, onClick }: {
  def: NavDef; workspace: DashboardWorkspace; onClick: () => void
}) {
  const Icon  = def.icon
  const count = def.badge?.(workspace) ?? null

  return (
    <NavLink
      to={def.path}
      onClick={onClick}
      className={({ isActive }) => [
        'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 border',
        isActive
          ? 'bg-primary/12 text-primary border-primary/20'
          : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border-transparent',
      ].join(' ')}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1 text-left">{def.label}</span>
      {count !== null && (
        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white/8 text-zinc-600">
          {count}
        </span>
      )}
    </NavLink>
  )
}

// ── Sidebar body ──────────────────────────────────────────────────────────────

function SidebarContent({ onMobileClose }: { onMobileClose: () => void }) {
  const navigate  = useNavigate()
  const { user, logout } = useAuth()
  const {
    workspaces, activeWorkspace, activeWsId,
    switchWorkspace, setCreateWsOpen,
  } = useWorkspace()
  const { datasets } = useDatasets()
  const { sessions } = useSessions()

  const workspace: DashboardWorkspace = {
    ...activeWorkspace,
    datasets: datasets,
    sessions: sessions,
  }

  const displayName = user?.full_name ?? 'User'
  const email       = user?.email ?? ''
  const initials    = displayName.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  const menuActions = [
    { key: 'settings', label: 'Settings', icon: <Settings className="w-4 h-4" />,
      onClick: () => { navigate('/settings'); onMobileClose() } },
    { key: 'logout', label: 'Sign Out', icon: <LogOut className="w-4 h-4" />,
      divider: true, danger: true, onClick: logout },
  ]

  return (
    <div className="flex flex-col h-full bg-[#111113] border-r border-white/[0.06]">

      {/* Logo */}
      <div className="flex items-center gap-2.5 h-14 px-4 border-b border-white/[0.06] flex-shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.2)]">
          <Database className="w-3.5 h-3.5 text-white" />
        </div>
        <span className="font-bold text-[16px] text-white tracking-tight">
          Select<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AI</span>
        </span>
        <button type="button" onClick={onMobileClose} className="ml-auto lg:hidden text-zinc-600 hover:text-zinc-300">
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Workspace switcher */}
      <div className="py-3 border-b border-white/[0.04] flex-shrink-0">
        <WorkspaceSwitcher
          workspaces={workspaces}
          activeWorkspaceId={activeWsId}
          onSwitch={(id) => { switchWorkspace(id); onMobileClose() }}
          onCreateNew={() => { setCreateWsOpen(true); onMobileClose() }}
        />
      </div>

      {/* Navigation sections */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {SECTIONS.filter(sec => NAV.some(n => n.section === sec.key)).map(sec => (
          <div key={sec.key} className="space-y-0.5">
            <p className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-zinc-700">
              {sec.label}
            </p>
            {NAV.filter(n => n.section === sec.key).map(def => (
              <NavItem
                key={def.path}
                def={def}
                workspace={workspace}
                onClick={() => onMobileClose()}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Avatar — real user data + logout */}
      <div className="flex-shrink-0 px-2 py-3 border-t border-white/[0.06]">
        <AvatarMenu
          name={displayName}
          email={email}
          initials={initials}
          role="Member"
          actions={menuActions}
          size="sm"
        />
      </div>
    </div>
  )
}

// ── Exported sidebar ──────────────────────────────────────────────────────────

export function AppSidebar({ mobileOpen, onMobileClose }: Props) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-[220px] xl:w-[240px] flex-shrink-0 h-screen">
        <SidebarContent onMobileClose={onMobileClose} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 bg-black/50 z-[50] lg:hidden"
            />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 bottom-0 w-[240px] z-[51] lg:hidden"
            >
              <SidebarContent onMobileClose={onMobileClose} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
