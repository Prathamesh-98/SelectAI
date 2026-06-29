import React, { createContext, useContext, useState } from 'react'
import { motion } from 'framer-motion'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TabItem {
  key:       string
  label:     React.ReactNode
  icon?:     React.ReactNode
  badge?:    string
  disabled?: boolean
  content?:  React.ReactNode
}

export interface TabsProps {
  items:       TabItem[]
  defaultKey?: string
  activeKey?:  string
  onChange?:   (key: string) => void
  variant?:    'underline' | 'pills' | 'boxed'
  size?:       'sm' | 'md' | 'lg'
  fullWidth?:  boolean
  className?:  string
}

const sizeMap = {
  sm: 'text-[12px] px-3 py-2 gap-1.5',
  md: 'text-[13px] px-4 py-2.5 gap-2',
  lg: 'text-[14px] px-5 py-3 gap-2.5',
}

// ─── Component ────────────────────────────────────────────────────────────────
export function Tabs({
  items,
  defaultKey,
  activeKey: controlledKey,
  onChange,
  variant   = 'underline',
  size      = 'md',
  fullWidth = false,
  className = '',
}: TabsProps) {
  const [internalKey, setInternalKey] = useState(defaultKey ?? items[0]?.key)
  const active = controlledKey ?? internalKey

  const handleSelect = (key: string) => {
    setInternalKey(key)
    onChange?.(key)
  }

  const activeItem = items.find(i => i.key === active)

  return (
    <div className={className}>
      {/* Tab list */}
      <div
        role="tablist"
        className={[
          'flex relative',
          variant === 'underline' ? 'border-b border-white/6 gap-0' : 'gap-1',
          variant === 'boxed'     ? 'bg-white/4 p-1 rounded-xl border border-white/6' : '',
          fullWidth               ? 'w-full' : '',
        ].join(' ')}
      >
        {items.map(item => {
          const isActive   = item.key === active
          const isDisabled = item.disabled

          return (
            <button
              key={item.key}
              type="button"
              role="tab"
              id={`tab-${item.key}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${item.key}`}
              disabled={isDisabled}
              onClick={() => !isDisabled && handleSelect(item.key)}
              className={[
                'relative flex items-center font-medium transition-all duration-200 rounded-lg',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60',
                sizeMap[size],
                fullWidth ? 'flex-1 justify-center' : '',
                isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',

                // Underline variant
                variant === 'underline'
                  ? isActive
                    ? 'text-white rounded-none pb-[calc(0.625rem+1px)]'
                    : 'text-zinc-500 hover:text-zinc-300 rounded-none'
                  : '',

                // Pills variant
                variant === 'pills'
                  ? isActive
                    ? 'bg-primary/15 text-primary border border-primary/25'
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                  : '',

                // Boxed variant
                variant === 'boxed'
                  ? isActive
                    ? 'bg-[#18181B] text-white shadow-sm border border-white/8'
                    : 'text-zinc-500 hover:text-zinc-300'
                  : '',
              ].join(' ')}
            >
              {item.icon && <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>}
              <span>{item.label}</span>
              {item.badge && (
                <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-primary/15 text-primary border border-primary/20">
                  {item.badge}
                </span>
              )}

              {/* Underline indicator */}
              {variant === 'underline' && isActive && (
                <motion.div
                  layoutId="tab-underline"
                  className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary rounded-full"
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Tab panel */}
      {activeItem?.content && (
        <motion.div
          key={active}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          role="tabpanel"
          id={`tabpanel-${active}`}
          aria-labelledby={`tab-${active}`}
          className="mt-4"
        >
          {activeItem.content}
        </motion.div>
      )}
    </div>
  )
}
