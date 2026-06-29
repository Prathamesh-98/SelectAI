import React from 'react'
import { motion } from 'framer-motion'
import { FileText, Upload, CheckCircle2, AlertCircle, Loader2, MoreHorizontal, Clock, Database } from 'lucide-react'
import { StatusChip } from './Badge'
import { IconButton } from './Button'

// ─── Types ────────────────────────────────────────────────────────────────────
export type DatasetStatus = 'ready' | 'processing' | 'error' | 'idle'

export interface DatasetCardProps {
  name:        string
  rows?:       number
  columns?:    string[]
  size?:       string           // e.g. "2.4 MB"
  status:      DatasetStatus
  uploadedAt?: string
  onQuery?:    () => void
  onDelete?:   () => void
  onMore?:     () => void
  className?:  string
}

const statusMap: Record<DatasetStatus, { chip: DatasetStatus; icon: React.ReactNode; accent: string }> = {
  ready:      { chip: 'ready',      icon: <CheckCircle2 className="w-4 h-4 text-accent" />,   accent: 'border-accent/15 bg-accent/5' },
  processing: { chip: 'processing', icon: <Loader2 className="w-4 h-4 text-primary animate-spin" />, accent: 'border-primary/15 bg-primary/5' },
  error:      { chip: 'error',      icon: <AlertCircle className="w-4 h-4 text-red-400" />,   accent: 'border-red-500/15 bg-red-500/5' },
  idle:       { chip: 'idle',       icon: <Database className="w-4 h-4 text-zinc-500" />,     accent: 'border-white/8 bg-white/3' },
}

export function DatasetCard({
  name, rows, columns, size, status,
  uploadedAt, onQuery, onDelete, onMore, className = '',
}: DatasetCardProps) {
  const cfg = statusMap[status]

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={[
        'rounded-2xl border bg-[#18181B] p-5',
        'transition-all duration-200',
        'hover:border-white/12',
        cfg.accent,
        className,
      ].join(' ')}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex items-center gap-3 min-w-0">
          {/* File icon */}
          <div className={`flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center ${cfg.accent}`}>
            {cfg.icon}
          </div>
          {/* Name + status */}
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-zinc-100 truncate">{name}</p>
            <div className="mt-1">
              <StatusChip status={status} size="sm" />
            </div>
          </div>
        </div>

        {onMore && (
          <IconButton
            icon={<MoreHorizontal className="w-4 h-4" />}
            label="More options"
            size="sm"
            onClick={onMore}
          />
        )}
      </div>

      {/* Meta row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {rows != null && (
          <div className="bg-white/3 rounded-lg px-3 py-2">
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Rows</p>
            <p className="text-[13px] font-semibold text-zinc-300">{rows.toLocaleString()}</p>
          </div>
        )}
        {columns != null && (
          <div className="bg-white/3 rounded-lg px-3 py-2">
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Columns</p>
            <p className="text-[13px] font-semibold text-zinc-300">{columns.length}</p>
          </div>
        )}
        {size && (
          <div className="bg-white/3 rounded-lg px-3 py-2">
            <p className="text-[10px] text-zinc-600 uppercase tracking-wider mb-0.5">Size</p>
            <p className="text-[13px] font-semibold text-zinc-300">{size}</p>
          </div>
        )}
      </div>

      {/* Column chips */}
      {columns && columns.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-4">
          {columns.slice(0, 6).map(col => (
            <span key={col} className="px-2 py-0.5 rounded-md text-[10px] font-mono text-zinc-500 bg-white/4 border border-white/6">
              {col}
            </span>
          ))}
          {columns.length > 6 && (
            <span className="px-2 py-0.5 rounded-md text-[10px] text-zinc-600 bg-white/3 border border-white/5">
              +{columns.length - 6} more
            </span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        {uploadedAt && (
          <div className="flex items-center gap-1.5 text-[11px] text-zinc-600">
            <Clock className="w-3 h-3" />
            {uploadedAt}
          </div>
        )}
        {onQuery && status === 'ready' && (
          <button
            onClick={onQuery}
            className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold text-primary bg-primary/10 border border-primary/20 hover:bg-primary/18 transition-all duration-150"
          >
            Query →
          </button>
        )}
      </div>
    </motion.div>
  )
}
