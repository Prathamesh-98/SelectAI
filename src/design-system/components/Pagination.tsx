import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, ChevronFirst, ChevronLast } from 'lucide-react'

// ─── Pagination ───────────────────────────────────────────────────────────────
export interface PaginationProps {
  page:       number
  pageSize:   number
  total:      number
  onChange:   (page: number) => void
  siblingCount?: number
  showInfo?:  boolean
  showFirst?: boolean
  showLast?:  boolean
  className?: string
}

function range(start: number, end: number) {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
}

export function Pagination({
  page,
  pageSize,
  total,
  onChange,
  siblingCount = 1,
  showInfo     = true,
  showFirst    = true,
  showLast     = true,
  className    = '',
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const from       = Math.min((page - 1) * pageSize + 1, total)
  const to         = Math.min(page * pageSize, total)

  // Build page number list with ellipses
  const pages: Array<number | '…'> = React.useMemo(() => {
    const left  = Math.max(1, page - siblingCount)
    const right = Math.min(totalPages, page + siblingCount)
    const showLeftDots  = left > 2
    const showRightDots = right < totalPages - 1

    const result: Array<number | '…'> = []
    if (showLeftDots)  { result.push(1, '…') } else { result.push(...range(1, left - 1)) }
    result.push(...range(left, right))
    if (showRightDots) { result.push('…', totalPages) } else { result.push(...range(right + 1, totalPages)) }
    return [...new Set(result)] // dedupe
  }, [page, siblingCount, totalPages])

  const btn = (
    label: React.ReactNode,
    targetPage: number,
    disabled: boolean,
    ariaLabel: string
  ) => (
    <button
      key={ariaLabel}
      type="button"
      disabled={disabled}
      onClick={() => onChange(targetPage)}
      aria-label={ariaLabel}
      className={[
        'flex items-center justify-center w-8 h-8 rounded-lg text-[13px] font-medium',
        'transition-all duration-150',
        disabled
          ? 'text-zinc-700 cursor-not-allowed'
          : 'text-zinc-400 hover:text-white hover:bg-white/6 cursor-pointer',
      ].join(' ')}
    >
      {label}
    </button>
  )

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Info */}
      {showInfo && total > 0 && (
        <span className="text-[12px] text-zinc-600 mr-2 hidden sm:block">
          {from}–{to} of {total.toLocaleString()}
        </span>
      )}

      {/* First */}
      {showFirst && btn(<ChevronFirst className="w-4 h-4" />, 1, page === 1, 'First page')}

      {/* Prev */}
      {btn(<ChevronLeft className="w-4 h-4" />, page - 1, page === 1, 'Previous page')}

      {/* Page numbers */}
      <div className="flex items-center gap-1">
        {pages.map((p, i) =>
          p === '…' ? (
            <span key={`dots-${i}`} className="w-8 text-center text-zinc-700 text-[13px]">…</span>
          ) : (
            <motion.button
              key={p}
              whileTap={{ scale: 0.93 }}
              type="button"
              onClick={() => onChange(p as number)}
              aria-label={`Page ${p}`}
              aria-current={p === page ? 'page' : undefined}
              className={[
                'w-8 h-8 rounded-lg text-[13px] font-medium transition-all duration-150',
                p === page
                  ? 'bg-primary text-white shadow-[0_0_16px_rgba(59,130,246,0.3)]'
                  : 'text-zinc-400 hover:text-white hover:bg-white/6',
              ].join(' ')}
            >
              {p}
            </motion.button>
          )
        )}
      </div>

      {/* Next */}
      {btn(<ChevronRight className="w-4 h-4" />, page + 1, page === totalPages, 'Next page')}

      {/* Last */}
      {showLast && btn(<ChevronLast className="w-4 h-4" />, totalPages, page === totalPages, 'Last page')}
    </div>
  )
}
