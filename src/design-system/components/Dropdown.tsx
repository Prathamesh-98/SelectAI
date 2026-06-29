import React, { useState, useRef, useEffect, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DropdownItem {
  key:       string
  label:     React.ReactNode
  icon?:     React.ReactNode
  badge?:    React.ReactNode
  disabled?: boolean
  danger?:   boolean
  divider?:  boolean   // renders a divider BEFORE this item
}

export interface DropdownGroup {
  label?: string
  items:  DropdownItem[]
}

export interface DropdownProps {
  trigger:     React.ReactNode
  items?:      DropdownItem[]
  groups?:     DropdownGroup[]
  selected?:   string
  onSelect?:   (key: string) => void
  placement?:  'bottom-start' | 'bottom-end' | 'top-start' | 'top-end'
  width?:      number | 'trigger'
  className?:  string
}

const menuVariants = {
  hidden:  { opacity: 0, scale: 0.95, y: -6 },
  visible: { opacity: 1, scale: 1,    y: 0   },
  exit:    { opacity: 0, scale: 0.97, y: -4  },
}

export function Dropdown({
  trigger,
  items    = [],
  groups   = [],
  selected,
  onSelect,
  placement = 'bottom-start',
  width     = 200,
  className = '',
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref             = useRef<HTMLDivElement>(null)
  const menuId          = useId()

  // Click outside to close
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  // Keyboard: Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  const allItems: DropdownItem[] = groups.length > 0 ? groups.flatMap(g => g.items) : items
  const hasGroups = groups.length > 0

  const positionMap: Record<string, string> = {
    'bottom-start': 'top-full mt-1.5 left-0',
    'bottom-end':   'top-full mt-1.5 right-0',
    'top-start':    'bottom-full mb-1.5 left-0',
    'top-end':      'bottom-full mb-1.5 right-0',
  }

  const handleSelect = (item: DropdownItem) => {
    if (item.disabled) return
    onSelect?.(item.key)
    setOpen(false)
  }

  const renderItem = (item: DropdownItem) => (
    <React.Fragment key={item.key}>
      {item.divider && <div className="my-1 border-t border-white/6" />}
      <button
        type="button"
        role="menuitem"
        disabled={item.disabled}
        onClick={() => handleSelect(item)}
        className={[
          'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-left',
          'transition-colors duration-100 cursor-pointer',
          item.disabled ? 'opacity-40 cursor-not-allowed' : '',
          item.danger
            ? 'text-red-400 hover:bg-red-500/10'
            : 'text-zinc-300 hover:bg-white/6 hover:text-white',
        ].join(' ')}
      >
        {item.icon && (
          <span className="w-4 h-4 flex-shrink-0 text-zinc-500">{item.icon}</span>
        )}
        <span className="flex-1">{item.label}</span>
        {item.badge && <span>{item.badge}</span>}
        {selected === item.key && (
          <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
        )}
      </button>
    </React.Fragment>
  )

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <div
        onClick={() => setOpen(v => !v)}
        role="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className="cursor-pointer"
      >
        {trigger}
      </div>

      {/* Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            id={menuId}
            role="menu"
            variants={menuVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            style={{ width: width === 'trigger' ? '100%' : width }}
            className={[
              'absolute z-[100]',
              'bg-[#1C1C1F] border border-white/10 rounded-xl p-1.5',
              'shadow-[0_16px_48px_rgba(0,0,0,0.7)]',
              positionMap[placement],
            ].join(' ')}
          >
            {hasGroups
              ? groups.map((group, gi) => (
                  <div key={gi}>
                    {gi > 0 && <div className="my-1 border-t border-white/6" />}
                    {group.label && (
                      <p className="px-3 py-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
                        {group.label}
                      </p>
                    )}
                    {group.items.map(renderItem)}
                  </div>
                ))
              : allItems.map(renderItem)
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Select (styled native select replacement) ────────────────────────────────
export interface SelectOption { value: string; label: string; disabled?: boolean }

export interface SelectProps {
  options:     SelectOption[]
  value?:      string
  onChange?:   (value: string) => void
  placeholder?: string
  label?:      string
  error?:      string
  disabled?:   boolean
  fullWidth?:  boolean
  className?:  string
}

export function Select({
  options, value, onChange, placeholder = 'Select…',
  label, error, disabled, fullWidth, className = '',
}: SelectProps) {
  const [open, setOpen]   = useState(false)
  const ref               = useRef<HTMLDivElement>(null)
  const selectedOpt       = options.find(o => o.value === value)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} className={`flex flex-col gap-1.5 ${fullWidth ? 'w-full' : 'inline-block'} ${className}`}>
      {label && <span className="text-[13px] font-medium text-zinc-300">{label}</span>}
      <div className="relative">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(v => !v)}
          className={[
            'w-full flex items-center justify-between gap-2 h-9 px-3.5 rounded-xl',
            'bg-zinc-900/60 border text-[14px] text-left',
            'transition-all duration-200',
            error
              ? 'border-red-500/40 text-zinc-100'
              : open
              ? 'border-primary/50 ring-2 ring-primary/20 text-zinc-100'
              : 'border-white/8 hover:border-white/14 text-zinc-300',
            disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          ].join(' ')}
        >
          <span className={selectedOpt ? 'text-zinc-100' : 'text-zinc-500'}>
            {selectedOpt?.label ?? placeholder}
          </span>
          <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          </motion.span>
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              variants={menuVariants}
              initial="hidden" animate="visible" exit="exit"
              transition={{ duration: 0.15 }}
              className="absolute z-[100] w-full top-full mt-1.5 bg-[#1C1C1F] border border-white/10 rounded-xl p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.7)]"
            >
              {options.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  disabled={opt.disabled}
                  onClick={() => { onChange?.(opt.value); setOpen(false) }}
                  className={[
                    'w-full flex items-center justify-between px-3 py-2 rounded-lg text-[13px] text-left',
                    'transition-colors duration-100',
                    opt.disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-white/6',
                    opt.value === value ? 'text-white' : 'text-zinc-300',
                  ].join(' ')}
                >
                  {opt.label}
                  {opt.value === value && <Check className="w-3.5 h-3.5 text-primary" />}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && <p className="text-[12px] text-red-400">{error}</p>}
    </div>
  )
}
