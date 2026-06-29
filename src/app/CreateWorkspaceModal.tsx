import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Database } from 'lucide-react'
import { WORKSPACE_COLORS } from './mockData'

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  open:     boolean
  onClose:  () => void
  onCreate: (data: { name: string; description: string; color: string }) => void
}

// ─── Component ────────────────────────────────────────────────────────────────
export function CreateWorkspaceModal({ open, onClose, onCreate }: Props) {
  const [name,   setName]   = useState('')
  const [desc,   setDesc]   = useState('')
  const [color,  setColor]  = useState(WORKSPACE_COLORS[0].value)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreate({ name: name.trim(), description: desc.trim(), color })
    setName(''); setDesc(''); setColor(WORKSPACE_COLORS[0].value)
    onClose()
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-[3px] z-[200]"
          />

          {/* Panel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1,    y: 0    }}
            exit={{    opacity: 0, scale: 0.97,  y: 8   }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md bg-[#18181B] border border-white/10 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <Database className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-white">Create Workspace</h2>
                    <p className="text-[12px] text-zinc-500">Set up a new analytics environment</p>
                  </div>
                </div>
                <button type="button" onClick={onClose} className="text-zinc-600 hover:text-zinc-300 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-5">

                {/* Name */}
                <div>
                  <label htmlFor="ws-name" className="block text-[13px] font-medium text-zinc-300 mb-1.5">
                    Workspace name <span className="text-red-400">*</span>
                  </label>
                  <input
                    id="ws-name"
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="e.g. Marketing Analytics"
                    maxLength={48}
                    required
                    autoFocus
                    className="w-full h-10 px-3.5 rounded-xl bg-zinc-900/70 border border-white/8 text-zinc-100 text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 hover:border-white/14 transition-all duration-200"
                  />
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="ws-desc" className="block text-[13px] font-medium text-zinc-300 mb-1.5">
                    Description <span className="text-zinc-600 font-normal">(optional)</span>
                  </label>
                  <textarea
                    id="ws-desc"
                    value={desc}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="What will this workspace be used for?"
                    rows={3}
                    maxLength={200}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/70 border border-white/8 text-zinc-100 text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 hover:border-white/14 transition-all duration-200 resize-none leading-relaxed"
                  />
                </div>

                {/* Accent color */}
                <div>
                  <p className="text-[13px] font-medium text-zinc-300 mb-3">Accent color</p>
                  <div className="flex flex-wrap gap-2.5">
                    {WORKSPACE_COLORS.map(c => (
                      <button
                        key={c.value}
                        type="button"
                        title={c.label}
                        onClick={() => setColor(c.value)}
                        className={`w-8 h-8 rounded-full transition-all duration-150 flex items-center justify-center ${
                          color === c.value ? 'ring-2 ring-offset-2 ring-offset-[#18181B] scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: c.value, ringColor: c.value } as React.CSSProperties}
                      >
                        {color === c.value && (
                          <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 14 11" fill="none">
                            <path d="M1 5.5l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preview pill */}
                <div className="bg-white/3 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg flex-shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-[13px] text-zinc-300 truncate">{name || 'Workspace name…'}</span>
                </div>

                {/* Buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 h-10 rounded-xl text-[14px] font-semibold text-zinc-400 bg-white/5 border border-white/8 hover:bg-white/8 hover:text-white transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <motion.button
                    type="submit"
                    whileHover={!name.trim() ? {} : { y: -1 }}
                    whileTap={!name.trim() ? {} : { scale: 0.98 }}
                    disabled={!name.trim()}
                    className={`flex-1 h-10 rounded-xl text-[14px] font-semibold text-white transition-all duration-200 ${
                      name.trim()
                        ? 'bg-primary hover:bg-[#2563EB] shadow-[0_0_20px_rgba(59,130,246,0.25)]'
                        : 'bg-primary/30 cursor-not-allowed'
                    }`}
                  >
                    Create Workspace
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
