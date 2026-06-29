import React, { forwardRef, useRef, useState } from 'react'
import { Search, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export interface SearchBarProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'size'> {
  value?:        string
  onChange?:     (value: string) => void
  onClear?:      () => void
  loading?:      boolean
  shortcut?:     string              // e.g. "⌘K"
  searchSize?:   'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: { wrap: 'h-8',  text: 'text-[13px]', icon: 'w-3.5 h-3.5', pl: 'pl-8',  pr: 'pr-8' },
  md: { wrap: 'h-9',  text: 'text-[14px]', icon: 'w-4 h-4',     pl: 'pl-9',  pr: 'pr-9' },
  lg: { wrap: 'h-11', text: 'text-[15px]', icon: 'w-4.5 h-4.5', pl: 'pl-10', pr: 'pr-10'},
}

export const SearchBar = forwardRef<HTMLInputElement, SearchBarProps>(({
  value       = '',
  onChange,
  onClear,
  loading     = false,
  shortcut,
  searchSize  = 'md',
  placeholder = 'Search…',
  className   = '',
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false)
  const s = sizeMap[searchSize]

  const handleClear = () => {
    onChange?.('')
    onClear?.()
  }

  return (
    <div
      className={[
        'relative flex items-center rounded-xl border transition-all duration-200',
        'bg-zinc-900/60',
        focused
          ? 'border-primary/50 ring-2 ring-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
          : 'border-white/8 hover:border-white/14',
        s.wrap,
        className,
      ].join(' ')}
    >
      {/* Left icon */}
      <span className={`absolute left-3 pointer-events-none text-zinc-500 ${s.icon}`}>
        {loading
          ? <Loader2 className={`${s.icon} animate-spin text-primary`} />
          : <Search  className={s.icon} />
        }
      </span>

      <input
        ref={ref}
        type="search"
        value={value}
        onChange={e => onChange?.(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder={placeholder}
        className={[
          'flex-1 bg-transparent outline-none',
          'text-zinc-100 placeholder:text-zinc-500',
          'appearance-none [&::-webkit-search-cancel-button]:hidden',
          s.text,
          s.pl,
          value ? s.pr : shortcut ? 'pr-14' : 'pr-3',
        ].join(' ')}
        {...props}
      />

      {/* Right: clear or shortcut */}
      <AnimatePresence mode="wait">
        {value ? (
          <motion.button
            key="clear"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.12 }}
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3 text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <X className={s.icon} />
          </motion.button>
        ) : shortcut ? (
          <motion.kbd
            key="shortcut"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute right-2.5 px-1.5 py-0.5 rounded-md text-[10px] font-medium text-zinc-500 bg-white/5 border border-white/8 select-none"
          >
            {shortcut}
          </motion.kbd>
        ) : null}
      </AnimatePresence>
    </div>
  )
})

SearchBar.displayName = 'SearchBar'
