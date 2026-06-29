// ─── SelectAI Design Tokens ──────────────────────────────────────────────────
// Single source of truth for all design decisions across the system

export const colors = {
  // Backgrounds
  bg: {
    base:    '#09090B',
    surface: '#18181B',
    surface2:'#27272A',
    surface3:'#3F3F46',
  },
  // Brand palette
  primary:   { DEFAULT: '#3B82F6', hover: '#2563EB', muted: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)' },
  secondary: { DEFAULT: '#8B5CF6', hover: '#7C3AED', muted: 'rgba(139,92,246,0.12)', border: 'rgba(139,92,246,0.25)' },
  accent:    { DEFAULT: '#06B6D4', hover: '#0891B2', muted: 'rgba(6,182,212,0.12)',   border: 'rgba(6,182,212,0.25)'  },
  // Semantic
  success: { DEFAULT: '#22C55E', muted: 'rgba(34,197,94,0.12)',   border: 'rgba(34,197,94,0.25)'  },
  warning: { DEFAULT: '#F59E0B', muted: 'rgba(245,158,11,0.12)',  border: 'rgba(245,158,11,0.25)' },
  error:   { DEFAULT: '#EF4444', muted: 'rgba(239,68,68,0.12)',   border: 'rgba(239,68,68,0.25)'  },
  // Text
  text: {
    primary:   '#FAFAFA',
    secondary: '#A1A1AA',
    muted:     '#71717A',
    disabled:  '#52525B',
  },
  // Borders
  border: {
    subtle: 'rgba(255,255,255,0.05)',
    default:'rgba(255,255,255,0.08)',
    strong: 'rgba(255,255,255,0.15)',
  },
} as const

export const radius = {
  sm:  '0.5rem',   // 8px
  md:  '0.75rem',  // 12px
  lg:  '1rem',     // 16px
  xl:  '1.25rem',  // 20px
  '2xl':'1.5rem',  // 24px
  full:'9999px',
} as const

export const spacing = {
  0: '0',
  1: '0.25rem',
  2: '0.5rem',
  3: '0.75rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  8: '2rem',
  10: '2.5rem',
  12: '3rem',
  16: '4rem',
} as const

export const typography = {
  fontFamily: "'Inter', system-ui, sans-serif",
  size: {
    xs:   '0.6875rem', // 11px
    sm:   '0.8125rem', // 13px
    base: '0.9375rem', // 15px — optical base
    lg:   '1.0625rem', // 17px
    xl:   '1.25rem',   // 20px
    '2xl':'1.5rem',    // 24px
    '3xl':'1.875rem',  // 30px
    '4xl':'2.25rem',   // 36px
  },
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700 },
  leading: { tight: 1.2, normal: 1.5, relaxed: 1.65 },
} as const

export const shadow = {
  sm:      '0 1px 3px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)',
  md:      '0 4px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)',
  lg:      '0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)',
  xl:      '0 16px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.08)',
  glowBlue:'0 0 32px rgba(59,130,246,0.25)',
  glowPurple:'0 0 32px rgba(139,92,246,0.25)',
  glowCyan:'0 0 32px rgba(6,182,212,0.2)',
} as const

export const motion = {
  spring:  { type: 'spring', stiffness: 400, damping: 28 },
  smooth:  { duration: 0.25, ease: [0.22, 1, 0.36, 1] },
  fast:    { duration: 0.15, ease: [0.22, 1, 0.36, 1] },
  slow:    { duration: 0.5,  ease: [0.22, 1, 0.36, 1] },
} as const

// Tailwind class helpers (for consistent usage across components)
export const tw = {
  glass:       'bg-[#18181B]/70 backdrop-blur-[16px] border border-white/[0.06]',
  glassStrong: 'bg-[#18181B]/90 backdrop-blur-[24px] border border-white/[0.08]',
  surface:     'bg-[#18181B] border border-white/[0.06]',
  surface2:    'bg-[#27272A] border border-white/[0.06]',
  focusRing:   'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 focus-visible:ring-offset-1 focus-visible:ring-offset-[#09090B]',
  truncate:    'overflow-hidden text-ellipsis whitespace-nowrap',
} as const
