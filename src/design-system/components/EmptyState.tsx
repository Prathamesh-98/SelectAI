import React from 'react'
import { motion } from 'framer-motion'
import { Database, Upload, Search, FileText, BarChart2, Inbox } from 'lucide-react'
import { Button } from './Button'

// ─── Types ────────────────────────────────────────────────────────────────────
export type EmptyStateVariant = 'default' | 'search' | 'upload' | 'dataset' | 'chart' | 'inbox'

export interface EmptyStateProps {
  variant?:    EmptyStateVariant
  title:       string
  description?: string
  action?:     { label: string; onClick: () => void; icon?: React.ReactNode }
  secondAction?: { label: string; onClick: () => void }
  icon?:       React.ReactNode    // override default icon
  size?:       'sm' | 'md' | 'lg'
  className?:  string
}

const iconMap: Record<EmptyStateVariant, React.ElementType> = {
  default: Database,
  search:  Search,
  upload:  Upload,
  dataset: FileText,
  chart:   BarChart2,
  inbox:   Inbox,
}

const sizeMap = {
  sm: { wrap: 'py-10', icon: 'w-10 h-10', iconInner: 'w-5 h-5', iconBg: 'w-16 h-16', title: 'text-[14px]', desc: 'text-[12px]', gap: 'gap-3' },
  md: { wrap: 'py-16', icon: 'w-12 h-12', iconInner: 'w-6 h-6', iconBg: 'w-20 h-20', title: 'text-[16px]', desc: 'text-[13px]', gap: 'gap-4' },
  lg: { wrap: 'py-20', icon: 'w-14 h-14', iconInner: 'w-7 h-7', iconBg: 'w-24 h-24', title: 'text-[18px]', desc: 'text-[14px]', gap: 'gap-5' },
}

export function EmptyState({
  variant     = 'default',
  title,
  description,
  action,
  secondAction,
  icon,
  size        = 'md',
  className   = '',
}: EmptyStateProps) {
  const Icon = iconMap[variant]
  const s    = sizeMap[size]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={[
        'flex flex-col items-center text-center',
        s.wrap, s.gap,
        className,
      ].join(' ')}
    >
      {/* Icon container */}
      <div className={`${s.iconBg} rounded-3xl bg-white/4 border border-white/8 flex items-center justify-center relative`}>
        {/* Subtle glow */}
        <div className="absolute inset-0 rounded-3xl bg-primary/8 blur-lg" />
        <span className={`${s.iconInner} text-zinc-500 relative`}>
          {icon ?? <Icon className={s.iconInner} />}
        </span>
      </div>

      {/* Text */}
      <div className={`space-y-2 max-w-xs ${size === 'lg' ? 'max-w-sm' : ''}`}>
        <h3 className={`${s.title} font-semibold text-zinc-300`}>{title}</h3>
        {description && (
          <p className={`${s.desc} text-zinc-600 leading-relaxed`}>{description}</p>
        )}
      </div>

      {/* Actions */}
      {(action || secondAction) && (
        <div className="flex items-center gap-3 flex-wrap justify-center">
          {action && (
            <Button
              variant="primary"
              size={size === 'sm' ? 'sm' : 'md'}
              leftIcon={action.icon}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondAction && (
            <Button
              variant="ghost"
              size={size === 'sm' ? 'sm' : 'md'}
              onClick={secondAction.onClick}
            >
              {secondAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}
