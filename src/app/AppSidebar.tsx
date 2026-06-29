import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, FolderOpen, FlaskConical, BookMarked, BarChart2, Clock, Settings, X, Database } from 'lucide-react'
import { WorkspaceSwitcher } from './WorkspaceSwitcher'
import { AvatarMenu }        from '../design-system/components/AvatarMenu'
import type { Workspace }    from './types'

// ─── Page definition ──────────────────────────────────────────────────────────
export type AppPage =
  | 'workspaces' | 'datasets' | 'sessions'
  | 'queries'    | 'analytics' | 'history' | 'settings'

interface NavDef {
  id:      AppPage
  label:   string
  icon:    React.FC<{ className?: string }>
  badge?:  (ws: Workspace) => number | null
  section: 'workspace' | 'library' | 'account'
}

const NAV: NavDef[] = [
  { id: 'workspaces', label: 'Overview',          icon: LayoutDashboard, section: 'workspace' },
  { id: 'datasets',   label: 'Datasets',           icon: FolderOpen,  section: 'workspace', badge: ws => ws.datasets.length      || null },
  { id: 'sessions',   label: 'Analysis Sessions',  icon: FlaskConical, section: 'workspace', badge: ws => ws.sessions.length      || null },
  { id: 'queries',    label: 'Query Library',      icon: BookMarked,  section: 'library',   badge: ws => ws.savedQueries.length  || null },
  { id: 'analytics',  label: 'Analytics',           icon: BarChart2,   section: 'library',   badge: ws => ws.savedCharts.length   || null },
  { id: 'history',    label: 'History',             icon: Clock,       section: 'library'   },
  { id: 'settings',   label: 'Settings',            icon: Settings,    section: 'account'   },
]

const SECTIONS = [
  { key: 'workspace', label: 'Workspace' },
  { key: 'library',   label: 'Library'   },
  { key: 'account',   label: 'Account'   },
] as const

// ─── Props ────────────────────────────────────────────────────────────────────
interface Props {
  workspaces:        Workspace[]
  activeWorkspace:   Workspace
  activePage:        AppPage
  mobileOpen:        boolean
  onPageChange:      (p: AppPage) => void
  onWorkspaceSwitch: (id: string) => void
  onCreateWorkspace: () => void
  onMobileClose:     () => void
}

// ─── Nav item ─────────────────────────────────────────────────────────────────
function NavItem({ def, active, workspace, onClick }: {
  def: NavDef; active: boolean; workspace: Workspace; onClick: () => void
}) {
  const Icon  = def.icon
  const count = def.badge?.(workspace) ?? null
  return (
    <button type="button" onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 border ${
        active
          ? 'bg-primary/12 text-primary border-primary/20'
          : 'text-zinc-500 hover:text-zinc-200 hover:bg-white/5 border-transparent'
      }`}>
      <Icon className="w-4 h-4 flex-shrink-0" />
      <span className="flex-1 text-left">{def.label}</span>
      {count !== null && (
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${active ? 'bg-primary/20 text-primary' : 'bg-white/8 text-zinc-600'}`}>
          {count}
        </span>
      )}
    </button>
  )
}

// ─── Sidebar body ─────────────────────────────────────────────────────────────
function SidebarContent(props: Props) {
  const { workspaces, activeWorkspace, activePage, onPageChange, onWorkspaceSwitch, onCreateWorkspace, onMobileClose } = props

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
          activeWorkspaceId={activeWorkspace.id}
          onSwitch={onWorkspaceSwitch}
          onCreateNew={onCreateWorkspace}
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
                key={def.id}
                def={def}
                active={activePage === def.id}
                workspace={activeWorkspace}
                onClick={() => { onPageChange(def.id); onMobileClose() }}
              />
            ))}
          </div>
        ))}
      </div>

      {/* Avatar */}
      <div className="flex-shrink-0 px-2 py-3 border-t border-white/[0.06]">
        <AvatarMenu name="Alex Chen" email="alex@company.com" role="Admin" size="sm" />
      </div>
    </div>
  )
}

// ─── Exported sidebar ─────────────────────────────────────────────────────────
export function AppSidebar(props: Props) {
  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex flex-col w-[220px] xl:w-[240px] flex-shrink-0 h-screen">
        <SidebarContent {...props} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {props.mobileOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={props.onMobileClose}
              className="fixed inset-0 bg-black/50 z-[50] lg:hidden" />
            <motion.aside
              initial={{ x: -260 }} animate={{ x: 0 }} exit={{ x: -260 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="fixed top-0 left-0 bottom-0 w-[240px] z-[51] lg:hidden">
              <SidebarContent {...props} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
