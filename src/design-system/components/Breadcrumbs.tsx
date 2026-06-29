import React from 'react'
import { ChevronRight, Home } from 'lucide-react'

// ─── Breadcrumbs ──────────────────────────────────────────────────────────────
export interface BreadcrumbItem {
  label:    string
  href?:    string
  icon?:    React.ReactNode
}

export interface BreadcrumbsProps {
  items:     BreadcrumbItem[]
  separator?: React.ReactNode
  className?: string
  size?:      'sm' | 'md'
  showHome?:  boolean
}

const sizeMap = { sm: 'text-[12px]', md: 'text-[13px]' }

export function Breadcrumbs({
  items,
  separator,
  className = '',
  size      = 'sm',
  showHome  = false,
}: BreadcrumbsProps) {
  const allItems: BreadcrumbItem[] = showHome
    ? [{ label: 'Home', href: '/', icon: <Home className="w-3.5 h-3.5" /> }, ...items]
    : items

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center ${className}`}>
      <ol className={`flex items-center gap-1.5 flex-wrap ${sizeMap[size]}`} role="list">
        {allItems.map((item, i) => {
          const isLast = i === allItems.length - 1
          return (
            <li key={i} className="flex items-center gap-1.5" aria-current={isLast ? 'page' : undefined}>
              {/* Item */}
              {isLast ? (
                <span className="font-medium text-zinc-200 flex items-center gap-1.5">
                  {item.icon}
                  {item.label}
                </span>
              ) : (
                <a
                  href={item.href ?? '#'}
                  className="font-medium text-zinc-500 hover:text-zinc-300 transition-colors flex items-center gap-1.5"
                >
                  {item.icon}
                  {item.label}
                </a>
              )}

              {/* Separator */}
              {!isLast && (
                <span className="text-zinc-700 pointer-events-none" aria-hidden="true">
                  {separator ?? <ChevronRight className="w-3 h-3" />}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
