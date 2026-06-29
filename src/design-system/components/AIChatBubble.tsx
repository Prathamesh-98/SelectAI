import React from 'react'
import { motion } from 'framer-motion'
import { Database, Loader2, Sparkles } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────
export type BubbleRole = 'user' | 'ai'

export interface AIChatBubbleProps {
  role:        BubbleRole
  content:     React.ReactNode
  timestamp?:  string
  streaming?:  boolean      // shows animated typing cursor
  error?:      boolean
  avatar?:     React.ReactNode
  className?:  string
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AIChatBubble({
  role,
  content,
  timestamp,
  streaming  = false,
  error      = false,
  avatar,
  className  = '',
}: AIChatBubbleProps) {
  const isUser = role === 'user'

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={[
        'flex gap-3 w-full',
        isUser ? 'flex-row-reverse' : 'flex-row',
        className,
      ].join(' ')}
    >
      {/* Avatar */}
      <div className="flex-shrink-0 mt-0.5">
        {avatar ?? (
          isUser ? (
            <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="text-[11px] font-bold text-primary">U</span>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.3)]">
              <Database className="w-3.5 h-3.5 text-white" />
            </div>
          )
        )}
      </div>

      {/* Bubble */}
      <div className={`flex flex-col gap-1 max-w-[80%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Role label */}
        <span className="text-[11px] font-medium text-zinc-600 px-1">
          {isUser ? 'You' : 'SelectAI'}
        </span>

        {/* Bubble body */}
        <div
          className={[
            'relative rounded-2xl px-4 py-3 text-[13px] leading-relaxed',
            isUser
              ? 'bg-primary/15 border border-primary/25 text-zinc-100 rounded-tr-sm'
              : error
              ? 'bg-red-500/10 border border-red-500/20 text-red-300 rounded-tl-sm'
              : 'bg-[#222225] border border-white/[0.07] text-zinc-300 rounded-tl-sm',
          ].join(' ')}
        >
          {/* AI indicator */}
          {!isUser && !error && (
            <div className="flex items-center gap-1.5 mb-2 pb-2 border-b border-white/6">
              <Sparkles className="w-3 h-3 text-primary" />
              <span className="text-[10px] font-semibold text-primary uppercase tracking-wider">AI Response</span>
              {streaming && (
                <span className="ml-auto flex items-center gap-1 text-[10px] text-zinc-600">
                  <Loader2 className="w-2.5 h-2.5 animate-spin" /> Generating…
                </span>
              )}
            </div>
          )}

          {content}

          {/* Streaming cursor */}
          {streaming && (
            <motion.span
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 0.8, repeat: Infinity }}
              className="inline-block w-[2px] h-[14px] bg-primary ml-1 align-text-bottom rounded-full"
            />
          )}
        </div>

        {/* Timestamp */}
        {timestamp && !streaming && (
          <span className="text-[10px] text-zinc-700 px-1">{timestamp}</span>
        )}
      </div>
    </motion.div>
  )
}

// ─── ChatInput ────────────────────────────────────────────────────────────────
export interface ChatInputProps {
  value?:        string
  onChange?:     (v: string) => void
  onSubmit?:     () => void
  placeholder?:  string
  loading?:      boolean
  disabled?:     boolean
  className?:    string
}

export function ChatInput({
  value = '', onChange, onSubmit,
  placeholder = 'Ask a question about your data…',
  loading = false, disabled = false, className = '',
}: ChatInputProps) {
  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onSubmit?.() }
  }

  return (
    <div className={[
      'flex items-end gap-3 p-3 rounded-2xl',
      'bg-[#1C1C1F] border border-white/8',
      'focus-within:border-primary/40 focus-within:ring-2 focus-within:ring-primary/15',
      'transition-all duration-200',
      className,
    ].join(' ')}>
      <textarea
        value={value}
        onChange={e => onChange?.(e.target.value)}
        onKeyDown={handleKey}
        disabled={disabled || loading}
        placeholder={placeholder}
        rows={1}
        className={[
          'flex-1 bg-transparent text-[14px] text-zinc-100 placeholder:text-zinc-600',
          'resize-none outline-none leading-relaxed',
          'disabled:opacity-50',
          'max-h-[120px] overflow-y-auto',
        ].join(' ')}
        style={{ scrollbarWidth: 'none' }}
      />
      <button
        type="button"
        onClick={onSubmit}
        disabled={!value?.trim() || loading || disabled}
        className={[
          'flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center',
          'transition-all duration-200',
          value?.trim() && !loading && !disabled
            ? 'bg-primary text-white hover:bg-[#2563EB] shadow-[0_0_16px_rgba(59,130,246,0.3)]'
            : 'bg-white/5 text-zinc-600 cursor-not-allowed',
        ].join(' ')}
        aria-label="Send message"
      >
        {loading
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <span className="text-[16px] leading-none rotate-90">↑</span>
        }
      </button>
    </div>
  )
}
