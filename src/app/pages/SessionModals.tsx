import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FlaskConical, X, AlertTriangle } from 'lucide-react'
import { useToast } from '../../design-system'
import { useSessions } from '../SessionContext'
import type { AnalysisSession } from '../types'

// ─── Edit Session Modal ───────────────────────────────────────────────────────
export function EditSessionModal({ session, open, onClose }: {
  session: AnalysisSession; open: boolean; onClose: () => void
}) {
  const [name, setName] = useState(session.name)
  const [desc, setDesc] = useState(session.description ?? '')
  const [isSaving, setIsSaving] = useState(false)
  
  const { updateSession } = useSessions()
  const { add: addToast } = useToast()

  useEffect(() => {
    if (open) {
      setName(session.name)
      setDesc(session.description ?? '')
    }
  }, [open, session])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    setIsSaving(true)
    try {
      await updateSession(session.id, { name: name.trim(), description: desc.trim() })
      addToast({ variant: 'success', title: 'Session updated', description: 'Your changes have been saved.' })
      onClose()
    } catch (err: any) {
      addToast({ variant: 'error', title: 'Update failed', description: err.response?.data?.message ?? 'Failed to update session.' })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={!isSaving ? onClose : undefined} className="fixed inset-0 bg-black/60 backdrop-blur-[3px] z-[200]" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-md bg-[#18181B] border border-white/10 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between px-6 py-5 border-b border-white/6">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-secondary/15 border border-secondary/25 flex items-center justify-center">
                    <FlaskConical className="w-4 h-4 text-secondary" />
                  </div>
                  <div>
                    <h2 className="text-[15px] font-bold text-white">Edit Session</h2>
                    <p className="text-[12px] text-zinc-500">Update session details</p>
                  </div>
                </div>
                <button type="button" onClick={onClose} disabled={isSaving} className="text-zinc-600 hover:text-zinc-300 transition-colors disabled:opacity-50">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSave} className="p-6 space-y-5">
                <div>
                  <label htmlFor="edit-sess-name" className="block text-[13px] font-medium text-zinc-300 mb-1.5">
                    Session name <span className="text-red-400">*</span>
                  </label>
                  <input id="edit-sess-name" type="text" value={name} onChange={e => setName(e.target.value)}
                    placeholder="e.g. Q3 Revenue Analysis" maxLength={60} required autoFocus disabled={isSaving}
                    className="w-full h-10 px-3.5 rounded-xl bg-zinc-900/70 border border-white/8 text-zinc-100 text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 hover:border-white/14 transition-all duration-200 disabled:opacity-50" />
                </div>
                <div>
                  <label htmlFor="edit-sess-desc" className="block text-[13px] font-medium text-zinc-300 mb-1.5">
                    Description <span className="text-zinc-600 font-normal">(optional)</span>
                  </label>
                  <textarea id="edit-sess-desc" value={desc} onChange={e => setDesc(e.target.value)}
                    placeholder="What are you trying to find out?" rows={2} maxLength={200} disabled={isSaving}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/70 border border-white/8 text-zinc-100 text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 hover:border-white/14 transition-all duration-200 resize-none leading-relaxed disabled:opacity-50" />
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={onClose} disabled={isSaving}
                    className="flex-1 h-10 rounded-xl text-[14px] font-semibold text-zinc-400 bg-white/5 border border-white/8 hover:bg-white/8 hover:text-white transition-all duration-200 disabled:opacity-50">
                    Cancel
                  </button>
                  <motion.button type="submit" disabled={!name.trim() || isSaving}
                    whileHover={name.trim() && !isSaving ? { y: -1 } : {}} whileTap={name.trim() && !isSaving ? { scale: 0.98 } : {}}
                    className={`flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-[14px] font-semibold text-white transition-all duration-200 ${
                      name.trim() && !isSaving ? 'bg-secondary hover:bg-[#7C3AED] shadow-[0_0_20px_rgba(139,92,246,0.25)]' : 'bg-secondary/30 cursor-not-allowed'
                    }`}>
                    {isSaving && <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                    Save Changes
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

// ─── Archive Session Modal ────────────────────────────────────────────────────
export function ArchiveSessionModal({ session, open, onClose, onArchived }: {
  session: AnalysisSession; open: boolean; onClose: () => void; onArchived?: () => void
}) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { deleteSession } = useSessions()
  const { add: addToast } = useToast()

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteSession(session.id)
      addToast({ variant: 'success', title: 'Session archived', description: `"${session.name}" has been archived.` })
      if (onArchived) onArchived()
      else onClose()
    } catch (err: any) {
      addToast({ variant: 'error', title: 'Archive failed', description: err.response?.data?.message ?? 'Failed to archive session.' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={!isDeleting ? onClose : undefined} className="fixed inset-0 bg-black/60 backdrop-blur-[3px] z-[200]" />
          <motion.div initial={{ opacity: 0, scale: 0.95, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }} transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[201] flex items-center justify-center p-4 pointer-events-none">
            <div className="pointer-events-auto w-full max-w-sm bg-[#18181B] border border-white/10 rounded-2xl shadow-[0_24px_64px_rgba(0,0,0,0.6)] p-6 text-center"
              onClick={e => e.stopPropagation()}>
              <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h2 className="text-[18px] font-bold text-white mb-2">Archive Session?</h2>
              <p className="text-[13px] text-zinc-400 mb-6 leading-relaxed">
                This session will be archived and removed from the active sessions list. This action can’t be undone.
              </p>
              <div className="flex gap-3">
                <button type="button" onClick={onClose} disabled={isDeleting}
                  className="flex-1 h-10 rounded-xl text-[14px] font-semibold text-zinc-300 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors disabled:opacity-50">
                  Cancel
                </button>
                <button type="button" onClick={handleDelete} disabled={isDeleting}
                  className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-[14px] font-semibold text-white bg-red-500 hover:bg-red-600 shadow-[0_0_20px_rgba(239,68,68,0.2)] transition-colors disabled:opacity-50">
                  {isDeleting && <svg className="w-4 h-4 animate-spin text-white" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>}
                  Archive Session
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
