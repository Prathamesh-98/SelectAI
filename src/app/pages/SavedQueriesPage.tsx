import { useEffect, useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  BookMarked, Play, Search, X, Star, Pin, MoreVertical, 
  Trash2, Edit2, Copy, Filter 
} from 'lucide-react'

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days}d`
  const hours = Math.floor(diff / 3600000)
  if (hours > 0) return `${hours}h`
  const minutes = Math.floor(diff / 60000)
  return `${minutes}m`
}

import { useWorkspace } from '../WorkspaceContext'
import { useSavedQueries } from '../SavedQueryContext'
import { SQLCodeBlock } from '../../design-system/components/SQLCodeBlock'
import { ResultTable } from './SessionDetailPage'
import { QueryChart } from '../../design-system/components/QueryChart'
import { InsightsCard } from '../../design-system/components/InsightsCard'
import { ExportModal } from '../../design-system/components/ExportModal'
import { Download } from 'lucide-react'
import type { SavedQuery, SavedQueryExecutionResult } from '../types'
import { useToast } from '../../design-system/components/Toast'

const card = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.05, duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } }),
}

function QueryCard({ 
  q, index, 
  onRun, onFavorite, onPin, onDelete 
}: { 
  q: SavedQuery; 
  index: number;
  onRun: (id: string) => Promise<SavedQueryExecutionResult>;
  onFavorite: (id: string, is_fav: boolean) => void;
  onPin: (id: string, is_pinned: boolean) => void;
  onDelete: (id: string) => void;
}) {
  const [running, setRunning] = useState(false)
  const [result, setResult] = useState<SavedQueryExecutionResult | null>(null)
  const [exportOpen, setExportOpen] = useState(false)
  
  const run = async () => { 
    setRunning(true)
    try {
      const res = await onRun(q.id)
      setResult(res)
    } finally {
      setRunning(false)
    }
  }

  return (
    <motion.div custom={index} variants={card} initial="hidden" animate="visible"
      className="bg-white/[0.025] border border-white/6 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200">
      
      {/* Header */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            {q.is_pinned && <Pin className="w-3.5 h-3.5 text-blue-400" />}
            <h3 className="text-[14px] font-semibold text-white leading-snug">{q.name}</h3>
          </div>
          <div className="flex gap-2 text-zinc-400">
            <button onClick={() => onFavorite(q.id, !q.is_favorite)} className="hover:text-yellow-400 transition-colors">
              <Star className={`w-4 h-4 ${q.is_favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
            </button>
            <button onClick={() => onPin(q.id, !q.is_pinned)} className="hover:text-blue-400 transition-colors">
              <Pin className={`w-4 h-4 ${q.is_pinned ? 'fill-blue-400 text-blue-400' : ''}`} />
            </button>
            <button onClick={() => onDelete(q.id)} className="hover:text-red-400 transition-colors">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-[12px] text-zinc-400 mt-1">{q.description || 'No description provided.'}</p>
        <div className="flex items-center gap-3 mt-3">
          <p className="text-[11px] text-zinc-600">Created: {formatTimeAgo(q.created_at)} ago</p>
          <p className="text-[11px] text-zinc-600">Runs: {q.execution_count}</p>
          <p className="text-[11px] text-zinc-600">v{q.version}</p>
        </div>
        {q.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {q.tags.map(t => (
              <span key={t} className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                #{t}
              </span>
            ))}
          </div>
        )}
      </div>

      <SQLCodeBlock code={q.generated_sql} showLineNums={false} maxHeight={120} />
      
      <button type="button" onClick={run} disabled={running}
        className={`self-start flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold transition-all duration-200 ${
          running ? 'bg-primary/20 text-primary/60 cursor-wait' : 'bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20'
        }`}>
        {running ? <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <Play className="w-3 h-3" />}
        {running ? 'Running...' : 'Run Again'}
      </button>

      {/* Execution Results inline */}
      {result && (
        <div className="mt-4 pt-4 border-t border-white/10 flex flex-col gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          {result.error ? (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-[13px]">
              {result.error}
            </div>
          ) : (
            <>
              {result.execution_result && (
                <ResultTable result={result.execution_result} />
              )}
              {result.chart_data && result.chart_data.chart_type !== 'none' && (
                <QueryChart data={result.chart_data} />
              )}
              {result.insight_data && (
                <InsightsCard data={result.insight_data} />
              )}
              
              <div className="flex w-full justify-end mt-1">
                <button 
                  onClick={() => setExportOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" /> Export Results
                </button>
              </div>
            </>
          )}
        </div>
      )}

      <ExportModal
        isOpen={exportOpen}
        onClose={() => setExportOpen(false)}
        payload={{
          workspace_id: q.workspace_id,
          saved_query_id: q.id,
          execution_result: result?.execution_result?.rows || [],
          insight_data: result?.insight_data,
          execution_time_ms: result?.execution_result?.execution_time_ms,
          row_count: result?.execution_result?.rows?.length || 0,
          saved_query_name: q.name,
          user_question: q.user_prompt,
          generated_sql: q.generated_sql
        }}
      />
    </motion.div>
  )
}

