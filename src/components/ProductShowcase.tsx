import { motion } from 'framer-motion'
import { Database, FileText, Layers, BarChart2, MessageSquare, Code2, ArrowRight } from 'lucide-react'

const capabilities = [
  {
    icon: FileText,
    title: 'Natural Language Queries',
    description: 'Type questions the way you speak. No SQL knowledge required — ask anything about your data in plain English.',
    color: 'text-primary',
    bg: 'bg-primary/10',
    border: 'border-primary/15',
  },
  {
    icon: Code2,
    title: 'Automatic SQL Generation',
    description: 'SelectAI translates your question into precise, readable SQL — then shows you exactly what it generated before running it.',
    color: 'text-secondary',
    bg: 'bg-secondary/10',
    border: 'border-secondary/15',
  },
  {
    icon: BarChart2,
    title: 'Instant Visualization',
    description: 'Results automatically render as the most appropriate chart type. Bar, line, scatter, pie — switch views with one click.',
    color: 'text-accent',
    bg: 'bg-accent/10',
    border: 'border-accent/15',
  },
  {
    icon: MessageSquare,
    title: 'AI Explanations',
    description: 'Every result comes with a plain-English summary: what the data shows, what changed, and what to do next.',
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/15',
  },
  {
    icon: Layers,
    title: 'Multi-Dataset Support',
    description: 'Upload multiple CSV files and join them through natural language. Ask cross-dataset questions without writing any JOIN logic.',
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/15',
  },
  {
    icon: Database,
    title: 'Schema-Aware Context',
    description: 'SelectAI reads your column names, types, and values to understand what your data means — not just what it contains.',
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/15',
  },
]

// Realistic query-flow pairs — no fabricated dollar figures
const queryExamples = [
  {
    query: 'Which product categories had the most returns last quarter?',
    sql: `SELECT category,\n       COUNT(*) AS returns\nFROM   orders\nWHERE  status = 'returned'\n  AND  quarter = 'Q1 2025'\nGROUP  BY category\nORDER  BY returns DESC;`,
    insight: 'Footwear accounted for the highest return volume, followed by Electronics. Both categories saw elevated return rates in January — worth investigating post-holiday buying patterns.',
  },
  {
    query: 'Show me the top 5 regions by units sold in 2025.',
    sql: `SELECT  region,\n        SUM(units_sold) AS total_units\nFROM    sales_2025\nGROUP   BY region\nORDER   BY total_units DESC\nLIMIT   5;`,
    insight: 'The West and Northeast regions lead in unit volume. Mid-Atlantic shows the fastest growth rate month-over-month, suggesting an emerging demand pocket.',
  },
]

