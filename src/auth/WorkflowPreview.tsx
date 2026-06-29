import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, MessageSquare, Code2, Table2, BarChart2,
  Lightbulb, CheckCircle2, FileText, Loader2
} from 'lucide-react'

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEP_DURATION = 3400 // ms per step

const steps = [
  { id: 'upload', label: 'Upload Dataset',      icon: Upload,        color: 'text-accent',     bg: 'bg-accent/15',     border: 'border-accent/25'    },
  { id: 'ask',    label: 'Natural Language',    icon: MessageSquare, color: 'text-primary',    bg: 'bg-primary/15',    border: 'border-primary/25'   },
  { id: 'sql',    label: 'AI Generates SQL',    icon: Code2,         color: 'text-secondary',  bg: 'bg-secondary/15',  border: 'border-secondary/25' },
  { id: 'table',  label: 'Query Results',       icon: Table2,        color: 'text-green-400',  bg: 'bg-green-500/15',  border: 'border-green-500/25' },
  { id: 'chart',  label: 'Interactive Chart',   icon: BarChart2,     color: 'text-amber-400',  bg: 'bg-amber-500/15',  border: 'border-amber-500/25' },
  { id: 'insight',label: 'AI Business Summary', icon: Lightbulb,     color: 'text-primary',    bg: 'bg-primary/15',    border: 'border-primary/25'   },
]

// ─── Step content panels ──────────────────────────────────────────────────────
function UploadPanel() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3 bg-white/4 border border-white/8 rounded-xl px-4 py-3">
        <div className="w-9 h-9 rounded-xl bg-accent/15 border border-accent/25 flex items-center justify-center flex-shrink-0">
          <FileText className="w-4 h-4 text-accent" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-white">sales_2025.csv</p>
          <p className="text-[11px] text-zinc-500">4,820 rows · 7 columns · 312 KB</p>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <CheckCircle2 className="w-4 h-4 text-green-400" />
          <span className="text-[11px] font-semibold text-green-400">Ready</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {['month', 'category', 'product', 'units_sold', 'unit_price', 'total_sales', 'region'].map(col => (
          <span key={col} className="px-2 py-0.5 rounded-md text-[10px] font-mono text-zinc-500 bg-white/4 border border-white/6">
            {col}
          </span>
        ))}
      </div>
      <p className="text-[11px] text-zinc-600">Schema detected automatically · Ready to query</p>
    </div>
  )
}

function AskPanel() {
  return (
    <div className="space-y-3">
      <div className="bg-white/4 border border-primary/25 rounded-xl px-4 py-3">
        <p className="text-[13px] text-white font-medium leading-relaxed">
          "Show monthly sales by category."
        </p>
      </div>
      <div className="flex items-center gap-2 text-[11px] text-zinc-600">
        <Loader2 className="w-3 h-3 animate-spin text-primary" />
        <span>Parsing intent · Mapping to schema · Generating SQL…</span>
      </div>
    </div>
  )
}

function SQLPanel() {
  return (
    <div className="rounded-xl bg-[#0C0C10] border border-white/6 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-white/5 bg-white/2">
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-white/10" />
          <div className="w-2 h-2 rounded-full bg-white/10" />
          <div className="w-2 h-2 rounded-full bg-white/10" />
        </div>
        <span className="text-[10px] text-zinc-600 ml-1">Generated SQL</span>
        <span className="ml-auto text-[9px] font-semibold text-secondary bg-secondary/10 border border-secondary/15 px-1.5 py-0.5 rounded-full">AI</span>
      </div>
      <pre className="px-4 py-3 text-[11px] font-mono leading-[1.8] overflow-x-auto">
        <span className="text-secondary">SELECT</span>{' '}
        <span className="text-accent">month</span>,{' '}
        <span className="text-accent">category</span>,{'\n'}
        {'       '}
        <span className="text-primary">SUM</span>(<span className="text-accent">total_sales</span>){' '}
        <span className="text-secondary">AS</span>{' '}
        <span className="text-white">total_sales</span>{'\n'}
        <span className="text-secondary">FROM</span>{'   '}
        <span className="text-white">sales_2025</span>{'\n'}
        <span className="text-secondary">GROUP BY</span>{' '}
        <span className="text-accent">month</span>,{' '}
        <span className="text-accent">category</span>{'\n'}
        <span className="text-secondary">ORDER BY</span>{' '}
        <span className="text-accent">month</span>{' '}
        <span className="text-secondary">ASC</span>
        <span className="text-zinc-600">;</span>
      </pre>
    </div>
  )
}