export function SavedQueriesPage() {
  const { activeWorkspace } = useWorkspace()
  const { queries, loadQueries, favorite, pin, deleteQuery, execute, isLoading } = useSavedQueries()
  const toast = useToast()

  const [search, setSearch] = useState('')
  const [favoriteOnly, setFavoriteOnly] = useState(false)
  const [pinnedOnly, setPinnedOnly] = useState(false)

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadQueries({
        workspace_id: activeWorkspace.id,
        search: search || undefined,
        favorite_only: favoriteOnly,
        pinned_only: pinnedOnly,
        page: 1,
        page_size: 50
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [activeWorkspace.id, search, favoriteOnly, pinnedOnly, loadQueries])

  const handleFavorite = async (id: string, is_fav: boolean) => {
    try { await favorite(id, is_fav) } 
    catch { toast.add({ variant: 'error', title: "Failed to update favorite status" }) }
  }

  const handlePin = async (id: string, is_pinned: boolean) => {
    try { await pin(id, is_pinned) } 
    catch { toast.add({ variant: 'error', title: "Failed to update pinned status" }) }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Delete this saved query?")) {
      try { 
        await deleteQuery(id) 
        toast.add({ variant: 'success', title: "Query deleted" })
      } catch { 
        toast.add({ variant: 'error', title: "Failed to delete query" }) 
      }
    }
  }

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-[22px] font-bold text-white tracking-tight">Saved Queries</h1>
          <p className="text-[13px] text-zinc-500 mt-1">
            Manage, tag, and execute your library of saved SQL queries.
          </p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setFavoriteOnly(!favoriteOnly)}
            className={`h-9 px-3 rounded-lg text-[13px] font-medium transition-colors border ${favoriteOnly ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'}`}
          >
            Favorites
          </button>
          <button 
            onClick={() => setPinnedOnly(!pinnedOnly)}
            className={`h-9 px-3 rounded-lg text-[13px] font-medium transition-colors border ${pinnedOnly ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10'}`}
          >
            Pinned
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64 flex-shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search queries, tags, SQL..."
            className="w-full h-9 pl-9 pr-9 bg-white/[0.04] border border-white/10 rounded-lg text-[13px] text-white placeholder-zinc-500 focus:outline-none focus:border-primary/50 focus:bg-white/[0.06] transition-colors"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence mode="popLayout">
          {queries.map((q, i) => (
            <QueryCard 
              key={q.id} 
              q={q} 
              index={i} 
              onRun={execute}
              onFavorite={handleFavorite}
              onPin={handlePin}
              onDelete={handleDelete}
            />
          ))}
          {queries.length === 0 && !isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="col-span-full py-16 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                <BookMarked className="w-6 h-6 text-zinc-600" />
              </div>
              <h3 className="text-[14px] font-semibold text-white mb-1">No queries found</h3>
              <p className="text-[13px] text-zinc-500">We couldn't find any saved queries matching your filters.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
