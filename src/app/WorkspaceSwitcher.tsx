import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check, Plus } from 'lucide-react'
import type { Workspace } from './types'

interface Props {
  workspaces:        Workspace[]
  activeWorkspaceId: string
  onSwitch:          (id: string) => void
  onCreateNew:       () => void
}

const menuV = {
  hidden:  { opacity: 0, scale: 0.96, y: -6 },
  visible: { opacity: 1, scale: 1,    y: 0   },
  exit:    { opacity: 0, scale: 0.97, y: -4  },
}

export function WorkspaceSwitcher({ workspaces, activeWorkspaceId, onSwitch, onCreateNew }: Props) {
  const [open, setOpen] = useState(false)
  const ref             = useRef<HTMLDivElement>(null)
  const active          = workspaces.find(w => w.id === activeWorkspaceId)!

  // Click outside / Escape to close
  useEffect(() => {
    if (!open) return
    const click = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    const esc   = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', click)
    document.addEventListener('keydown', esc)
    return () => { document.removeEventListener('mousedown', click); document.removeEventListener('keydown', esc) }
  }, [open])

  return (
    <div ref={ref} className="relative px-2">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`w-full flex items-center gap-2.5 h-10 px-2.5 rounded-xl transition-all duration-200 ${
          open ? 'bg-white/8 border border-white/10' : 'hover:bg-white/5 border border-transparent'
        }`}
      >
        {/* Color dot */}
        <div
          className="w-5 h-5 rounded-md flex-shrink-0 shadow-[0_0_8px_var(--ws-color)]"
          style={{ backgroundColor: active.color, '--ws-color': active.color + '66' } as React.CSSProperties}
        />
        <span className="flex-1 text-left text-[13px] font-semibold text-zinc-200 truncate">
          {active.name}
        </span>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.18 }}>
          <ChevronDown className="w-3.5 h-3.5 text-zinc-500 flex-shrink-0" />
        </motion.div>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            variants={menuV}
            initial="hidden" animate="visible" exit="exit"
            transition={{ duration: 0.15, ease: [0.22, 1, 0.36, 1] }}
            role="menu"
            className="absolute left-0 right-0 top-full mt-1.5 bg-[#1C1C1F] border border-white/10 rounded-xl shadow-[0_16px_48px_rgba(0,0,0,0.7)] overflow-hidden z-[100]"
          >
            {/* Section label */}
            <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold uppercase tracking-widest text-zinc-600">
              Your Workspaces
            </p>

            {/* Workspace list */}
            <div className="px-1.5 pb-1.5">
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  type="button"
                  role="menuitem"
                  onClick={() => { onSwitch(ws.id); setOpen(false) }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] transition-colors duration-150 ${
                    ws.id === activeWorkspaceId
                      ? 'bg-white/6 text-white'
                      : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div
                    className="w-4 h-4 rounded flex-shrink-0"
                    style={{ backgroundColor: ws.color }}
                  />
                  <span className="flex-1 text-left truncate">{ws.name}</span>
                  {ws.id === activeWorkspaceId && (
                    <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>

            {/* Divider + Create */}
            <div className="border-t border-white/6 px-1.5 py-1.5">
              <button
                type="button"
                role="menuitem"
                onClick={() => { setOpen(false); onCreateNew() }}
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] text-primary hover:bg-primary/10 transition-colors duration-150"
              >
                <Plus className="w-4 h-4" />
                <span className="font-semibold">Create Workspace</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