function TablePanel() {
  const rows = [
    { month: 'Jan 2025', cat: 'Electronics', total: '$62,000' },
    { month: 'Jan 2025', cat: 'Apparel',     total: '$47,700' },
    { month: 'Feb 2025', cat: 'Electronics', total: '$54,500' },
    { month: 'Feb 2025', cat: 'Apparel',     total: '$44,250' },
  ]
  return (
    <div className="rounded-xl border border-white/6 overflow-hidden text-[11px]">
      <div className="flex gap-4 px-4 py-2 bg-white/4 border-b border-white/6 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider">
        <span className="flex-1">Month</span>
        <span className="flex-1">Category</span>
        <span className="text-right">Total Sales</span>
      </div>
      {rows.map((r, i) => (
        <div key={i} className={`flex gap-4 px-4 py-2 border-b border-white/4 last:border-0 ${i === 0 ? 'bg-primary/5' : ''}`}>
          <span className="flex-1 text-zinc-400 font-mono">{r.month}</span>
          <span className="flex-1">
            <span className={`px-1.5 py-0.5 rounded text-[9px] font-semibold ${r.cat === 'Electronics' ? 'bg-primary/15 text-primary' : 'bg-secondary/15 text-secondary'}`}>
              {r.cat}
            </span>
          </span>
          <span className="text-right text-white font-mono font-semibold">{r.total}</span>
        </div>
      ))}
      <div className="px-4 py-2 text-[10px] text-zinc-600 bg-white/2">4 rows · 0.24s</div>
    </div>
  )
}

