import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AccordionItem {
  key:       string
  trigger:   React.ReactNode
  content:   React.ReactNode
  icon?:     React.ReactNode
  badge?:    React.ReactNode
  disabled?: boolean
}

export interface AccordionProps {
  items:       AccordionItem[]
  defaultOpen?: string | string[]
  multiple?:   boolean         // allow multiple open
  variant?:    'default' | 'bordered' | 'separated'
  size?:       'sm' | 'md' | 'lg'
  className?:  string
}

const sizeMap = {
  sm: { trigger: 'px-4 py-3 text-[13px]', content: 'px-4 pb-3 text-[12px]' },
  md: { trigger: 'px-5 py-4 text-[14px]', content: 'px-5 pb-4 text-[13px]' },
  lg: { trigger: 'px-6 py-5 text-[15px]', content: 'px-6 pb-5 text-[14px]' },
}

// ─── Component ────────────────────────────────────────────────────────────────
export function Accordion({
  items,
  defaultOpen,
  multiple  = false,
  variant   = 'default',
  size      = 'md',
  className = '',
}: AccordionProps) {
  const initialOpen = defaultOpen
    ? (Array.isArray(defaultOpen) ? new Set(defaultOpen) : new Set([defaultOpen]))
    : new Set<string>()

  const [openKeys, setOpenKeys] = useState<Set<string>>(initialOpen)

  const toggle = (key: string) => {
    setOpenKeys(prev => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        if (!multiple) next.clear()
        next.add(key)
      }
      return next
    })
  }

  const s = sizeMap[size]

  const wrapperCls = {
    default:   'rounded-2xl border border-white/6 bg-[#18181B] overflow-hidden',
    bordered:  'rounded-2xl border border-white/6 overflow-hidden',
    separated: 'space-y-2',
  }[variant]

  const itemCls = {
    default:   'border-b border-white/5 last:border-0',
    bordered:  'border-b border-white/5 last:border-0',
    separated: 'rounded-xl border border-white/6 bg-[#18181B] overflow-hidden',
  }[variant]

  return (
    <div
      className={[wrapperCls, className].join(' ')}
      role="list"
    >
      {items.map(item => {
        const isOpen     = openKeys.has(item.key)
        const isDisabled = item.disabled

        return (
          <div key={item.key} className={itemCls} role="listitem">
            {/* Trigger */}
            <button
              type="button"
              id={`accordion-trigger-${item.key}`}
              aria-expanded={isOpen}
              aria-controls={`accordion-content-${item.key}`}
              disabled={isDisabled}
              onClick={() => !isDisabled && toggle(item.key)}
              className={[
                'w-full flex items-center gap-3 text-left',
                'transition-all duration-200 group',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset',
                isDisabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                isOpen ? 'text-white' : 'text-zinc-400 hover:text-zinc-200',
                s.trigger,
              ].join(' ')}
            >
              {/* Custom icon */}
              {item.icon && (
                <span className={`flex-shrink-0 w-4 h-4 transition-colors ${isOpen ? 'text-primary' : 'text-zinc-600 group-hover:text-zinc-400'}`}>
                  {item.icon}
                </span>
              )}

              {/* Label */}
              <span className="flex-1 font-medium text-left">{item.trigger}</span>

              {/* Badge */}
              {item.badge && <span className="flex-shrink-0">{item.badge}</span>}

              {/* Chevron */}
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.22 }}
                className="flex-shrink-0"
              >
                <ChevronDown className={`w-4 h-4 transition-colors ${isOpen ? 'text-primary' : 'text-zinc-700'}`} />
              </motion.span>
            </button>

            {/* Content */}
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`accordion-content-${item.key}`}
                  role="region"
                  aria-labelledby={`accordion-trigger-${item.key}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className={[s.content, 'text-zinc-500 leading-relaxed border-t border-white/5'].join(' ')}>
                    <div className="pt-3">
                      {item.content}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
