import React, { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X } from 'lucide-react'
import { Button } from './Button'

// ─── Types ────────────────────────────────────────────────────────────────────
export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full'

export interface ModalProps {
  open:          boolean
  onClose:       () => void
  title?:        React.ReactNode
  description?:  string
  children?:     React.ReactNode
  footer?:       React.ReactNode
  size?:         ModalSize
  closeOnOutside?: boolean
  showClose?:    boolean
  className?:    string
}

const sizeMap: Record<ModalSize, string> = {
  sm:   'max-w-sm',
  md:   'max-w-md',
  lg:   'max-w-lg',
  xl:   'max-w-2xl',
  full: 'max-w-[95vw] max-h-[90vh]',
}

const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1 },
}

const panelVariants = {
  hidden:  { opacity: 0, scale: 0.95, y: 12 },
  visible: { opacity: 1, scale: 1,    y: 0   },
  exit:    { opacity: 0, scale: 0.96, y: 8   },
}

// ─── Component ────────────────────────────────────────────────────────────────
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size           = 'md',
  closeOnOutside = true,
  showClose      = true,
  className      = '',
}: ModalProps) {
  // Keyboard: Escape to close
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  }, [onClose])

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [open, handleKeyDown])

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
        >
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            transition={{ duration: 0.2 }}
            onClick={closeOnOutside ? onClose : undefined}
            className="absolute inset-0 bg-black/70 backdrop-blur-[6px]"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className={[
              'relative z-10 w-full rounded-2xl overflow-hidden',
              'bg-[#1C1C1F] border border-white/[0.08]',
              'shadow-[0_24px_80px_rgba(0,0,0,0.8)]',
              sizeMap[size],
              className,
            ].join(' ')}
          >
            {/* Header */}
            {(title || showClose) && (
              <div className="flex items-start justify-between gap-4 px-6 pt-6 pb-5 border-b border-white/6">
                <div>
                  {title && (
                    <h2 id="modal-title" className="text-[17px] font-semibold text-zinc-100 leading-snug">
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-[13px] text-zinc-500 mt-1 leading-relaxed">{description}</p>
                  )}
                </div>
                {showClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Close dialog"
                    className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-zinc-500 hover:text-zinc-300 hover:bg-white/6 transition-all duration-150"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Body */}
            {children && (
              <div className="px-6 py-5 overflow-y-auto max-h-[60vh]">
                {children}
              </div>
            )}

            {/* Footer */}
            {footer && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-white/6 bg-white/[0.02]">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────
export interface ConfirmModalProps {
  open:          boolean
  onClose:       () => void
  onConfirm:     () => void
  title:         string
  description?:  string
  confirmLabel?: string
  cancelLabel?:  string
  destructive?:  boolean
  loading?:      boolean
}

export function ConfirmModal({
  open, onClose, onConfirm,
  title, description,
  confirmLabel = 'Confirm',
  cancelLabel  = 'Cancel',
  destructive  = false,
  loading      = false,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      size="sm"
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose}>
            {cancelLabel}
          </Button>
          <Button
            variant={destructive ? 'destructive' : 'primary'}
            size="sm"
            loading={loading}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </>
      }
    />
  )
}
