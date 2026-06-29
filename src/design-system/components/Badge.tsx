import React from 'react'

// ─── Badge ────────────────────────────────────────────────────────────────────
export type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error' | 'neutral' | 'outline'
export type BadgeSize    = 'xs' | 'sm' | 'md'

export interface BadgeProps {
  variant?:  BadgeVariant
  size?:     BadgeSize
  dot?:      boolean
  children:  React.ReactNode
  className?: string
}

const badgeVariantMap: Record<BadgeVariant, string> = {
  primary:   'bg-primary/15 text-primary border border-primary/25',
  secondary: 'bg-secondary/15 text-secondary border border-secondary/25',
  accent:    'bg-accent/15 text-accent border border-accent/25',
  success:   'bg-green-500/15 text-green-400 border border-green-500/25',
  warning:   'bg-amber-500/15 text-amber-400 border border-amber-500/25',
  error:     'bg-red-500/15 text-red-400 border border-red-500/25',
  neutral:   'bg-white/6 text-zinc-400 border border-white/10',
  outline:   'bg-transparent text-zinc-400 border border-white/15',
}

const dotColorMap: Record<BadgeVariant, string> = {
  primary:   'bg-primary',
  secondary: 'bg-secondary',
  accent:    'bg-accent',
  success:   'bg-green-400',
  warning:   'bg-amber-400',
  error:     'bg-red-400',
  neutral:   'bg-zinc-500',
  outline:   'bg-zinc-500',
}

const badgeSizeMap: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-[10px] rounded-md gap-1',
  sm: 'px-2   py-0.5 text-[11px] rounded-lg gap-1.5',
  md: 'px-2.5 py-1   text-[12px] rounded-lg gap-1.5',
}

export function Badge({ variant = 'neutral', size = 'sm', dot = false, children, className = '' }: BadgeProps) {
  return (
    <span
      className={[
        'inline-flex items-center font-semibold leading-none',
        badgeVariantMap[variant],
        badgeSizeMap[size],
        className,
      ].join(' ')}
    >
      {dot && (
        <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full ${dotColorMap[variant]}`} />
      )}
      {children}
    </span>
  )
}

// ─── StatusChip ───────────────────────────────────────────────────────────────
export type StatusType = 'online' | 'offline' | 'processing' | 'error' | 'idle' | 'ready' | 'warning'

export interface StatusChipProps {
  status:     StatusType
  label?:     string     // override default label
  size?:      'sm' | 'md'
  pulse?:     boolean
  className?: string
}

const statusConfig: Record<StatusType, { label: string; color: string; dot: string; bg: string; border: string }> = {
  online:     { label: 'Online',     color: 'text-green-400',   dot: 'bg-green-400',   bg: 'bg-green-500/12',  border: 'border-green-500/25' },
  offline:    { label: 'Offline',    color: 'text-zinc-500',    dot: 'bg-zinc-500',    bg: 'bg-white/5',       border: 'border-white/10'     },
  processing: { label: 'Processing', color: 'text-primary',     dot: 'bg-primary',     bg: 'bg-primary/12',    border: 'border-primary/25'   },
  error:      { label: 'Error',      color: 'text-red-400',     dot: 'bg-red-400',     bg: 'bg-red-500/12',    border: 'border-red-500/25'   },
  idle:       { label: 'Idle',       color: 'text-zinc-400',    dot: 'bg-zinc-400',    bg: 'bg-white/5',       border: 'border-white/10'     },
  ready:      { label: 'Ready',      color: 'text-accent',      dot: 'bg-accent',      bg: 'bg-accent/12',     border: 'border-accent/25'    },
  warning:    { label: 'Warning',    color: 'text-amber-400',   dot: 'bg-amber-400',   bg: 'bg-amber-500/12',  border: 'border-amber-500/25' },
}

const chipSizeMap = {
  sm: 'px-2 py-0.5 text-[11px] gap-1.5 rounded-md',
  md: 'px-2.5 py-1 text-[12px] gap-2 rounded-lg',
}

export function StatusChip({ status, label, size = 'sm', pulse = true, className = '' }: StatusChipProps) {
  const cfg = statusConfig[status]
  const shouldPulse = pulse && (status === 'online' || status === 'processing' || status === 'ready')

  return (
    <span
      className={[
        'inline-flex items-center font-medium border',
        cfg.bg, cfg.border, cfg.color,
        chipSizeMap[size],
        className,
      ].join(' ')}
    >
      <span className={`relative flex-shrink-0 ${size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2'}`}>
        {shouldPulse && (
          <span className={`absolute inset-0 rounded-full ${cfg.dot} animate-ping opacity-60`} />
        )}
        <span className={`relative block w-full h-full rounded-full ${cfg.dot}`} />
      </span>
      {label ?? cfg.label}
    </span>
  )
}
