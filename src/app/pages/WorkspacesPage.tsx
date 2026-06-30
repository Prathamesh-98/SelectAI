import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  Upload, FlaskConical, BookMarked, Plus, ArrowRight,
  FolderOpen, Bell, Clock, MessageSquare, CheckSquare,
  BarChart2, Sparkles, FileText, AlertTriangle, TrendingUp,
  Search, GitBranch, Loader2, XCircle, CheckCircle2,
  LayoutGrid, Database, Zap, LogOut, Settings, ChevronDown
} from 'lucide-react'
import type { Workspace } from '../types'
import { useAuth }        from '../../auth/useAuth'
import { useWorkspace }   from '../WorkspaceContext'
import { useDatasets }    from '../DatasetContext'

// ─── Internal page-change type (subset of routes used within dashboard) ──────────
// Maps the old AppPage string values to real routes for the sub-components
type AppPage = 'dashboard' | 'datasets' | 'sessions' | 'queries' | 'analytics' | 'history' | 'settings'

// ─── Animation variant ────────────────────────────────────────────────────────
const up = {
  hidden:  { opacity: 0, y: 10 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.055, duration: 0.34, ease: [0.22, 1, 0.36, 1] as const },
  }),
}

// ─── 1. Workspace Header ──────────────────────────────────────────────────────
function WorkspaceHeader({ workspace, onPageChange }: { workspace: Workspace; onPageChange: (p: AppPage) => void }) {
  const { user, logout }            = useAuth()
  const [userMenuOpen, setUserMenu] = useState(false)
  const [notifOpen,    setNotif]    = useState(false)
  const alertCount = workspace.datasets.filter(d => d.status === 'processing' || d.status === 'error').length

  const initials = (user?.full_name ?? 'U')
    .split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className="flex items-center gap-4 px-6 lg:px-8 py-4 border-b border-white/[0.055] bg-[#09090B] sticky top-0 z-10">
      {/* Workspace identity */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <div className="w-7 h-7 rounded-lg flex-shrink-0 shadow-[0_0_10px_var(--ws-glow)]"
          style={{ backgroundColor: workspace.color, '--ws-glow': workspace.color + '44' } as React.CSSProperties} />
        <div className="min-w-0">
          <h1 className="text-[16px] font-bold text-white leading-none truncate">{workspace.name}</h1>
          {workspace.description && (
            <p className="text-[11px] text-zinc-600 mt-0.5 truncate hidden sm:block">{workspace.description}</p>
          )}
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* Notification bell */}
        <div className="relative">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() => { setNotif(v => !v); setUserMenu(false) }}
            className={`relative w-8 h-8 rounded-xl border flex items-center justify-center transition-all duration-150 ${
              notifOpen
                ? 'bg-white/8 border-white/12 text-zinc-200'
                : 'bg-white/4 border-white/6 text-zinc-500 hover:text-zinc-200 hover:bg-white/8'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
            )}
          </button>

          {/* Notification panel */}
          {notifOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-72 bg-[#1C1C1F] border border-white/10 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.7)] overflow-hidden z-[100]"
            >
              <div className="px-4 py-3 border-b border-white/6">
                <p className="text-[12px] font-bold text-zinc-300">Notifications</p>
              </div>
              {alertCount === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Bell className="w-6 h-6 text-zinc-700" />
                  <p className="text-[12px] text-zinc-600">No new notifications</p>
                </div>
              ) : (
                <div className="p-1.5 space-y-0.5">
                  {workspace.datasets
                    .filter(d => d.status === 'processing' || d.status === 'error')
                    .map(d => (
                      <div key={d.id} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/4 transition-colors">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${d.status === 'error' ? 'bg-red-400' : 'bg-amber-400'}`} />
                        <div className="min-w-0">
                          <p className="text-[12px] text-zinc-300 truncate font-mono">{d.name}</p>
                          <p className="text-[11px] text-zinc-600">{d.status === 'error' ? 'Processing failed' : 'Processing…'}</p>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* User avatar button */}
        <div className="relative">
          <button
            type="button"
            aria-label="User menu"
            onClick={() => { setUserMenu(v => !v); setNotif(false) }}
            className={`flex items-center gap-1.5 h-8 pl-0.5 pr-2 rounded-xl border transition-all duration-150 ${
              userMenuOpen
                ? 'bg-white/8 border-white/12'
                : 'bg-white/4 border-white/6 hover:bg-white/8 hover:border-white/10'
            }`}
          >
            <div className="w-7 h-7 rounded-[10px] bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-[11px] font-bold">
              {initials}
            </div>
            <ChevronDown className={`w-3 h-3 text-zinc-500 transition-transform duration-150 ${userMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* User dropdown */}
          {userMenuOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 top-full mt-2 w-52 bg-[#1C1C1F] border border-white/10 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.7)] overflow-hidden z-[100]"
            >
              <div className="px-4 py-3 border-b border-white/6">
                <p className="text-[13px] font-semibold text-zinc-200 truncate">{user?.full_name ?? 'User'}</p>
                <p className="text-[11px] text-zinc-600 truncate">{user?.email ?? ''}</p>
              </div>
              <div className="p-1.5">
                <button
                  type="button"
                  onClick={() => { setUserMenu(false); onPageChange('settings') }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-zinc-300 hover:bg-white/6 hover:text-white transition-colors duration-150"
                >
                  <Settings className="w-4 h-4 text-zinc-500" /> Settings
                </button>
                <div className="my-1 border-t border-white/6" />
                <button
                  type="button"
                  onClick={() => { setUserMenu(false); logout() }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] text-red-400 hover:bg-red-500/10 transition-colors duration-150"
                >
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </motion.div>
          )}
        </div>

      </div>
    </div>
  )
}

// ─── 2. Greeting ──────────────────────────────────────────────────────────────
function Greeting({ hasSessions }: { hasSessions: boolean }) {
  const h = new Date().getHours()
  const greet = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening'
  const sub   = hasSessions
    ? 'Pick up where you left off, or start something new.'
    : 'Get started by uploading a dataset or creating an analysis session.'

  return (
    <motion.div custom={0} variants={up} initial="hidden" animate="visible">
      <p className="text-[22px] font-bold text-white tracking-tight">{greet}, Alex.</p>
      <p className="text-[13px] text-zinc-500 mt-0.5">{sub}</p>
    </motion.div>
  )
}

// ─── 3. Continue Analysis ─────────────────────────────────────────────────────
function ContinueAnalysis({ workspace, onOpen, onPageChange }: {
  workspace: Workspace; onOpen: (id: string) => void; onPageChange: (p: AppPage) => void
}) {
  const session = [...workspace.sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
  const datasets = workspace.datasets.filter(d => session?.datasetIds.includes(d.id))

  // No sessions — show a prompt to create one
  if (!session) {
    return (
      <motion.div custom={1} variants={up} initial="hidden" animate="visible"
        className="relative overflow-hidden bg-white/[0.025] border border-secondary/20 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-secondary/12 border border-secondary/20 flex items-center justify-center flex-shrink-0">
            <FlaskConical className="w-6 h-6 text-secondary" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-widest text-secondary/60 mb-1">Ready to analyse</p>
            <h2 className="text-[17px] font-bold text-white mb-1">Start your first analysis session</h2>
            <p className="text-[13px] text-zinc-500">
              {workspace.datasets.length > 0
                ? `You have ${workspace.datasets.length} dataset${workspace.datasets.length > 1 ? 's' : ''} ready. Create a session to start querying with AI.`
                : 'Upload a CSV file, then create a session to query it with the AI Analyst.'}
            </p>
            <button type="button" onClick={() => onPageChange('sessions')}
              className="mt-4 inline-flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-semibold text-white bg-secondary hover:bg-[#7C3AED] shadow-[0_0_18px_rgba(139,92,246,0.25)] transition-all duration-200">
              <FlaskConical className="w-3.5 h-3.5" /> Create Analysis Session
            </button>
          </div>
        </div>
      </motion.div>
    )
  }

  const updatedStr = session.updatedAt.includes('T')
    ? new Date(session.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
    : session.updatedAt

  return (
    <motion.div custom={1} variants={up} initial="hidden" animate="visible"
      className="relative overflow-hidden border rounded-2xl p-6 group cursor-pointer hover:border-opacity-60 transition-all duration-250"
      style={{ borderColor: session ? '#8B5CF6' + '33' : 'rgba(255,255,255,0.06)', background: 'linear-gradient(135deg, rgba(139,92,246,0.06) 0%, rgba(59,130,246,0.04) 50%, transparent 100%)' }}
      onClick={() => onOpen(session.id)}
    >
      {/* Subtle glow blob */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row sm:items-start gap-5">
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-secondary/60 mb-2">Continue Analysis</p>

          <h2 className="text-[19px] font-bold text-white leading-snug mb-2">{session.name}</h2>

          {/* Dataset pills */}
          {datasets.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {datasets.map(ds => (
                <span key={ds.id}
                  className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-accent/8 border border-accent/15 text-accent/80 rounded-md">
                  <Database className="w-2.5 h-2.5" />{ds.name}
                </span>
              ))}
            </div>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-zinc-500">
            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-zinc-700" />Updated {updatedStr}</span>
            <span className="flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-zinc-700" />{session.messages.length} messages</span>
            <span className="flex items-center gap-1.5"><CheckSquare className="w-3.5 h-3.5 text-zinc-700" />{session.queries.length} queries</span>
            <span className="flex items-center gap-1.5"><BarChart2 className="w-3.5 h-3.5 text-zinc-700" />{session.charts.length} charts</span>
          </div>
        </div>

        <button
          type="button"
          className="self-start sm:self-center flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-bold text-white bg-secondary hover:bg-[#7C3AED] shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-200 flex-shrink-0 group-hover:shadow-[0_0_28px_rgba(139,92,246,0.45)]"
          onClick={e => { e.stopPropagation(); onOpen(session.id) }}
        >
          Continue <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}

// ─── 4. Quick Actions ─────────────────────────────────────────────────────────
const ACTIONS = [
  { id: 'upload',    label: 'Upload Dataset',        desc: 'Add CSV files to this workspace',     icon: Upload,      color: '#06B6D4', page: 'datasets'  as AppPage | null, create: false },
  { id: 'session',   label: 'New Analysis Session',  desc: 'Start AI-powered data analysis',       icon: FlaskConical,color: '#8B5CF6', page: 'sessions'  as AppPage | null, create: false },
  { id: 'workspace', label: 'Create Workspace',      desc: 'Set up a new analytics environment',  icon: LayoutGrid,  color: '#3B82F6', page: null,                           create: true  },
  { id: 'library',   label: 'Query Library',         desc: 'Browse and reuse saved SQL queries',  icon: BookMarked,  color: '#F59E0B', page: 'queries'   as AppPage | null, create: false },
]

function QuickActions({ onPageChange, onCreateWorkspace }: {
  onPageChange: (p: AppPage) => void; onCreateWorkspace: () => void
}) {
  return (
    <motion.div custom={2} variants={up} initial="hidden" animate="visible">
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 mb-3">Quick Actions</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {ACTIONS.map((a, i) => (
          <motion.button key={a.id} type="button" whileHover={{ y: -2 }} whileTap={{ scale: 0.98 }}
            onClick={() => a.create ? onCreateWorkspace() : a.page && onPageChange(a.page)}
            className="flex flex-col gap-3 p-4 bg-white/[0.025] border border-white/6 rounded-2xl text-left hover:bg-white/[0.045] hover:border-white/12 transition-all duration-200 group"
          >
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: a.color + '18', border: `1px solid ${a.color}28` }}>
              <a.icon className="w-4 h-4" style={{ color: a.color }} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-white leading-snug">{a.label}</p>
              <p className="text-[11px] text-zinc-600 mt-0.5 leading-relaxed">{a.desc}</p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 mt-auto" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

// ─── 5. Recent Sessions Timeline ─────────────────────────────────────────────
function RecentSessionsTimeline({ workspace, onOpen, onPageChange }: {
  workspace: Workspace; onOpen: (id: string) => void; onPageChange: (p: AppPage) => void
}) {
  const sessions = [...workspace.sessions].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 4)
  const datasets = workspace.datasets

  return (
    <motion.div custom={3} variants={up} initial="hidden" animate="visible">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-600">Recent Sessions</h2>
        {workspace.sessions.length > 0 && (
          <button type="button" onClick={() => onPageChange('sessions')}
            className="text-[11px] text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {sessions.length === 0 ? (
        <div className="flex items-center justify-center py-8 bg-white/[0.015] border border-white/5 rounded-2xl">
          <p className="text-[12px] text-zinc-700">No sessions yet</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[11px] top-3 bottom-3 w-px bg-white/[0.07]" />

          <div className="space-y-0.5">
            {sessions.map((s, i) => {
              const ds = datasets.filter(d => s.datasetIds.includes(d.id))
              const dateStr = s.updatedAt.includes('T')
                ? new Date(s.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : s.updatedAt

              return (
                <motion.button key={s.id} type="button" onClick={() => onOpen(s.id)}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + i * 0.05, duration: 0.28 }}
                  className="w-full flex items-start gap-3 pl-1 pr-3 py-2.5 rounded-xl hover:bg-white/[0.035] transition-colors duration-150 text-left group"
                >
                  {/* Dot */}
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className={`w-2 h-2 rounded-full border-2 ${i === 0 ? 'bg-secondary border-secondary/40' : 'bg-zinc-700 border-zinc-800'}`} />
                  </div>
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-zinc-200 truncate group-hover:text-white transition-colors">{s.name}</span>
                      {i === 0 && <span className="text-[9px] font-bold uppercase tracking-wider text-secondary/70 bg-secondary/10 px-1.5 py-0.5 rounded-full border border-secondary/15 flex-shrink-0">Latest</span>}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {ds.slice(0, 2).map(d => (
                        <span key={d.id} className="text-[10px] font-mono text-zinc-700">{d.name}</span>
                      ))}
                      {ds.length > 2 && <span className="text-[10px] text-zinc-800">+{ds.length - 2}</span>}
                    </div>
                  </div>
                  {/* Date */}
                  <span className="text-[11px] text-zinc-700 flex-shrink-0 mt-0.5">{dateStr}</span>
                </motion.button>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ─── 6. Dataset Library Preview ───────────────────────────────────────────────
const STATUS_CFG = {
  ready:      { icon: CheckCircle2, cls: 'text-green-400', bg: 'bg-green-500/10' },
  processing: { icon: Loader2,      cls: 'text-amber-400 animate-spin', bg: 'bg-amber-500/10' },
  error:      { icon: XCircle,      cls: 'text-red-400',   bg: 'bg-red-500/10'   },
  idle:       { icon: FolderOpen,   cls: 'text-zinc-600',  bg: 'bg-white/5'      },
} as const

function DatasetLibraryPreview({ workspace, onPageChange }: {
  workspace: Workspace; onPageChange: (p: AppPage) => void
}) {
  const datasets = workspace.datasets.slice(0, 4)

  return (
    <motion.div custom={4} variants={up} initial="hidden" animate="visible">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-600">Dataset Library</h2>
        {workspace.datasets.length > 0 && (
          <button type="button" onClick={() => onPageChange('datasets')}
            className="text-[11px] text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {datasets.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 bg-white/[0.015] border border-white/5 rounded-2xl gap-2">
          <FolderOpen className="w-7 h-7 text-zinc-700" />
          <p className="text-[12px] text-zinc-700">No datasets yet</p>
          <button type="button" onClick={() => onPageChange('datasets')}
            className="text-[12px] text-primary font-medium hover:underline">Upload your first CSV →</button>
        </div>
      ) : (
        <div className="bg-white/[0.015] border border-white/5 rounded-2xl overflow-hidden divide-y divide-white/[0.04]">
          {datasets.map(ds => {
            const { icon: Icon, cls, bg } = STATUS_CFG[ds.status]
            return (
              <div key={ds.id} className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.03] transition-colors duration-150">
                <FolderOpen className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                <span className="text-[12px] font-mono text-zinc-300 flex-1 truncate">{ds.name}</span>
                <div className="hidden sm:flex items-center gap-3 text-[11px] text-zinc-700 flex-shrink-0">
                  <span>{ds.rows.toLocaleString()} rows</span>
                  <span>{ds.columns.length} cols</span>
                  <span>{ds.uploadedAt}</span>
                </div>
                <div className={`w-6 h-6 rounded-lg ${bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-3 h-3 ${cls}`} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </motion.div>
  )
}

// ─── 7. Workspace Overview ────────────────────────────────────────────────────
const OVERVIEW_STATS = [
  { label: 'Datasets',       key: 'datasets',     icon: FolderOpen,   color: '#06B6D4', page: 'datasets'  as AppPage },
  { label: 'Sessions',       key: 'sessions',     icon: FlaskConical, color: '#8B5CF6', page: 'sessions'  as AppPage },
  { label: 'Saved Queries',  key: 'savedQueries', icon: BookMarked,   color: '#3B82F6', page: 'queries'   as AppPage },
  { label: 'Visualisations', key: 'savedCharts',  icon: BarChart2,    color: '#F59E0B', page: 'analytics' as AppPage },
] as const

function WorkspaceOverview({ workspace, onPageChange }: {
  workspace: Workspace; onPageChange: (p: AppPage) => void
}) {
  return (
    <motion.div custom={5} variants={up} initial="hidden" animate="visible">
      <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 mb-3">Workspace Overview</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {OVERVIEW_STATS.map(s => {
          const count = workspace[s.key].length
          const Icon  = s.icon
          return (
            <button key={s.key} type="button" onClick={() => onPageChange(s.page)}
              className="flex flex-col gap-2 p-4 bg-white/[0.025] border border-white/6 rounded-2xl text-left hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200 group">
              <div className="flex items-center justify-between">
                <span className="text-[26px] font-bold text-white leading-none">{count}</span>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: s.color + '18' }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                </div>
              </div>
              <p className="text-[11px] text-zinc-500 flex items-center gap-1">
                {s.label}
                <ArrowRight className="w-2.5 h-2.5 opacity-0 group-hover:opacity-60 -translate-x-0.5 group-hover:translate-x-0 transition-all duration-200" />
              </p>
            </button>
          )
        })}
      </div>
    </motion.div>
  )
}

// ─── 8. AI Analyst Suggestions ───────────────────────────────────────────────
const SUGGESTIONS = [
  { icon: Search,        label: 'Analyse missing values',    desc: 'Find null and empty fields',         color: '#3B82F6' },
  { icon: GitBranch,     label: 'Compare two datasets',      desc: 'Spot differences between files',     color: '#8B5CF6' },
  { icon: FileText,      label: 'Generate executive summary', desc: 'High-level overview of your data',  color: '#06B6D4' },
  { icon: AlertTriangle, label: 'Detect anomalies',          desc: 'Identify outliers and odd values',   color: '#F59E0B' },
  { icon: TrendingUp,    label: 'Forecast trends',           desc: 'Project patterns from records',      color: '#10B981' },
  { icon: BarChart2,     label: 'Find correlations',         desc: 'Discover column relationships',      color: '#F43F5E' },
]

function AISuggestions({ onPageChange }: { onPageChange: (p: AppPage) => void }) {
  return (
    <motion.div custom={6} variants={up} initial="hidden" animate="visible">
      <div className="flex items-center gap-2 mb-3">
        <Sparkles className="w-3.5 h-3.5 text-secondary" />
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-600">AI Analyst Suggestions</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {SUGGESTIONS.map((s, i) => (
          <motion.button key={s.label} type="button"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + i * 0.04, duration: 0.28 }}
            whileHover={{ y: -2 }}
            onClick={() => onPageChange('sessions')}
            className="flex items-start gap-3 p-3.5 bg-white/[0.02] border border-white/5 rounded-xl text-left hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200 group"
          >
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ backgroundColor: s.color + '18', border: `1px solid ${s.color}28` }}>
              <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-zinc-300 group-hover:text-white transition-colors leading-snug">{s.label}</p>
              <p className="text-[11px] text-zinc-600 mt-0.5">{s.desc}</p>
            </div>
            <Zap className="w-3 h-3 text-zinc-800 group-hover:text-secondary flex-shrink-0 mt-1 transition-colors duration-200" />
          </motion.button>
        ))}
      </div>
    </motion.div>
  )
}

// ─── 9. Recent Activity ───────────────────────────────────────────────────────
const ACTIVITY_ICON: Record<string, { icon: React.FC<{ className?: string }>; color: string }> = {
  upload:  { icon: Upload,       color: 'text-accent'    },
  query:   { icon: BookMarked,   color: 'text-primary'   },
  chart:   { icon: BarChart2,    color: 'text-amber-400' },
  session: { icon: FlaskConical, color: 'text-secondary' },
}

function RecentActivity({ workspace, onPageChange }: {
  workspace: Workspace; onPageChange: (p: AppPage) => void
}) {
  const entries = workspace.history.slice(0, 6)

  return (
    <motion.div custom={7} variants={up} initial="hidden" animate="visible">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[11px] font-bold uppercase tracking-widest text-zinc-600">Recent Activity</h2>
        {workspace.history.length > 0 && (
          <button type="button" onClick={() => onPageChange('history')}
            className="text-[11px] text-primary hover:text-primary/80 font-medium transition-colors flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="flex items-center justify-center py-8 bg-white/[0.015] border border-white/5 rounded-2xl">
          <p className="text-[12px] text-zinc-700">No activity yet</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[11px] top-3 bottom-3 w-px bg-white/[0.07]" />
          <div className="space-y-0.5">
            {entries.map((entry, i) => {
              const cfg  = ACTIVITY_ICON[entry.type] ?? ACTIVITY_ICON.query
              const Icon = cfg.icon
              return (
                <motion.div key={entry.id}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.04, duration: 0.26 }}
                  className="flex items-start gap-3 pl-1 pr-3 py-2 rounded-xl hover:bg-white/[0.025] transition-colors duration-150"
                >
                  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 rounded-lg bg-white/4 border border-white/6 flex items-center justify-center">
                      <Icon className={`w-2.5 h-2.5 ${cfg.color}`} />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-zinc-400 truncate">{entry.description}</p>
                    {entry.detail && <p className="text-[10px] text-zinc-700 font-mono mt-0.5 truncate">{entry.detail}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <div className={`w-1.5 h-1.5 rounded-full ${entry.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                    <span className="text-[10px] text-zinc-700">{entry.createdAt}</span>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}
    </motion.div>
  )
}

