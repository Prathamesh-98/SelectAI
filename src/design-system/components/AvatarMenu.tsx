import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Settings, LogOut, ChevronDown, Bell } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AvatarMenuAction {
  key:      string
  label:    string
  icon?:    React.ReactNode
  danger?:  boolean
  divider?: boolean
  onClick?: () => void
}

export interface AvatarMenuProps {
  name:         string
  email?:       string
  avatarUrl?:   string
  initials?:    string       // fallback text when no avatarUrl
  role?:        string       // e.g. "Admin"
  actions?:     AvatarMenuAction[]
  notifCount?:  number
  size?:        'sm' | 'md' | 'lg'
  className?:   string
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
export interface AvatarProps {
  src?:       string
  initials?:  string
  name?:      string
  size?:      'xs' | 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const avatarSizeMap = {
  xs: 'w-6 h-6 text-[9px]',
  sm: 'w-7 h-7 text-[10px]',
  md: 'w-8 h-8 text-[11px]',
  lg: 'w-10 h-10 text-[13px]',
  xl: 'w-12 h-12 text-[15px]',
}

export function Avatar({ src, initials, name, size = 'md', className = '' }: AvatarProps) {
  const fallback = initials ?? name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? '?'

  return (
    <div
      className={[
        'rounded-full flex-shrink-0 flex items-center justify-center font-bold',
        'bg-gradient-to-br from-primary to-secondary border border-white/10',
        'select-none overflow-hidden',
        avatarSizeMap[size],
        className,
      ].join(' ')}
      aria-label={name}
    >
      {src ? (
        <img src={src} alt={name ?? 'Avatar'} className="w-full h-full object-cover" />
      ) : (
        <span className="text-white">{fallback}</span>
      )}
    </div>
  )
}

// ─── AvatarMenu ───────────────────────────────────────────────────────────────
const menuVariants = {
  hidden:  { opacity: 0, scale: 0.95, y: 6  },
  visible: { opacity: 1, scale: 1,    y: 0  },
  exit:    { opacity: 0, scale: 0.97, y: 4  },
}

const defaultActions: AvatarMenuAction[] = [
  { key: 'profile',  label: 'Profile',       icon: <User     className="w-4 h-4" /> },
  { key: 'settings', label: 'Settings',      icon: <Settings className="w-4 h-4" /> },
  { key: 'logout',   label: 'Sign Out',      icon: <LogOut   className="w-4 h-4" />, divider: true, danger: true },
]

export function AvatarMenu({
  name,
  email,
  avatarUrl,
  initials,
  role,
  actions    = defaultActions,
  notifCount = 0,
  size       = 'md',
  className  = '',
}: AvatarMenuProps) {
  const [open, setOpen] = useState(false)
  const ref             = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', handler)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', esc) }
  }, [open])

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={[
          'flex items-center gap-2 rounded-xl px-2 py-1.5',
          'transition-all duration-200 cursor-pointer',
          'hover:bg-white/6 border border-transparent hover:border-white/8',
          open ? 'bg-white/6 border-white/8' : '',
        ].join(' ')}
      >
        {/* Avatar with notif badge */}
        <div className="relative flex-shrink-0">
          <Avatar
            src={avatarUrl}
            initials={initials}
            name={name}
            size={size === 'sm' ? 'sm' : size === 'lg' ? 'lg' : 'md'}
          />
          {notifCount > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full text-[9px] font-bold flex items-center justify-center bg-red-500 text-white border border-[#09090B]">
              {notifCount > 9 ? '9+' : notifCount}
            </span>
          )}
        </div>

        {/* Name + role */}
        {size !== 'sm' && (
          <div className="text-left hidden sm:block">
            <p className="text-[13px] font-semibold text-zinc-200 leading-tight">{name}</p>
            {role && <p className="text-[11px] text-zinc-600 leading-tight">{role}</p>}
          </div>
        )}

        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.18 }}
          className="hidden sm:block"
        >
          <ChevronDown className="w-3.5 h-3.5 text-zinc-600" />
        </motion.div>
      </button>

      {/* Menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={menuVariants}
            initial="hidden" animate="visible" exit="exit"
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            role="menu"
            className="absolute left-0 bottom-full mb-2 w-56 bg-[#1C1C1F] border border-white/10 rounded-2xl shadow-[0_16px_48px_rgba(0,0,0,0.7)] overflow-hidden z-[100]"
          >
            {/* User info header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-white/6">
              <Avatar src={avatarUrl} initials={initials} name={name} size="md" />
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-zinc-200 truncate">{name}</p>
                {email && <p className="text-[11px] text-zinc-600 truncate">{email}</p>}
              </div>
            </div>

            {/* Actions */}
            <div className="p-1.5">
              {actions.map(action => (
                <React.Fragment key={action.key}>
                  {action.divider && <div className="my-1 border-t border-white/6" />}
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => { action.onClick?.(); setOpen(false) }}
                    className={[
                      'w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] font-medium text-left',
                      'transition-colors duration-150 cursor-pointer',
                      action.danger
                        ? 'text-red-400 hover:bg-red-500/10'
                        : 'text-zinc-300 hover:bg-white/6 hover:text-white',
                    ].join(' ')}
                  >
                    {action.icon && (
                      <span className={`w-4 h-4 flex-shrink-0 ${action.danger ? 'text-red-400' : 'text-zinc-500'}`}>
                        {action.icon}
                      </span>
                    )}
                    {action.label}
                  </button>
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
