import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence }     from 'framer-motion'
import { useParams, useNavigate }      from 'react-router-dom'
import {
  ArrowLeft, FlaskConical, Database, MessageSquare,
  CheckSquare, BarChart2, Lightbulb, Send, Sparkles,
  BookmarkPlus, Clock, Play, MoreHorizontal, Edit, Trash2
} from 'lucide-react'
import { SQLCodeBlock }  from '../../design-system/components/SQLCodeBlock'
import { useWorkspace }  from '../WorkspaceContext'
import { useDatasets }   from '../DatasetContext'
import { useSessions }   from '../SessionContext'
import type { AnalysisSession, AIMessage, BarDataPoint, Workspace, Dataset } from '../types'
import { Dropdown }      from '../../design-system/components/Dropdown'
import { EditSessionModal, ArchiveSessionModal } from './SessionModals'
import { MessageProvider, useMessages } from '../MessageContext'

type Tab = 'analyst' | 'queries' | 'charts' | 'insights'

// ─── Mini bar chart (reusable within session) ─────────────────────────────────
function MiniBar({ data }: { data: BarDataPoint[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1 h-24 pt-2">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div initial={{ height: 0 }} animate={{ height: `${(d.value / max) * 100}%` }}
            transition={{ duration: 0.55, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="w-full rounded-t-md min-h-[2px]" style={{ backgroundColor: d.color ?? '#8B5CF6' }} />
          <span className="text-[9px] text-zinc-600 w-full text-center truncate">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

// ─── AI Analyst Tab ───────────────────────────────────────────────────────────
function AIAnalystTab({ session, workspace, onUpdate }: { session: AnalysisSession; workspace: Workspace; onUpdate: (patch: Partial<AnalysisSession>) => void }) {
  const { messages, sendMessage, isLoading: messagesLoading } = useMessages()
  const [input,      setInput]      = useState('')
  const [responding, setResponding] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const datasets  = workspace.datasets.filter((d: Dataset) => session.datasetIds.includes(d.id))

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages.length, responding])

  const send = async () => {
    if (!input.trim() || responding) return
    const text = input.trim(); 
    setInput('')
    setResponding(true)

    try {
      await sendMessage(text)
    } finally {
      setResponding(false)
    }
  }

  const SUGGESTIONS = [
    'Show the distribution of rows across categories',
    'Find columns with the most missing values',
    'Summarise the top 10 records',
    'Show the count of unique values per column',
  ]

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Dataset context bar */}
      {datasets.length > 0 && (
        <div className="flex items-center gap-2 px-6 py-2.5 bg-accent/4 border-b border-accent/10 flex-shrink-0">
          <Database className="w-3.5 h-3.5 text-accent flex-shrink-0" />
          <span className="text-[11px] text-zinc-500">Querying:</span>
          {datasets.map(d => (
            <span key={d.id} className="text-[11px] font-mono text-accent/80 bg-accent/8 border border-accent/15 px-2 py-0.5 rounded-md">{d.name}</span>
          ))}
        </div>
      )}

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-10 space-y-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/20 to-primary/20 border border-secondary/20 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-secondary" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-white mb-1">AI Analyst ready</h3>
              <p className="text-[13px] text-zinc-600">{datasets.length > 0 ? `${datasets.length} dataset${datasets.length > 1 ? 's' : ''} attached to this session` : 'No datasets attached — go to Settings to add some'}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {SUGGESTIONS.map(s => (
                <button key={s} type="button" onClick={() => setInput(s)}
                  className="text-left px-4 py-3 rounded-xl bg-white/[0.03] border border-white/6 text-[12px] text-zinc-500 hover:bg-white/[0.06] hover:text-zinc-300 transition-all duration-150">{s}</button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-secondary to-primary flex items-center justify-center flex-shrink-0 mt-0.5 mr-2.5">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <div className={`max-w-[85%] space-y-2 flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`px-4 py-3 rounded-2xl text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-white/[0.05] border border-white/8 text-zinc-300 rounded-bl-sm'
                  }`}>{msg.content}</div>
                  {msg.sql && <div className="w-full"><SQLCodeBlock code={msg.sql} showLineNums={false} maxHeight={180} /></div>}
                </div>
              </motion.div>
            ))}
            {responding && (
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-secondary to-primary flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-3.5 h-3.5 text-white" />
                </div>
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                    <motion.div key={i} animate={{ scale: [1,1.4,1] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.16 }}
                      className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </>
        )}
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-6 pb-5">
        <div className="flex items-end gap-2 bg-white/[0.03] border border-white/10 rounded-2xl p-2 focus-within:border-secondary/30 transition-colors">
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
            placeholder="Ask the AI Analyst about your data… (Enter to send)"
            rows={1} className="flex-1 bg-transparent text-zinc-200 text-[14px] placeholder:text-zinc-600 resize-none focus:outline-none py-1.5 px-2 leading-relaxed max-h-32 overflow-y-auto" />
          <button type="button" onClick={send} disabled={!input.trim() || responding}
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              input.trim() && !responding ? 'bg-secondary hover:bg-[#7C3AED] text-white shadow-[0_0_16px_rgba(139,92,246,0.3)]' : 'bg-white/5 text-zinc-700 cursor-not-allowed'
            }`}>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Queries Tab ──────────────────────────────────────────────────────────────
function QueriesTab({ session, onUpdate }: { session: AnalysisSession; onUpdate: (patch: Partial<AnalysisSession>) => void }) {
  const [running, setRunning] = useState<string | null>(null)
  const run = (id: string) => { setRunning(id); setTimeout(() => setRunning(null), 1600) }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
      {session.queries.length === 0 ? (
        <div className="text-center py-16">
          <CheckSquare className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-[14px] font-semibold text-zinc-500 mb-1">No queries yet</p>
          <p className="text-[12px] text-zinc-700">SQL generated by the AI Analyst will appear here</p>
        </div>
      ) : (
        session.queries.map((q, i) => (
          <motion.div key={q.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.3 }}
            className="bg-white/[0.025] border border-white/6 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h3 className="text-[14px] font-semibold text-white">{q.title}</h3>
                <p className="text-[11px] text-zinc-700 mt-0.5 flex items-center gap-1"><Clock className="w-3 h-3" />Ran {q.ranAt}</p>
              </div>
              <button type="button" onClick={() => run(q.id)} disabled={running === q.id}
                className={`flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold transition-all duration-200 flex-shrink-0 ${
                  running === q.id ? 'bg-primary/20 text-primary/60 cursor-wait' : 'bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20'
                }`}>
                {running === q.id ? <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <Play className="w-3 h-3" />}
                {running === q.id ? 'Running…' : 'Run'}
              </button>
            </div>
            <SQLCodeBlock code={q.sql} showLineNums={false} maxHeight={140} />
            <button type="button" className="flex items-center gap-1.5 text-[12px] text-zinc-600 hover:text-primary transition-colors">
              <BookmarkPlus className="w-3.5 h-3.5" /> Save to Query Library
            </button>
          </motion.div>
        ))
      )}
    </div>
  )
}

// ─── Charts Tab ───────────────────────────────────────────────────────────────
function ChartsTab({ session }: { session: AnalysisSession }) {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-5">
      {session.charts.length === 0 ? (
        <div className="text-center py-16">
          <BarChart2 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-[14px] font-semibold text-zinc-500 mb-1">No visualisations yet</p>
          <p className="text-[12px] text-zinc-700">Ask the AI Analyst to visualise data — charts appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {session.charts.map((ch, i) => (
            <motion.div key={ch.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08, duration: 0.35 }}
              className="bg-white/[0.025] border border-white/6 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-[14px] font-semibold text-white">{ch.title}</h3>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full">{ch.type} chart</span>
              </div>
              <div className="bg-white/[0.02] rounded-xl p-4 border border-white/4"><MiniBar data={ch.data} /></div>
              <button type="button" className="flex items-center gap-1.5 text-[12px] text-zinc-600 hover:text-amber-400 transition-colors">
                <BookmarkPlus className="w-3.5 h-3.5" /> Save to Analytics
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Insights Tab ─────────────────────────────────────────────────────────────
function InsightsTab({ session, onUpdate }: { session: AnalysisSession; onUpdate: (patch: Partial<AnalysisSession>) => void }) {
  const [generating, setGenerating] = useState(false)

  const generate = () => {
    setGenerating(true)
    setTimeout(() => {
      const newInsight = 'Based on the data in this session, the analysis reveals a clear pattern across the selected dimensions. The distribution shows consistent structure with notable variation in the top segments. Further drill-down into subcategories may surface additional patterns worth investigating.'
      onUpdate({ insights: [...session.insights, newInsight], updatedAt: new Date().toISOString() })
      setGenerating(false)
    }, 2000)
  }

  return (
    <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
      {/* Generate button */}
      <div className="flex justify-end">
        <button type="button" onClick={generate} disabled={generating}
          className={`flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
            generating ? 'bg-amber-500/20 text-amber-400/60 cursor-wait' : 'bg-amber-500/15 text-amber-400 hover:bg-amber-500/25 border border-amber-500/20'
          }`}>
          {generating ? <svg className="w-3.5 h-3.5 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <Sparkles className="w-3.5 h-3.5" />}
          {generating ? 'Generating…' : 'Generate Insights'}
        </button>
      </div>

      {session.insights.length === 0 && !generating ? (
        <div className="text-center py-12">
          <Lightbulb className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-[14px] font-semibold text-zinc-500 mb-1">No insights yet</p>
          <p className="text-[12px] text-zinc-700">Click "Generate Insights" to produce an AI summary of this session</p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {session.insights.map((insight, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.35 }}
                className="bg-amber-500/[0.04] border border-amber-500/12 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span className="text-[12px] font-bold uppercase tracking-wider text-amber-400/70">AI Insight {i + 1}</span>
                </div>
                <p className="text-[14px] text-zinc-300 leading-relaxed">{insight}</p>
              </motion.div>
            ))}
          </AnimatePresence>
          {generating && (
            <div className="bg-amber-500/[0.04] border border-amber-500/12 border-dashed rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span className="text-[12px] font-bold uppercase tracking-wider text-amber-400/70">Analysing…</span>
              </div>
              <div className="space-y-2">
                {[80,60,70].map((w, i) => (
                  <div key={i} className="h-3 rounded-full bg-white/5 animate-pulse" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Session Detail Page ──────────────────────────────────────────────────────
export function SessionDetailPage() {
  const { sessionId }  = useParams<{ sessionId: string }>()
  const navigate       = useNavigate()
  const { activeWorkspace } = useWorkspace()
  const { datasets } = useDatasets()
  const { getSession, updateSession } = useSessions()

  const session = getSession(sessionId ?? '')
  const workspace = {
    ...activeWorkspace,
    datasets: datasets
  }

  const [activeTab, setActiveTab] = useState<Tab>('analyst')
  const [editOpen, setEditOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)

  // ── Session not found ────────────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-[15px] font-semibold text-zinc-400">Session not found</p>
        <button type="button" onClick={() => navigate('/sessions')}
          className="h-9 px-5 rounded-xl text-[13px] font-semibold text-white bg-secondary hover:bg-[#7C3AED] transition-colors">
          Back to Sessions
        </button>
      </div>
    )
  }

  const onBack   = () => navigate('/sessions')
  const onUpdate = (patch: Partial<AnalysisSession>) => updateSession(session.id, patch)

  const attachedDatasets = workspace.datasets.filter(d => session.datasetIds.includes(d.id))

  const TABS: { id: Tab; label: string; icon: React.FC<{ className?: string }>; badge?: number }[] = [
    { id: 'analyst',  label: 'AI Analyst',     icon: MessageSquare, badge: session.messages.length || undefined },
    { id: 'queries',  label: 'Queries',         icon: CheckSquare,   badge: session.queries.length  || undefined },
    { id: 'charts',   label: 'Visualisations',  icon: BarChart2,     badge: session.charts.length   || undefined },
    { id: 'insights', label: 'Insights',         icon: Lightbulb,    badge: session.insights.length || undefined },
  ]

  return (
    <MessageProvider>
      <div className="flex flex-col h-full overflow-hidden">
        {/* ── Header ── */}
        <div className="flex-shrink-0 border-b border-white/[0.06] bg-[#09090B]">
          {/* Top bar */}
          <div className="flex items-center gap-3 px-6 py-4">
            <button type="button" onClick={onBack}
              className="flex items-center gap-1.5 text-[12px] font-medium text-zinc-600 hover:text-zinc-300 transition-colors group">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform duration-150" />
              Analysis Sessions
            </button>
            <span className="text-zinc-800">/</span>
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-secondary/15 border border-secondary/20 flex items-center justify-center">
                <FlaskConical className="w-3 h-3 text-secondary" />
              </div>
              <h1 className="text-[15px] font-bold text-white">{session.name}</h1>
            </div>
            {/* Dataset pills */}
            {attachedDatasets.length > 0 && (
              <div className="flex items-center gap-1.5 ml-1">
                {attachedDatasets.map(ds => (
                  <span key={ds.id} className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 bg-accent/8 border border-accent/15 text-accent/70 rounded-md">
                    <Database className="w-2.5 h-2.5" />{ds.name}
                  </span>
                ))}
              </div>
            )}
            {/* Timestamp and Actions */}
            <div className="ml-auto flex items-center gap-3">
              <span className="flex items-center gap-1 text-[11px] text-zinc-700">
                <Clock className="w-3 h-3" />
                Updated {session.updatedAt.includes('T') ? new Date(session.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : session.updatedAt}
              </span>
              <Dropdown
                placement="bottom-end"
                trigger={
                  <button type="button" className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors border border-transparent hover:border-white/10">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                }
                items={[
                  { key: 'edit', label: 'Edit Session', icon: <Edit className="w-3.5 h-3.5" /> },
                  { key: 'archive', label: 'Archive Session', icon: <Trash2 className="w-3.5 h-3.5" />, danger: true }
                ]}
                onSelect={(key) => {
                  if (key === 'edit') setEditOpen(true)
                  if (key === 'archive') setArchiveOpen(true)
                }}
              />
            </div>
          </div>

          {/* Tab bar */}
          <div className="flex items-center gap-1 px-4 pb-0">
            {TABS.map(tab => {
              const Icon = tab.icon
              const active = activeTab === tab.id
              return (
                <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-4 py-2.5 text-[13px] font-medium transition-all duration-150 ${
                    active ? 'text-white' : 'text-zinc-600 hover:text-zinc-300'
                  }`}>
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                  {tab.badge !== undefined && tab.badge > 0 && (
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${active ? 'bg-secondary/20 text-secondary' : 'bg-white/6 text-zinc-600'}`}>
                      {tab.badge}
                    </span>
                  )}
                  {active && (
                    <motion.div layoutId="session-tab-indicator"
                      className="absolute bottom-0 left-4 right-4 h-[2px] bg-secondary rounded-t-full"
                      transition={{ type: 'spring', stiffness: 400, damping: 40 }} />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* ── Tab content ── */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }} className="flex flex-col flex-1 overflow-hidden">
              {activeTab === 'analyst'  && <AIAnalystTab  session={session} workspace={workspace} onUpdate={onUpdate} />}
              {activeTab === 'queries'  && <QueriesTab    session={session} onUpdate={onUpdate} />}
              {activeTab === 'charts'   && <ChartsTab     session={session} />}
              {activeTab === 'insights' && <InsightsTab   session={session} onUpdate={onUpdate} />}
            </motion.div>
          </AnimatePresence>
        </div>

        <EditSessionModal session={session} open={editOpen} onClose={() => setEditOpen(false)} />
        <ArchiveSessionModal session={session} open={archiveOpen} onClose={() => setArchiveOpen(false)} onArchived={() => navigate('/sessions')} />
      </div>
    </MessageProvider>
  )
}
