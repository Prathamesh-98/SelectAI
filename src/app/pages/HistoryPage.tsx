import { useState } from 'react'
import { motion }   from 'framer-motion'
import { Upload, BookMarked, BarChart2, FlaskConical, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import { useWorkspace } from '../WorkspaceContext'
import type { HistoryEntry, HistoryType } from '../types'

type Filter = 'all' | HistoryType

const FILTERS: { label: string; value: Filter }[] = [
  { label: 'All',      value: 'all'     },
  { label: 'Uploads',  value: 'upload'  },
  { label: 'Queries',  value: 'query'   },
  { label: 'Charts',   value: 'chart'   },
  { label: 'Sessions', value: 'session' },
]

const TYPE_CFG: Record<HistoryType, { icon: React.FC<{ className?: string }>; color: string }> = {
  upload:  { icon: Upload,      color: 'text-accent'    },
  query:   { icon: BookMarked,  color: 'text-primary'   },
  chart:   { icon: BarChart2,   color: 'text-amber-400' },
  session: { icon: FlaskConical, color: 'text-secondary' },
}

function HistoryRow({ entry, index }: { entry: HistoryEntry; index: number }) {
  const { icon: Icon, color } = TYPE_CFG[entry.type]
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="flex items-start gap-4 px-4 py-3.5 hover:bg-white/[0.025] rounded-xl transition-colors duration-150"
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-xl bg-white/4 border border-white/6 flex items-center justify-center mt-0.5">
        <Icon className={`w-3.5 h-3.5 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] text-zinc-300 font-medium leading-snug">{entry.description}</p>
        {entry.detail && <p className="text-[11px] text-zinc-700 mt-0.5 font-mono">{entry.detail}</p>}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {entry.status === 'success'
          ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500 opacity-60" />
          : <AlertCircle  className="w-3.5 h-3.5 text-red-500" />
        }
        <span className="text-[11px] text-zinc-700">{entry.createdAt}</span>
      </div>
    </motion.div>
  )
}

export function HistoryPage() {
  const { activeWorkspace: workspace } = useWorkspace()
  const [filter, setFilter] = useState<Filter>('all')

  const entries = filter === 'all'
    ? workspace.history
    : workspace.history.filter(e => e.type === filter)

  return (
    <div className="p-6 lg:p-8 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-white tracking-tight">History</h1>
        <p className="text-[13px] text-zinc-500 mt-0.5">Activity log for the {workspace.name} workspace</p>
      </div>

      {/* Filter tabs */}
      <div className="flex flex-wrap gap-1.5">
        {FILTERS.map(f => (
          <button key={f.value} type="button" onClick={() => setFilter(f.value)}
            className={`h-8 px-3.5 rounded-lg text-[12px] font-semibold transition-all duration-150 ${
              filter === f.value
                ? 'bg-primary/15 text-primary border border-primary/25'
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5 border border-transparent'
            }`}>
            {f.label}
            {f.value !== 'all' && (
              <span className="ml-1.5 text-[10px] opacity-60">
                ({workspace.history.filter(e => e.type === f.value).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* List */}
      {entries.length > 0 ? (
        <div className="bg-white/[0.015] border border-white/5 rounded-2xl divide-y divide-white/[0.04] overflow-hidden">
          {entries.map((entry, i) => <HistoryRow key={entry.id} entry={entry} index={i} />)}
        </div>
      ) : (
        <div className="text-center py-16">
          <Clock className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-[14px] font-semibold text-zinc-500 mb-1">
            {filter === 'all' ? 'No activity yet' : `No ${filter} events`}
          </p>
          <p className="text-[12px] text-zinc-700">Activity appears here as you use this workspace</p>
        </div>
      )}
    </div>
  )
}