function ChartPanel() {
  const bars = [
    { label: 'Jan', e: 62, a: 47 },
    { label: 'Feb', e: 54, a: 44 },
    { label: 'Mar', e: 79, a: 51 },
    { label: 'Apr', e: 68, a: 55 },
    { label: 'May', e: 91, a: 60 },
    { label: 'Jun', e: 83, a: 58 },
  ]
  const max = 100
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-4 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-primary inline-block" />Electronics</span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-secondary inline-block" />Apparel</span>
      </div>
      <div className="flex items-end gap-2 h-24">
        {bars.map(b => (
          <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end gap-0.5 h-20">
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(b.e / max) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 rounded-t-sm bg-primary/80"
              />
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${(b.a / max) * 100}%` }}
                transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="flex-1 rounded-t-sm bg-secondary/70"
              />
            </div>
            <span className="text-[9px] text-zinc-600">{b.label}</span>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-zinc-600">Jan – Jun 2025 · Values in USD (thousands)</p>
    </div>
  )
}

function InsightPanel() {
  return (
    <div className="rounded-xl bg-gradient-to-br from-primary/10 to-secondary/6 border border-primary/20 p-4">
      <div className="flex items-center gap-2 mb-2.5">
        <Lightbulb className="w-3.5 h-3.5 text-primary" />
        <span className="text-[10px] font-bold text-primary uppercase tracking-wider">AI Business Summary</span>
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
      </div>
      <p className="text-[12px] text-zinc-400 leading-relaxed">
        <span className="text-white font-medium">Electronics</span> leads total sales across all months,
        peaking in <span className="text-white font-medium">May 2025</span> at{' '}
        <span className="text-primary font-semibold">$91K</span>.{' '}
        <span className="text-white font-medium">Apparel</span> shows consistent growth of{' '}
        <span className="text-green-400 font-semibold">+5.3% MoM</span>.
        The gap between categories has narrowed by <span className="text-accent font-medium">18%</span> since January.
      </p>
    </div>
  )
}

const stepContent = [
  <UploadPanel  key="upload"  />,
  <AskPanel     key="ask"     />,
  <SQLPanel     key="sql"     />,
  <TablePanel   key="table"   />,
  <ChartPanel   key="chart"   />,
  <InsightPanel key="insight" />,
]

// ─── Main component ───────────────────────────────────────────────────────────
export function WorkflowPreview() {
  const [activeStep, setActiveStep] = useState(0)
  const [progress,   setProgress]   = useState(0)
  const intervalRef  = useRef<ReturnType<typeof setInterval> | null>(null)
  const progressRef  = useRef<ReturnType<typeof setInterval> | null>(null)

  const startTimers = () => {
    // Progress bar ticks every 34ms → fills in STEP_DURATION ms
    progressRef.current = setInterval(() => {
      setProgress(p => {
        if (p >= 100) return 100
        return p + (100 / (STEP_DURATION / 34))
      })
    }, 34)

    // Advance step
    intervalRef.current = setInterval(() => {
      setProgress(0)
      setActiveStep(s => (s + 1) % steps.length)
    }, STEP_DURATION)
  }

  useEffect(() => {
    setProgress(0)
    startTimers()
    return () => {
      if (intervalRef.current)  clearInterval(intervalRef.current)
      if (progressRef.current)  clearInterval(progressRef.current)
    }
  }, [])

  const goToStep = (i: number) => {
    if (intervalRef.current)  clearInterval(intervalRef.current)
    if (progressRef.current)  clearInterval(progressRef.current)
    setActiveStep(i)
    setProgress(0)
    startTimers()
  }

  const step = steps[activeStep]
  const Icon = step.icon

  return (
    <div className="flex flex-col h-full w-full max-w-sm mx-auto select-none">

      {/* Floating label */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        className="mb-5"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] font-semibold text-zinc-400">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
          SelectAI · Live Workflow
        </div>
      </motion.div>

      {/* Mini app chrome */}
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
        className="rounded-2xl bg-[#18181B]/80 backdrop-blur-[16px] border border-white/[0.08] shadow-[0_24px_64px_rgba(0,0,0,0.5)] overflow-hidden flex-1"
      >
        {/* Browser bar */}
        <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#FF5F57]/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-[#28C840]/60" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-1.5 bg-white/5 rounded-md px-3 py-1 text-[10px] text-zinc-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
              app.selectai.io/workspace
            </div>
          </div>
        </div>

        {/* Step indicator row */}
        <div className="flex items-center gap-0 px-4 border-b border-white/5 bg-white/[0.01] overflow-x-auto scrollbar-none">
          {steps.map((s, i) => {
            const SIcon = s.icon
            const isActive = i === activeStep
            return (
              <button
                key={s.id}
                onClick={() => goToStep(i)}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-[10px] font-medium border-b-2 flex-shrink-0 transition-colors duration-200 ${
                  isActive ? 'border-primary text-primary' : 'border-transparent text-zinc-600 hover:text-zinc-400'
                }`}
              >
                <SIcon className="w-3 h-3" />
                <span className="hidden md:inline">{s.label}</span>
              </button>
            )
          })}
        </div>

        {/* Step content */}
        <div className="p-4 min-h-[200px]">
          {/* Step header */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className={`w-7 h-7 rounded-xl ${step.bg} border ${step.border} flex items-center justify-center flex-shrink-0`}>
              <Icon className={`w-3.5 h-3.5 ${step.color}`} />
            </div>
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${step.color}`}>
                Step {activeStep + 1} of {steps.length}
              </p>
              <p className="text-[13px] font-semibold text-white leading-tight">{step.label}</p>
            </div>
          </div>

          {/* Animated content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{    opacity: 0, y: -8 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              {stepContent[activeStep]}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Progress bar */}
        <div className="px-4 pb-3">
          <div className="h-[2px] bg-white/6 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-secondary rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
          {/* Dot navigation */}
          <div className="flex items-center justify-center gap-1.5 mt-3">
            {steps.map((_, i) => (
              <button
                key={i}
                onClick={() => goToStep(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === activeStep
                    ? 'w-5 h-1.5 bg-primary'
                    : 'w-1.5 h-1.5 bg-white/15 hover:bg-white/30'
                }`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Bottom blurb */}
      <p className="text-center text-[11px] text-zinc-600 mt-5 leading-relaxed">
        From raw CSV to business insight — no code required.
      </p>
    </div>
  )
}
