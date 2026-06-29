import React from 'react'
import { BarChart2, Download, RefreshCw, MoreHorizontal } from 'lucide-react'
import { motion } from 'framer-motion'
import { IconButton } from './Button'

// ─── ChartContainer ───────────────────────────────────────────────────────────
export interface LegendItem { label: string; color: string }

export interface ChartContainerProps {
  title:        string
  description?: string
  legend?:      LegendItem[]
  toolbar?:     React.ReactNode
  onExport?:    () => void
  onRefresh?:   () => void
  loading?:     boolean
  empty?:       boolean
  emptyText?:   string
  height?:      number
  children?:    React.ReactNode
  className?:   string
}

export function ChartContainer({
  title,
  description,
  legend,
  toolbar,
  onExport,
  onRefresh,
  loading    = false,
  empty      = false,
  emptyText  = 'No data available for the selected period.',
  height     = 220,
  children,
  className  = '',
}: ChartContainerProps) {
  return (
    <div className={`rounded-2xl bg-[#18181B] border border-white/[0.06] overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-4 border-b border-white/6">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <BarChart2 className="w-4 h-4 text-primary" />
            <h3 className="text-[14px] font-semibold text-zinc-100">{title}</h3>
          </div>
          {description && (
            <p className="text-[12px] text-zinc-500 ml-6">{description}</p>
          )}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {toolbar}
          {onRefresh && (
            <IconButton icon={<RefreshCw className="w-3.5 h-3.5" />} label="Refresh" size="sm" onClick={onRefresh} />
          )}
          {onExport && (
            <IconButton icon={<Download className="w-3.5 h-3.5" />} label="Export" size="sm" onClick={onExport} />
          )}
        </div>
      </div>

      {/* Legend */}
      {legend && legend.length > 0 && (
        <div className="flex flex-wrap gap-4 px-5 py-3 border-b border-white/4">
          {legend.map(item => (
            <div key={item.label} className="flex items-center gap-1.5 text-[12px] text-zinc-500">
              <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: item.color }} />
              {item.label}
            </div>
          ))}
        </div>
      )}

      {/* Chart area */}
      <div className="relative px-5 py-4" style={{ height }}>
        {loading ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              <p className="text-[12px] text-zinc-600">Loading chart…</p>
            </div>
          </div>
        ) : empty ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/4 flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-zinc-700" />
            </div>
            <p className="text-[13px] text-zinc-600 max-w-xs text-center">{emptyText}</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="h-full"
          >
            {children}
          </motion.div>
        )}
      </div>
    </div>
  )
}

// ─── InlineBarChart (demo chart built with divs) ──────────────────────────────
export interface BarDataPoint { label: string; value: number; color?: string }

export interface InlineBarChartProps {
  data:       BarDataPoint[]
  maxValue?:  number
  showLabels?: boolean
  className?: string
}

export function InlineBarChart({ data, maxValue, showLabels = true, className = '' }: InlineBarChartProps) {
  const max = maxValue ?? Math.max(...data.map(d => d.value), 1)

  return (
    <div className={`flex items-end gap-2 h-full w-full ${className}`}>
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
          <motion.div
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            transition={{ delay: i * 0.04, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            style={{
              height:          `${(d.value / max) * 100}%`,
              backgroundColor: d.color ?? '#3B82F6',
              transformOrigin: 'bottom',
            }}
            className="w-full rounded-t-md min-h-[4px] opacity-80 hover:opacity-100 transition-opacity cursor-default"
            title={`${d.label}: ${d.value}`}
          />
          {showLabels && (
            <span className="text-[10px] text-zinc-600 truncate w-full text-center">{d.label}</span>
          )}
        </div>
      ))}
    </div>
  )
}
