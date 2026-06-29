import { useState }          from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FlaskConical, Plus, ArrowRight, X, Clock, CheckSquare, MessageSquare, BarChart2, Database } from 'lucide-react'
import { SQLCodeBlock }     from '../../design-system/components/SQLCodeBlock'
import type { Workspace, AnalysisSession } from '../types'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  workspace:      Workspace
  onOpenSession:  (id: string) => void
  onCreateSession: (name: string, datasetIds: string[], description: string) => void
}

// ─── New Session Modal ────────────────────────────────────────────────────────
function NewSessionModal({ workspace, open, onClose, onCreate }: {
  workspace: Workspace; open: boolean
  onClose: () => void; onCreate: (name: string, datasetIds: string[], description: string) => void
}) {
  const [name,       setName]       = useState('')
  const [desc,       setDesc]       = useState('')
  const [selected,   setSelected]   = useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setSelected(prev => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreate(name.trim(), [...selected], desc.trim())
    setName(''); setDesc(''); setSelected(new Set()); onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose} className="fixed inset-0 bg-black/60 backdrop-blur-[3px] z-[200]" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-md bg-[#18181B] border border-white/10 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden"
              onClick={e => e.stopPropagation()}>

              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-secondary/15 border border-secondary/25 flex items-center justify-center">
                    <FlaskConical className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-white">New Analysis Session</h2>
                    <p className="text-[12px] text-zinc-500">Set up a focused analysis environment</p>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreate} className="p-6 space-y-5">
                {/* Name */}
                <div>
                  <label htmlFor="sess-name" className="block text-[13px] font-medium text-zinc-300 mb-1.5">
                    Session name <span className="text-red-400">*</span>
                  </label>
                  <input id="sess-name" type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="e.g. Q3 Revenue Analysis" maxLength={60} required autoFocus
                    className="w-full h-10 px-3.5 rounded-xl bg-zinc-900/70 border border-white/8 text-zinc-100 text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 hover:border-white/14 transition-all duration-200" />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="sess-desc" className="block text-[13px] font-medium text-zinc-300 mb-1.5">
                    Goal <span className="text-zinc-600 font-normal">(optional)</span>
                  </label>
                  <textarea id="sess-desc" value={desc} onChange={e => setDesc(e.target.value)}
                    placeholder="What are you trying to find out?" rows={2} maxLength={200}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/70 border border-white/8 text-zinc-100 text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 hover:border-white/14 transition-all duration-200 resize-none leading-relaxed" />
                </div>

                {/* Dataset selection */}
                <div>
                  <p className="text-[13px] font-medium text-zinc-300 mb-2">
                    Attach datasets <span className="text-zinc-600 font-normal">(optional)</span>
                  </p>
                  {workspace.datasets.length === 0 ? (
                    <p className="text-[12px] text-zinc-700 py-2">No datasets in this workspace yet</p>
                  ) : (
                    <div className="space-y-1.5">
                      {workspace.datasets.map(ds => (
                        <button key={ds.id} type="button" onClick={() => toggle(ds.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-150 ${
                            selected.has(ds.id)
                              ? 'bg-primary/8 border-primary/25 text-white'
                              : 'border-white/6 hover:bg-white/4 hover:border-white/10 text-zinc-400'
                          }`}>
                          <div className={`w-4 h-4 rounded flex items-center justify-center border flex-shrink-0 transition-all ${
                            selected.has(ds.id) ? 'bg-primary border-primary' : 'border-white/20'
                          }`}>
                            {selected.has(ds.id) && (
                              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            )}
                          </div>
                          <Database className="w-3.5 h-3.5 text-accent flex-shrink-0" />
                          <span className="font-mono text-[13px] flex-1">{ds.name}</span>
                          <span className="text-[11px] text-zinc-600">{ds.rows.toLocaleString()} rows</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose}
                    className="flex-1 h-10 rounded-xl text-[14px] font-semibold text-zinc-400 bg-white/5 border border-white/8 hover:bg-white/8 hover:text-white transition-all duration-200">
                    Cancel
                  </button>
                  <motion.button type="submit" disabled={!name.trim()}
                    whileHover={name.trim() ? { y: -1 } : {}} whileTap={name.trim() ? { scale: 0.98 } : {}}
                    className={`flex-1 h-10 rounded-xl text-[14px] font-semibold text-white transition-all duration-200 ${
                      name.trim() ? 'bg-secondary hover:bg-[#7C3AED] shadow-[0_0_20px_rgba(139,92,246,0.25)]' : 'bg-secondary/30 cursor-not-allowed'
                    }`}>
                    Create Session
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

// ─── Session Card ─────────────────────────────────────────────────────────────
const card = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.38, ease: [0.22, 1, 0.36, 1] as const } }),
}

function SessionCard({ session, workspace, index, onClick }: {
  session: AnalysisSession; workspace: Workspace; index: number; onClick: () => void
}) {
  const attachedDatasets = workspace.datasets.filter(d => session.datasetIds.includes(d.id))

  return (
    <motion.div custom={index} variants={card} initial="hidden" animate="visible"
      className="bg-white/[0.025] border border-white/6 rounded-2xl p-5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200 flex flex-col gap-4 group cursor-pointer"
      onClick={onClick}>

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-secondary/12 border border-secondary/20 flex items-center justify-center flex-shrink-0">
            <FlaskConical className="w-4 h-4 text-secondary" />
          </div>
          <div className="min-w-0">
            <h3 className="text-[14px] font-semibold text-white truncate">{session.name}</h3>
            {session.description && (
              <p className="text-[12px] text-zinc-600 mt-0.5 truncate">{session.description}</p>
            )}
          </div>
        </div>
        <ArrowRight className="w-4 h-4 text-zinc-700 flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all duration-200 mt-0.5" />
      </div>

      {/* Dataset pills */}
      {attachedDatasets.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {attachedDatasets.map(ds => (
            <span key={ds.id} className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-accent/8 border border-accent/15 text-accent/80 rounded-md">
              <Database className="w-2.5 h-2.5" /> {ds.name}
            </span>
          ))}
        </div>
      )}

      {/* Stats row */}
      <div className="flex items-center gap-4 text-[11px] text-zinc-600">
        <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{session.messages.length} messages</span>
        <span className="flex items-center gap-1"><CheckSquare className="w-3 h-3" />{session.queries.length} queries</span>
        <span className="flex items-center gap-1"><BarChart2 className="w-3 h-3" />{session.charts.length} charts</span>
      </div>

      {/* Timestamp */}
      <div className="flex items-center gap-1.5 text-[11px] text-zinc-700 border-t border-white/4 pt-3">
        <Clock className="w-3 h-3" />
        Updated {session.updatedAt.includes('T') ? new Date(session.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : session.updatedAt}
      </div>
    </motion.div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AnalysisSessionsPage({ workspace, onOpenSession, onCreateSession }: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-[22px] font-bold text-white tracking-tight">Analysis Sessions</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">
            {workspace.sessions.length} session{workspace.sessions.length !== 1 ? 's' : ''} in this workspace
          </p>
        </div>
        <button type="button" onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-semibold text-white bg-secondary hover:bg-[#7C3AED] shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_28px_rgba(139,92,246,0.35)] transition-all duration-200">
          <Plus className="w-3.5 h-3.5" /> New Session
        </button>
      </div>

      {/* Grid */}
      {workspace.sessions.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {workspace.sessions.map((s, i) => (
            <SessionCard key={s.id} session={s} workspace={workspace} index={i} onClick={() => onOpenSession(s.id)} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center mx-auto mb-4">
            <FlaskConical className="w-7 h-7 text-secondary" />
          </div>
          <p className="text-[15px] font-semibold text-zinc-400 mb-1">No sessions yet</p>
          <p className="text-[13px] text-zinc-700 mb-5">Create a session to start analysing your datasets with AI</p>
          <button type="button" onClick={() => setModalOpen(true)}
            className="h-9 px-5 rounded-xl text-[13px] font-semibold text-white bg-secondary hover:bg-[#7C3AED] transition-colors">
            Create First Session
          </button>
        </div>
      )}

      <NewSessionModal workspace={workspace} open={modalOpen} onClose={() => setModalOpen(false)} onCreate={onCreateSession} />
    </div>
  )
}
