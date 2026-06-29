import React, { createContext, useContext, useCallback, useState, useId } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
export type ToastVariant = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id:          string
  variant:     ToastVariant
  title:       string
  description?: string
  duration?:   number     // ms, 0 = persistent
  action?:     { label: string; onClick: () => void }
}

type ToastContextValue = { add: (t: Omit<Toast, 'id'>) => string; remove: (id: string) => void }

// ─── Context ──────────────────────────────────────────────────────────────────
const ToastContext = createContext<ToastContextValue>({ add: () => '', remove: () => {} })
export const useToast = () => useContext(ToastContext)

// ─── Config ───────────────────────────────────────────────────────────────────
const variantConfig: Record<ToastVariant, { icon: React.ReactNode; bar: string; bg: string; border: string }> = {
  success: { icon: <CheckCircle2 className="w-4 h-4 text-green-400" />, bar: 'bg-green-400', bg: 'bg-[#1A2420]', border: 'border-green-500/25' },
  error:   { icon: <AlertCircle  className="w-4 h-4 text-red-400"   />, bar: 'bg-red-400',   bg: 'bg-[#221A1A]', border: 'border-red-500/25'   },
  warning: { icon: <AlertTriangle className="w-4 h-4 text-amber-400" />, bar: 'bg-amber-400', bg: 'bg-[#22201A]', border: 'border-amber-500/25' },
  info:    { icon: <Info         className="w-4 h-4 text-primary"   />, bar: 'bg-primary',   bg: 'bg-[#181E2A]', border: 'border-primary/25'   },
}

// ─── Single Toast ─────────────────────────────────────────────────────────────
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const cfg = variantConfig[toast.variant]

  React.useEffect(() => {
    const dur = toast.duration ?? 4000
    if (dur === 0) return
    const t = setTimeout(() => onRemove(toast.id), dur)
    return () => clearTimeout(t)
  }, [toast, onRemove])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0,  scale: 1    }}
      exit={{ opacity: 0, y: -10, scale: 0.97, transition: { duration: 0.18 } }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={[
        'relative flex items-start gap-3 w-[360px] max-w-[90vw] rounded-xl border p-4 overflow-hidden',
        'shadow-[0_16px_48px_rgba(0,0,0,0.6)]',
        cfg.bg, cfg.border,
      ].join(' ')}
      role="alert"
      aria-live="polite"
    >
      {/* Accent bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${cfg.bar} rounded-l-xl`} />

      {/* Icon */}
      <div className="flex-shrink-0 mt-0.5">{cfg.icon}</div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-zinc-100">{toast.title}</p>
        {toast.description && (
          <p className="text-[12px] text-zinc-500 mt-0.5 leading-relaxed">{toast.description}</p>
        )}
        {toast.action && (
          <button
            type="button"
            onClick={() => { toast.action!.onClick(); onRemove(toast.id) }}
            className="mt-2 text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            {toast.action.label}
          </button>
        )}
      </div>

      {/* Close */}
      <button
        type="button"
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
        className="flex-shrink-0 text-zinc-600 hover:text-zinc-300 transition-colors mt-0.5"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  )
}

// ─── Toast Provider ───────────────────────────────────────────────────────────
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const add = useCallback((t: Omit<Toast, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random()}`
    setToasts(prev => [...prev, { ...t, id }])
    return id
  }, [])

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ add, remove }}>
      {children}
      {/* Portal-like fixed container */}
      <div
        className="fixed bottom-5 right-5 z-[300] flex flex-col-reverse gap-2.5 pointer-events-none"
        aria-label="Notifications"
      >
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <div key={t.id} className="pointer-events-auto">
              <ToastItem toast={t} onRemove={remove} />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  )
}
