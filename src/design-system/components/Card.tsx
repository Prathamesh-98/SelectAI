import React from 'react'
import { motion } from 'framer-motion'
import { MoreHorizontal } from 'lucide-react'

// ─── Card ─────────────────────────────────────────────────────────────────────
export type CardVariant = 'default' | 'glass' | 'bordered' | 'elevated'

export interface CardProps {
  variant?:   CardVariant
  hoverable?: boolean
  padding?:   'none' | 'sm' | 'md' | 'lg'
  className?: string
  children?:  React.ReactNode
  onClick?:   () => void
}

const variantMap: Record<CardVariant, string> = {
  default:  'bg-[#18181B] border border-white/[0.06]',
  glass:    'bg-[#18181B]/70 backdrop-blur-[16px] border border-white/[0.07]',
  bordered: 'bg-transparent border border-white/12',
  elevated: 'bg-[#1C1C1F] border border-white/[0.07] shadow-[0_8px_32px_rgba(0,0,0,0.5)]',
}

const paddingMap = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-6' }

export function Card({
  variant   = 'default',
  hoverable = false,
  padding   = 'md',
  className = '',
  children,
  onClick,
}: CardProps) {
  return (
    <motion.div
      whileHover={hoverable ? { y: -3, transition: { duration: 0.18 } } : undefined}
      onClick={onClick}
      className={[
        'rounded-2xl overflow-hidden',
        variantMap[variant],
        paddingMap[padding],
        hoverable ? 'cursor-pointer hover:border-white/14 transition-all duration-200' : '',
        'transition-colors duration-200',
        className,
      ].join(' ')}
    >
      {children}
    </motion.div>
  )
}

// ─── Card sub-components ──────────────────────────────────────────────────────
export interface CardHeaderProps {
  title:       React.ReactNode
  description?: string
  action?:     React.ReactNode
  icon?:       React.ReactNode
  className?:  string
}

export function CardHeader({ title, description, action, icon, className = '' }: CardHeaderProps) {
  return (
    <div className={`flex items-start justify-between gap-4 ${className}`}>
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center">
            <span className="w-4 h-4 text-primary">{icon}</span>
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-[15px] font-semibold text-zinc-100 leading-snug">{title}</h3>
          {description && (
            <p className="text-[13px] text-zinc-500 mt-0.5 leading-relaxed">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

export interface CardDividerProps { className?: string }
export function CardDivider({ className = '' }: CardDividerProps) {
  return <hr className={`border-white/6 my-4 ${className}`} />
}

export interface CardFooterProps {
  children:   React.ReactNode
  className?: string
  align?:     'left' | 'right' | 'between'
}

export function CardFooter({ children, className = '', align = 'right' }: CardFooterProps) {
  const alignMap = { left: 'justify-start', right: 'justify-end', between: 'justify-between' }
  return (
    <div className={`flex items-center gap-3 pt-4 mt-4 border-t border-white/6 ${alignMap[align]} ${className}`}>
      {children}
    </div>
  )
}

// ─── StatsCard ────────────────────────────────────────────────────────────────
export interface StatsCardProps {
  label:     string
  value:     React.ReactNode
  delta?:    string
  deltaDir?: 'up' | 'down' | 'neutral'
  icon?:     React.ReactNode
  accentColor?: string
  className?: string
}

export function StatsCard({
  label, value, delta, deltaDir = 'neutral', icon, accentColor = 'primary', className = '',
}: StatsCardProps) {
  const deltaColor = deltaDir === 'up' ? 'text-green-400' : deltaDir === 'down' ? 'text-red-400' : 'text-zinc-500'

  return (
    <Card variant="default" className={className}>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-[12px] font-semibold text-zinc-500 uppercase tracking-wider">{label}</p>
          {icon && (
            <div className={`w-8 h-8 rounded-xl bg-${accentColor}/12 border border-${accentColor}/20 flex items-center justify-center`}>
              <span className={`w-3.5 h-3.5 text-${accentColor}`}>{icon}</span>
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-zinc-100 tracking-tight">{value}</p>
        {delta && (
          <p className={`text-[12px] font-medium mt-1.5 ${deltaColor}`}>{delta}</p>
        )}
      </div>
    </Card>
  )
}

// ─── ActionCard ───────────────────────────────────────────────────────────────
export interface ActionCardProps extends CardProps {
  title:       string
  description?: string
  icon?:       React.ReactNode
  badge?:      React.ReactNode
  footer?:     React.ReactNode
}

export function ActionCard({ title, description, icon, badge, footer, className = '', ...cardProps }: ActionCardProps) {
  return (
    <Card {...cardProps} className={className} hoverable>
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          {icon && (
            <div className="w-10 h-10 rounded-xl bg-primary/12 border border-primary/20 flex items-center justify-center">
              <span className="w-5 h-5 text-primary">{icon}</span>
            </div>
          )}
          {badge}
        </div>
        <h3 className="text-[15px] font-semibold text-zinc-100 mb-1">{title}</h3>
        {description && <p className="text-[13px] text-zinc-500 leading-relaxed">{description}</p>}
        {footer && <div className="mt-4 pt-4 border-t border-white/6">{footer}</div>}
      </div>
    </Card>
  )
}