export default function ProductShowcase() {
  const example = queryExamples[0]

  return (
    <section id="product-showcase" className="py-24 px-4 overflow-hidden">
      <div className="max-w-7xl mx-auto">

        {/* ── Section header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">
            What SelectAI Does
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5">
            From question to answer
            <br />
            <span className="gradient-text-blue">without writing a line of code</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            SelectAI handles the entire analytics pipeline — from schema inference to visualization to plain-English explanation.
          </p>
        </motion.div>

        {/* ── Capabilities grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-20">
          {capabilities.map((cap, i) => {
            const Icon = cap.icon
            return (
              <motion.div
                key={cap.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.5 }}
                whileHover={{ y: -3, transition: { duration: 0.18 } }}
                className={`group flex gap-4 p-5 rounded-2xl bg-surface border border-white/5 hover:${cap.border} transition-all duration-300`}
              >
                <div className={`flex-shrink-0 w-10 h-10 rounded-xl ${cap.bg} border ${cap.border} flex items-center justify-center group-hover:scale-105 transition-transform duration-200`}>
                  <Icon className={`w-5 h-5 ${cap.color}`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{cap.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{cap.description}</p>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* ── Live query walkthrough panel ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-4xl mx-auto"
        >
          <div className="absolute -inset-6 bg-gradient-to-b from-primary/8 to-transparent rounded-3xl blur-2xl pointer-events-none" />

          <div className="relative glass border border-white/8 rounded-2xl overflow-hidden shadow-2xl">
            {/* Panel header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/5 bg-surface/60">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]/70" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]/70" />
                <div className="w-3 h-3 rounded-full bg-[#28C840]/70" />
              </div>
              <span className="text-xs text-muted-foreground font-mono">SelectAI · Query Walkthrough</span>
              <div className="ml-auto flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                <span className="text-[10px] text-green-400">Ready</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-white/5">

              {/* Left: Input side */}
              <div className="p-5 space-y-4">
                {/* Question */}
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Question</p>
                  <div className="flex items-start gap-2.5 bg-white/4 border border-white/8 rounded-xl px-4 py-3">
                    <MessageSquare className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-white leading-relaxed">
                      "{example.query}"
                    </p>
                  </div>
                </div>

                {/* Generated SQL */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">Generated SQL</p>
                    <span className="text-[9px] text-secondary font-medium bg-secondary/10 border border-secondary/15 px-2 py-0.5 rounded-full">AI</span>
                  </div>
                  <div className="bg-[#0C0C0F] border border-white/6 rounded-xl p-4 font-mono text-[11px] leading-relaxed">
                    <pre className="whitespace-pre text-[11px]">
<span className="text-secondary">SELECT</span> <span className="text-accent">category</span>,{'\n'}
{'       '}<span className="text-primary">COUNT</span>(*) <span className="text-secondary">AS</span> <span className="text-white">returns</span>{'\n'}
<span className="text-secondary">FROM</span>   <span className="text-white">orders</span>{'\n'}
<span className="text-secondary">WHERE</span>  <span className="text-accent">status</span> = <span className="text-green-300">'returned'</span>{'\n'}
{'  AND  '}<span className="text-accent">quarter</span> = <span className="text-green-300">'Q1 2025'</span>{'\n'}
<span className="text-secondary">GROUP  BY</span> <span className="text-accent">category</span>{'\n'}
<span className="text-secondary">ORDER  BY</span> <span className="text-white">returns</span> <span className="text-secondary">DESC</span><span className="text-muted">;</span>
                    </pre>
                  </div>
                </div>

                {/* Execution badge */}
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                  <ArrowRight className="w-3 h-3" />
                  <span>Executed against <code className="text-accent font-mono">orders</code> table · read-only sandbox</span>
                </div>
              </div>

              {/* Right: Output side */}
              <div className="p-5 space-y-4">
                {/* Results table */}
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">Results</p>
                  <div className="border border-white/6 rounded-xl overflow-hidden">
                    <table className="w-full text-[10px]">
                      <thead>
                        <tr className="bg-white/4 border-b border-white/6">
                          <th className="text-left px-3 py-2 text-muted-foreground font-semibold uppercase tracking-wider">Category</th>
                          <th className="text-right px-3 py-2 text-muted-foreground font-semibold uppercase tracking-wider">Returns</th>
                        </tr>
                      </thead>
                      <tbody>
                        {[
                          { cat: 'Footwear',    val: 318 },
                          { cat: 'Electronics', val: 274 },
                          { cat: 'Apparel',     val: 209 },
                          { cat: 'Home & Garden', val: 141 },
                          { cat: 'Sports',      val: 97  },
                        ].map((row, i) => (
                          <tr key={row.cat} className={`border-b border-white/4 last:border-0 ${i === 0 ? 'bg-primary/5' : ''}`}>
                            <td className="px-3 py-2 text-white font-medium">{row.cat}</td>
                            <td className="px-3 py-2 text-right font-mono text-muted-foreground">{row.val}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* AI Explanation */}
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">AI Explanation</p>
                  <div className="bg-gradient-to-br from-primary/8 to-secondary/6 border border-primary/15 rounded-xl p-3.5">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="text-white font-medium">Footwear</span> had the highest return volume in Q1 2025, followed by{' '}
                      <span className="text-white font-medium">Electronics</span>. Both categories saw elevated return rates in January —
                      worth investigating post-holiday buying patterns.
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </motion.div>

      </div>
    </section>
  )
}