// ─── 10. Empty State (onboarding) ─────────────────────────────────────────────
function EmptyStateDashboard({ onPageChange, onCreateWorkspace }: {
  onPageChange: (p: AppPage) => void; onCreateWorkspace: () => void
}) {
  const features = [
    'Upload CSV files and explore them with AI',
    'Ask questions in plain English — AI writes the SQL',
    'Visualise results instantly as bar charts',
    'Get AI-generated insights and executive summaries',
    'Save queries and reuse them across sessions',
  ]

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
      className="max-w-2xl mx-auto py-10 text-center">

      {/* Graphic */}
      <div className="relative w-24 h-24 mx-auto mb-8">
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-secondary/20 to-primary/20 border border-secondary/20" />
        <div className="absolute inset-0 rounded-3xl flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-secondary" />
        </div>
        <div className="absolute -top-1 -right-1 w-6 h-6 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center">
          <Database className="w-3 h-3 text-accent" />
        </div>
        <div className="absolute -bottom-1 -left-1 w-6 h-6 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
          <BarChart2 className="w-3 h-3 text-primary" />
        </div>
      </div>

      {/* Text */}
      <h2 className="text-[22px] font-bold text-white mb-2">Welcome to SelectAI</h2>
      <p className="text-[14px] text-zinc-500 leading-relaxed mb-8 max-w-md mx-auto">
        Your workspace is empty. Upload a dataset or create an analysis session to get started.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
        <motion.button type="button" whileHover={{ y: -2 }} onClick={() => onPageChange('datasets')}
          className="flex items-center gap-2 h-10 px-6 rounded-xl text-[13px] font-bold text-white bg-primary hover:bg-[#2563EB] shadow-[0_0_24px_rgba(59,130,246,0.3)] transition-all duration-200">
          <Upload className="w-4 h-4" /> Upload Dataset
        </motion.button>
        <motion.button type="button" whileHover={{ y: -2 }} onClick={() => onPageChange('sessions')}
          className="flex items-center gap-2 h-10 px-6 rounded-xl text-[13px] font-bold text-white bg-secondary hover:bg-[#7C3AED] shadow-[0_0_24px_rgba(139,92,246,0.3)] transition-all duration-200">
          <FlaskConical className="w-4 h-4" /> Create Session
        </motion.button>
        <motion.button type="button" whileHover={{ y: -2 }} onClick={onCreateWorkspace}
          className="flex items-center gap-2 h-10 px-5 rounded-xl text-[13px] font-semibold text-zinc-400 bg-white/5 border border-white/8 hover:bg-white/8 hover:text-white transition-all duration-200">
          <Plus className="w-4 h-4" /> New Workspace
        </motion.button>
      </div>

      {/* Feature list */}
      <div className="bg-white/[0.02] border border-white/6 rounded-2xl p-5 text-left">
        <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-600 mb-3">What you can do with SelectAI</p>
        <ul className="space-y-2.5">
          {features.map(f => (
            <li key={f} className="flex items-start gap-2.5">
              <div className="w-4 h-4 rounded-full bg-primary/15 border border-primary/25 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-2.5 h-2.5 text-primary" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span className="text-[13px] text-zinc-400">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export function WorkspacesPage() {
  const navigate = useNavigate()
  const { activeWorkspace, setCreateWsOpen, isLoading: wsLoading, error: wsError, refetch: refetchWs } = useWorkspace()
  const { datasets, isLoading: dsLoading, error: dsError, refetch: refetchDs } = useDatasets()

  const isLoading = wsLoading || dsLoading
  const error = wsError || dsError
  const refetch = () => Promise.all([refetchWs(), refetchDs()])

  const workspace = {
    ...activeWorkspace,
    datasets: datasets
  }

  // Map legacy AppPage strings to real route paths
  const onPageChange = (p: AppPage) => navigate(`/${p}`)
  const onOpenSession = (id: string) => navigate(`/analysis/${id}`)
  const onCreateWorkspace = () => setCreateWsOpen(true)

  // ── Loading state ──────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-zinc-600">
          <div className="w-8 h-8 border-2 border-primary/40 border-t-primary rounded-full animate-spin" />
          <p className="text-[13px]">Loading workspace…</p>
        </div>
      </div>
    )
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="flex flex-col items-center gap-4 max-w-xs text-center">
          <p className="text-[14px] text-zinc-400">{error}</p>
          <button
            type="button"
            onClick={() => refetch()}
            className="h-9 px-5 rounded-xl text-[13px] font-semibold text-white bg-primary hover:bg-[#2563EB] transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  const isEmpty = workspace.datasets.length === 0 && workspace.sessions.length === 0

  return (
    <div className="h-full overflow-y-auto flex flex-col">
      <WorkspaceHeader workspace={workspace} onPageChange={onPageChange} />

      <div className="flex-1 px-6 lg:px-8 py-6 max-w-5xl mx-auto w-full space-y-8 pb-10">
        {isEmpty ? (
          <EmptyStateDashboard onPageChange={onPageChange} onCreateWorkspace={onCreateWorkspace} />
        ) : (
          <>
            <Greeting hasSessions={workspace.sessions.length > 0} />
            <ContinueAnalysis workspace={workspace} onOpen={onOpenSession} onPageChange={onPageChange} />
            <QuickActions onPageChange={onPageChange} onCreateWorkspace={onCreateWorkspace} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <RecentSessionsTimeline workspace={workspace} onOpen={onOpenSession} onPageChange={onPageChange} />
              <DatasetLibraryPreview  workspace={workspace} onPageChange={onPageChange} />
            </div>

            <WorkspaceOverview   workspace={workspace} onPageChange={onPageChange} />
            <AISuggestions       onPageChange={onPageChange} />
            <RecentActivity      workspace={workspace} onPageChange={onPageChange} />
          </>
        )}
      </div>
    </div>
  )
}
