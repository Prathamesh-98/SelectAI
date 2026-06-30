import { useState } from 'react'
import { motion } from 'framer-motion'
import { BookMarked, Play, Search, X } from 'lucide-react'
import { SQLCodeBlock } from '../../design-system/components/SQLCodeBlock'
import { useWorkspace } from '../WorkspaceContext'
import type { SavedQuery } from '../types'

const card = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.35, ease: [0.22, 1, 0.36, 1] as const } }),
}

function QueryCard({ q, index }: { q: SavedQuery; index: number }) {
  const [running, setRunning] = useState(false)
  const run = () => { setRunning(true); setTimeout(() => setRunning(false), 1600) }

  return (
    <motion.div custom={index} variants={card} initial="hidden" animate="visible"
      className="bg-white/[0.025] border border-white/6 rounded-2xl p-5 flex flex-col gap-4 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200">
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-[14px] font-semibold text-white leading-snug">{q.title}</h3>
          <span className="text-[10px] font-mono text-zinc-700 flex-shrink-0 mt-0.5 bg-white/5 px-1.5 py-0.5 rounded">{q.datasetName}</span>
        </div>
        <p className="text-[11px] text-zinc-700">Saved {q.createdAt} · Run {q.runCount}×</p>
      </div>
      <SQLCodeBlock code={q.sql} showLineNums={false} maxHeight={120} />
      <button type="button" onClick={run} disabled={running}
        className={`self-start flex items-center gap-1.5 h-8 px-3 rounded-lg text-[12px] font-semibold transition-all duration-200 ${
          running ? 'bg-primary/20 text-primary/60 cursor-wait' : 'bg-primary/15 text-primary hover:bg-primary/25 border border-primary/20'
        }`}>
        {running ? <svg className="w-3 h-3 animate-spin" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> : <Play className="w-3 h-3" />}
        {running ? 'Running…' : 'Run Query'}
      </button>
    </motion.div>
  )
}

export function QueryLibraryPage() {
  const { activeWorkspace: workspace } = useWorkspace()
  const [search, setSearch] = useState('')
  const filtered = workspace.savedQueries.filter(q =>
    q.title.toLowerCase().includes(search.toLowerCase()) || q.datasetName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-[22px] font-bold text-white tracking-tight">Query Library</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">{workspace.savedQueries.length} queries saved in this workspace</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
        <input type="search" placeholder="Search queries…" value={search} onChange={e => setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-4 rounded-xl bg-zinc-900/60 border border-white/8 text-zinc-200 text-[13px] placeholder:text-zinc-600 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15 transition-all" />
        {search && <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300"><X className="w-3.5 h-3.5" /></button>}
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filtered.map((q, i) => <QueryCard key={q.id} q={q} index={i} />)}
        </div>
      ) : (
        <div className="text-center py-16">
          <BookMarked className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-[14px] font-semibold text-zinc-500 mb-1">{search ? `No queries match "${search}"` : 'No saved queries yet'}</p>
          <p className="text-[12px] text-zinc-700">{search ? 'Try a different search term' : 'Queries saved from Analysis Sessions appear here'}</p>
        </div>
      )}
    </div>
  )
}
