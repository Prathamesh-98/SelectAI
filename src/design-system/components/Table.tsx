import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, ChevronDown, SortAsc, SortDesc, MoreHorizontal } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
export type SortDir = 'asc' | 'desc' | null

export interface Column<T> {
  key:        keyof T | string
  header:     React.ReactNode
  cell?:      (row: T, index: number) => React.ReactNode
  sortable?:  boolean
  align?:     'left' | 'center' | 'right'
  width?:     string
  className?: string
}

export interface TableProps<T> {
  data:          T[]
  columns:       Column<T>[]
  keyExtractor:  (row: T) => string | number
  selectable?:   boolean
  onSelect?:     (selected: T[]) => void
  emptyState?:   React.ReactNode
  caption?:      string
  striped?:      boolean
  compact?:      boolean
  stickyHeader?: boolean
  className?:    string
}

// ─── Table ────────────────────────────────────────────────────────────────────
export function Table<T extends object>({
  data,
  columns,
  keyExtractor,
  selectable    = false,
  onSelect,
  emptyState,
  caption,
  striped       = false,
  compact       = false,
  stickyHeader  = false,
  className     = '',
}: TableProps<T>) {
  const [sortKey,    setSortKey]    = useState<string | null>(null)
  const [sortDir,    setSortDir]    = useState<SortDir>(null)
  const [selectedKeys, setSelected] = useState<Set<string | number>>(new Set())

  const rowPad = compact ? 'py-2.5 px-4' : 'py-3.5 px-4'

  // Sorting
  const handleSort = useCallback((key: string) => {
    if (sortKey !== key) { setSortKey(key); setSortDir('asc') }
    else if (sortDir === 'asc')  setSortDir('desc')
    else { setSortKey(null); setSortDir(null) }
  }, [sortKey, sortDir])

  const sorted = React.useMemo(() => {
    if (!sortKey || !sortDir) return data
    return [...data].sort((a, b) => {
      const av = (a as Record<string, unknown>)[sortKey]
      const bv = (b as Record<string, unknown>)[sortKey]
      if (av == null && bv == null) return 0
      if (av == null) return 1
      if (bv == null) return -1
      const cmp = av < bv ? -1 : av > bv ? 1 : 0
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [data, sortKey, sortDir])

  // Selection
  const allKeys     = data.map(keyExtractor)
  const allSelected = allKeys.every(k => selectedKeys.has(k))

  const toggleAll = () => {
    const next = allSelected ? new Set<string | number>() : new Set(allKeys)
    setSelected(next)
    onSelect?.(allSelected ? [] : [...data])
  }

  const toggleRow = (row: T) => {
    const key  = keyExtractor(row)
    const next = new Set(selectedKeys)
    if (next.has(key)) next.delete(key)
    else               next.add(key)
    setSelected(next)
    onSelect?.(data.filter(r => next.has(keyExtractor(r))))
  }

  return (
    <div className={`rounded-xl overflow-hidden border border-white/6 ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]" role="table">
          {caption && <caption className="sr-only">{caption}</caption>}

          {/* Head */}
          <thead className={`${stickyHeader ? 'sticky top-0 z-10' : ''} bg-white/[0.03]`}>
            <tr className="border-b border-white/6">
              {selectable && (
                <th className={`${rowPad} w-10`} scope="col">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    aria-label="Select all rows"
                    className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
                  />
                </th>
              )}
              {columns.map(col => (
                <th
                  key={String(col.key)}
                  scope="col"
                  style={{ width: col.width }}
                  className={[
                    rowPad,
                    'text-[11px] font-semibold text-zinc-500 uppercase tracking-wider',
                    col.align === 'right'  ? 'text-right'  : '',
                    col.align === 'center' ? 'text-center' : 'text-left',
                    col.sortable ? 'cursor-pointer select-none hover:text-zinc-300 transition-colors' : '',
                    col.className ?? '',
                  ].join(' ')}
                  onClick={col.sortable ? () => handleSort(String(col.key)) : undefined}
                  aria-sort={
                    sortKey === String(col.key)
                      ? sortDir === 'asc' ? 'ascending' : 'descending'
                      : undefined
                  }
                >
                  <span className="inline-flex items-center gap-1.5">
                    {col.header}
                    {col.sortable && (
                      <span className="opacity-40">
                        {sortKey === String(col.key) && sortDir === 'asc'  ? <SortAsc  className="w-3 h-3" /> :
                         sortKey === String(col.key) && sortDir === 'desc' ? <SortDesc className="w-3 h-3" /> :
                         <ChevronUp className="w-3 h-3 opacity-50" />}
                      </span>
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="py-16 text-center text-[13px] text-zinc-600"
                >
                  {emptyState ?? 'No data to display'}
                </td>
              </tr>
            ) : (
              sorted.map((row, i) => {
                const key       = keyExtractor(row)
                const isSelected = selectedKeys.has(key)
                return (
                  <motion.tr
                    key={key}
                    initial={{ opacity: 0, x: -4 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.02, duration: 0.2 }}
                    className={[
                      'border-b border-white/4 last:border-0 transition-colors duration-150',
                      isSelected ? 'bg-primary/8' : '',
                      striped && !isSelected && i % 2 === 1 ? 'bg-white/[0.02]' : '',
                      'hover:bg-white/[0.03]',
                    ].join(' ')}
                  >
                    {selectable && (
                      <td className={`${rowPad} w-10`}>
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(row)}
                          aria-label={`Select row ${i + 1}`}
                          className="w-3.5 h-3.5 rounded accent-primary cursor-pointer"
                        />
                      </td>
                    )}
                    {columns.map(col => (
                      <td
                        key={String(col.key)}
                        className={[
                          rowPad,
                          'text-zinc-300',
                          col.align === 'right'  ? 'text-right'  : '',
                          col.align === 'center' ? 'text-center' : '',
                          col.className ?? '',
                        ].join(' ')}
                      >
                        {col.cell
                          ? col.cell(row, i)
                          : String((row as Record<string, unknown>)[col.key as string] ?? '—')}
                      </td>
                    ))}
                  </motion.tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
