import React from 'react'
import { motion } from 'framer-motion'
import { Database } from 'lucide-react'
import { WorkflowPreview } from './WorkflowPreview'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthLayoutProps {
  children:    React.ReactNode
  title:       string
  subtitle?:   string
}

// ─── Component ────────────────────────────────────────────────────────────────
export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-[#09090B] flex">

      {/* ── Left panel: Auth form ── */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10">

        {/* Subtle background glow */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/5 rounded-full blur-[80px]" />
        </div>

        {/* Logo header */}
        <div className="relative flex-shrink-0 p-6 sm:p-8">
          <a href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-[0_0_20px_rgba(59,130,246,0.25)] group-hover:shadow-[0_0_28px_rgba(59,130,246,0.4)] transition-shadow duration-300">
              <Database className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-semibold text-[17px] tracking-tight">
              Select<span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">AI</span>
            </span>
          </a>
        </div>

        {/* Form area */}
        <div className="relative flex-1 flex items-center justify-center px-5 py-8 sm:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-[400px]"
          >
            {/* Page heading */}
            <div className="mb-7">
              <h1 className="text-[26px] font-bold text-white tracking-tight leading-tight mb-1.5">
                {title}
              </h1>
              {subtitle && (
                <p className="text-[14px] text-zinc-500 leading-relaxed">{subtitle}</p>
              )}
            </div>

            {/* Form content (injected by each page) */}
            {children}
          </motion.div>
        </div>

        {/* Footer */}
        <div className="relative flex-shrink-0 px-8 py-5 border-t border-white/5">
          <p className="text-[11px] text-zinc-700 text-center">
            © {new Date().getFullYear()} SelectAI. All rights reserved.
            {' · '}
            <a href="#" className="hover:text-zinc-500 transition-colors">Privacy</a>
            {' · '}
            <a href="#" className="hover:text-zinc-500 transition-colors">Terms</a>
          </p>
        </div>
      </div>

      {/* ── Right panel: Workflow preview (desktop only) ── */}
      <div className="hidden lg:flex w-[520px] xl:w-[580px] flex-shrink-0 relative overflow-hidden">
        {/* Rich dark background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D0D12] via-[#0F1018] to-[#09090B]" />

        {/* Grid texture */}
        <div
          className="absolute inset-0 opacity-[0.025] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.18) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(255,255,255,0.18) 1px, transparent 1px)`,
            backgroundSize: '52px 52px',
          }}
        />

        {/* Glow orbs */}
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/8  rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-secondary/6 rounded-full blur-[80px] pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col w-full px-10 py-14 justify-center">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0  }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="mb-8"
          >
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-zinc-600 mb-3">
              How SelectAI Works
            </p>
            <h2 className="text-[22px] font-bold text-white leading-snug">
              From CSV to insight{' '}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                in seconds.
              </span>
            </h2>
          </motion.div>

          {/* Animated workflow */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.65, delay: 0.25 }}
            className="flex-1"
          >
            <WorkflowPreview />
          </motion.div>
        </div>
      </div>
    </div>
  )
}
