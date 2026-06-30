import { motion } from 'framer-motion'
import { BarChart2 } from 'lucide-react'
import { useWorkspace } from '../WorkspaceContext'
import type { SavedChart, BarDataPoint } from '../types'

const card = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.38, ease: [0.22, 1, 0.36, 1] as const } }),
}

function MiniBar({ data }: { data: BarDataPoint[] }) {
  const max = Math.max(...data.map(d => d.value), 1)
  return (
    <div className="flex items-end gap-1 h-20">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1">
          <motion.div initial={{ height: 0 }} animate={{ height: `${(d.value / max) * 100}%` }}
            transition={{ duration: 0.55, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="w-full rounded-t-sm" style={{ backgroundColor: d.color ?? '#3B82F6', minHeight: 2 }} />
          <span className="text-[9px] text-zinc-600 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  )
}

function ChartCard({ ch, index }: { ch: SavedChart; index: number }) {
  return (
    <motion.div custom={index} variants={card} initial="hidden" animate="visible"
      className="bg-white/[0.025] border border-white/6 rounded-2xl p-5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200 flex flex-col gap-4">
      <div>
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="text-[14px] font-semibold text-white leading-snug">{ch.title}</h3>
          <span className="text-[10px] font-mono text-zinc-700 bg-white/5 px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5">{ch.datasetName}</span>
        </div>
        {ch.description && <p className="text-[12px] text-zinc-600 leading-relaxed">{ch.description}</p>}
      </div>
      <div className="bg-white/[0.02] rounded-xl p-4 border border-white/4"><MiniBar data={ch.data} /></div>
      <div className="flex items-center justify-between">
        <span className="text-[11px] text-zinc-700">Saved {ch.createdAt}</span>
        {ch.sessionId && <span className="text-[10px] text-zinc-700">From session</span>}
      </div>
    </motion.div>
  )
}

export function AnalyticsPage() {
  const { activeWorkspace: workspace } = useWorkspace()
  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-[22px] font-bold text-white tracking-tight">Analytics</h1>
        <p className="text-[13px] text-zinc-500 mt-0.5">
          {workspace.savedCharts.length} visualisation{workspace.savedCharts.length !== 1 ? 's' : ''} saved in this workspace
        </p>
      </div>

      {workspace.savedCharts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {workspace.savedCharts.map((ch, i) => <ChartCard key={ch.id} ch={ch} index={i} />)}
        </div>
      ) : (
        <div className="text-center py-16">
          <BarChart2 className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-[14px] font-semibold text-zinc-500 mb-1">No saved visualisations</p>
          <p className="text-[12px] text-zinc-700">Charts saved from Analysis Sessions appear here</p>
        </div>
      )}
    </div>
  )
}
