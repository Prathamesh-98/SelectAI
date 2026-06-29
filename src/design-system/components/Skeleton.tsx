import React from 'react'
import { motion } from 'framer-motion'

// ─── Skeleton ─────────────────────────────────────────────────────────────────
export interface SkeletonProps {
  width?:    string | number
  height?:   string | number
  rounded?:  'sm' | 'md' | 'lg' | 'xl' | 'full'
  className?: string
}

const roundedMap = { sm: 'rounded', md: 'rounded-lg', lg: 'rounded-xl', xl: 'rounded-2xl', full: 'rounded-full' }

export function Skeleton({ width = '100%', height = 16, rounded = 'md', className = '' }: SkeletonProps) {
  return (
    <div
      className={[
        'relative overflow-hidden bg-white/5',
        roundedMap[rounded],
        className,
      ].join(' ')}
      style={{ width, height }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.8s_infinite] bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
    </div>
  )
}

// ─── Skeleton Text ────────────────────────────────────────────────────────────
export function SkeletonText({ lines = 3, className = '' }: { lines?: number; className?: string }) {
  const widths = ['100%', '85%', '92%', '70%', '88%']
  return (
    <div className={`space-y-2.5 ${className}`} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} height={12} width={widths[i % widths.length]} />
      ))}
    </div>
  )
}

// ─── Skeleton Card ────────────────────────────────────────────────────────────
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl bg-[#18181B] border border-white/6 p-5 ${className}`} aria-hidden="true">
      <div className="flex items-center gap-3 mb-4">
        <Skeleton width={40} height={40} rounded="xl" />
        <div className="flex-1 space-y-2">
          <Skeleton height={14} width="60%" />
          <Skeleton height={11} width="40%" />
        </div>
      </div>
      <SkeletonText lines={3} />
      <div className="mt-4 pt-4 border-t border-white/5 flex gap-2">
        <Skeleton height={32} width={80} rounded="xl" />
        <Skeleton height={32} width={80} rounded="xl" />
      </div>
    </div>
  )
}

// ─── Skeleton Table ───────────────────────────────────────────────────────────
export function SkeletonTable({ rows = 5, cols = 4, className = '' }: {
  rows?: number; cols?: number; className?: string
}) {
  return (
    <div className={`rounded-xl border border-white/6 overflow-hidden ${className}`} aria-hidden="true">
      {/* Header */}
      <div className="flex gap-4 px-4 py-3 border-b border-white/6 bg-white/[0.03]">
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height={11} width={`${60 + Math.random() * 40}px`} />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} className="flex gap-4 px-4 py-3 border-b border-white/4 last:border-0">
          {Array.from({ length: cols }).map((_, ci) => (
            <Skeleton key={ci} height={13} width={`${50 + Math.random() * 80}px`} />
          ))}
        </div>
      ))}
    </div>
  )
}

// ─── Skeleton Dataset Card ────────────────────────────────────────────────────
export function SkeletonDatasetCard({ className = '' }: { className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/6 bg-[#18181B] p-5 ${className}`} aria-hidden="true">
      <div className="flex items-start gap-3 mb-4">
        <Skeleton width={40} height={40} rounded="xl" />
        <div className="flex-1 space-y-2">
          <Skeleton height={14} width="55%" />
          <Skeleton height={20} width={70} rounded="full" />
        </div>
        <Skeleton width={32} height={32} rounded="xl" />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[1, 2, 3].map(i => <Skeleton key={i} height={48} rounded="lg" />)}
      </div>
      <div className="flex gap-1.5 flex-wrap mb-4">
        {[80, 60, 90, 70, 55, 75].map((w, i) => <Skeleton key={i} height={20} width={w} rounded="md" />)}
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-white/5">
        <Skeleton height={11} width={100} />
        <Skeleton height={28} width={72} rounded="lg" />
      </div>
    </div>
  )
}

// ─── Skeleton Chart ───────────────────────────────────────────────────────────
export function SkeletonChart({ height = 200, className = '' }: { height?: number; className?: string }) {
  const bars = [60, 80, 55, 90, 70, 85, 65, 95, 75, 88]
  return (
    <div className={`rounded-2xl border border-white/6 bg-[#18181B] p-5 ${className}`} aria-hidden="true">
      <div className="flex items-center justify-between mb-4">
        <div className="space-y-2">
          <Skeleton height={14} width={140} />
          <Skeleton height={11} width={100} />
        </div>
        <div className="flex gap-2">
          <Skeleton width={32} height={32} rounded="xl" />
          <Skeleton width={32} height={32} rounded="xl" />
        </div>
      </div>
      <div className="flex items-end gap-2" style={{ height }}>
        {bars.map((h, i) => (
          <Skeleton key={i} className="flex-1" height={`${h}%`} rounded="sm" />
        ))}
      </div>
    </div>
  )
}
