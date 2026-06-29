import { motion } from 'framer-motion'
import { Upload, Brain, Code2, Play, BarChart2, Lightbulb } from 'lucide-react'

const steps = [
  {
    id: 1,
    icon: Upload,
    title: 'Upload Your CSV',
    description: 'Drag and drop or click to upload any CSV file up to 500MB. SelectAI automatically detects column types, relationships, and data quality issues.',
    detail: 'Supports CSV, TSV, Excel exports',
    color: 'text-primary',
    bg: 'bg-primary/15',
    border: 'border-primary/25',
    glow: 'shadow-[0_0_20px_rgba(59,130,246,0.2)]',
  },
  {
    id: 2,
    icon: Brain,
    title: 'AI Understands Your Dataset',
    description: 'Our AI reads column names, infers business context, identifies key metrics, and maps relationships between data columns automatically.',
    detail: 'Schema inference in < 2 seconds',
    color: 'text-secondary',
    bg: 'bg-secondary/15',
    border: 'border-secondary/25',
    glow: 'shadow-[0_0_20px_rgba(139,92,246,0.2)]',
  },
  {
    id: 3,
    icon: Code2,
    title: 'Generate SQL',
    description: 'Type your question in plain English. The AI translates it into production-quality SQL with proper JOINs, aggregations, and filters.',
    detail: 'Readable SQL, always shown',
    color: 'text-accent',
    bg: 'bg-accent/15',
    border: 'border-accent/25',
    glow: 'shadow-[0_0_20px_rgba(6,182,212,0.2)]',
  },
  {
    id: 4,
    icon: Play,
    title: 'Execute Query',
    description: 'Queries run in isolated sandboxes with read-only access. Results return in milliseconds even on datasets with millions of rows.',
    detail: 'Sandboxed, read-only execution',
    color: 'text-green-400',
    bg: 'bg-green-500/15',
    border: 'border-green-500/25',
    glow: 'shadow-[0_0_20px_rgba(34,197,94,0.2)]',
  },
  {
    id: 5,
    icon: BarChart2,
    title: 'Visualize Results',
    description: 'Data transforms into beautiful, interactive charts. SelectAI picks the best visualization type for your query results automatically.',
    detail: 'Bar, line, pie, scatter, and more',
    color: 'text-amber-400',
    bg: 'bg-amber-500/15',
    border: 'border-amber-500/25',
    glow: 'shadow-[0_0_20px_rgba(245,158,11,0.2)]',
  },
  {
    id: 6,
    icon: Lightbulb,
    title: 'Generate AI Explanation',
    description: 'Receive a plain-English business summary explaining what the data means, what trends to watch, and what actions to consider.',
    detail: 'Executive-ready summaries',
    color: 'text-rose-400',
    bg: 'bg-rose-500/15',
    border: 'border-rose-500/25',
    glow: 'shadow-[0_0_20px_rgba(244,63,94,0.2)]',
  },
]

export default function Workflow() {
  return (
    <section id="how-it-works" className="py-24 px-4 bg-gradient-to-b from-transparent via-surface/20 to-transparent">
      <div className="max-w-4xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">
            How It Works
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5">
            From CSV to insights
            <br />
            <span className="gradient-text-cyan">in 6 simple steps</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            No coding, no complex setup, no data engineering required. Just upload and ask.
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting line */}
          <div className="absolute left-10 top-12 bottom-12 w-px bg-gradient-to-b from-primary via-secondary to-rose-500 opacity-30 hidden sm:block" />

          <div className="space-y-6">
            {steps.map((step, i) => {
              const Icon = step.icon
              return (
                <motion.div
                  key={step.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="flex gap-6 group"
                >
                  {/* Step indicator */}
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      className={`w-20 h-20 rounded-2xl ${step.bg} border ${step.border} flex items-center justify-center group-hover:${step.glow} transition-shadow duration-300`}
                    >
                      <Icon className={`w-8 h-8 ${step.color}`} />
                    </motion.div>
                  </div>

                  {/* Content */}
                  <div className={`flex-1 bg-surface border border-white/5 hover:border-white/10 rounded-2xl p-5 transition-all duration-300 group-hover:${step.glow}`}>
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className={`text-xs font-bold ${step.color} uppercase tracking-wider`}>
                          Step {step.id}
                        </span>
                        <h3 className="text-lg font-semibold text-white mt-0.5">{step.title}</h3>
                      </div>
                      <span className="text-xs text-muted-foreground bg-white/5 px-2.5 py-1 rounded-full border border-white/8 flex-shrink-0 ml-4">
                        {step.detail}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
