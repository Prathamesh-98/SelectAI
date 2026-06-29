import { motion } from 'framer-motion'
import { ArrowRight, ChevronDown, Upload, MessageSquare, Code2, Table2, BarChart2, Lightbulb, FileText, CheckCircle2 } from 'lucide-react'

const tableRows = [
  { month: 'Jan 2025', category: 'Electronics', units: 1_240, sales: 62_000 },
  { month: 'Jan 2025', category: 'Apparel',     units: 3_180, sales: 47_700 },
  { month: 'Feb 2025', category: 'Electronics', units: 1_090, sales: 54_500 },
  { month: 'Feb 2025', category: 'Apparel',     units: 2_950, sales: 44_250 },
  { month: 'Mar 2025', category: 'Electronics', units: 1_580, sales: 79_000 },
]

const barData = [
  { label: 'Jan', electronics: 62, apparel: 47 },
  { label: 'Feb', electronics: 54, apparel: 44 },
  { label: 'Mar', electronics: 79, apparel: 51 },
  { label: 'Apr', electronics: 68, apparel: 55 },
  { label: 'May', electronics: 91, apparel: 60 },
  { label: 'Jun', electronics: 83, apparel: 58 },
]

function scrollToPreview() {
  document.getElementById('product-preview')?.scrollIntoView({ behavior: 'smooth' })
}

export default function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-20 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/7 rounded-full blur-[120px]" />
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-secondary/6 rounded-full blur-[80px]" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-accent/5 rounded-full blur-[80px]" />
      </div>
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.022]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto w-full">
        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut', delay: 0 }}
          className="text-center text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6"
        >
          <span className="gradient-text">Ask Your Data.</span>
          <br />
          <span className="text-white">Get Instant Insights.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut', delay: 0.1 }}
          className="text-center max-w-2xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 text-balance"
        >
          Upload a CSV, ask a question in plain English — SelectAI generates the SQL,
          runs the query, visualizes the results, and explains what it means.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: 'easeOut', delay: 0.2 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
        >
          <a
            id="hero-start-free"
            href="#get-started"
            className="group flex items-center gap-2 px-7 py-3.5 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold text-base transition-all duration-300 shadow-glow-blue hover:shadow-lg hover:-translate-y-0.5"
          >
            Start Free
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </a>
          <button
            id="hero-explore-demo"
            onClick={scrollToPreview}
            className="group flex items-center gap-2 px-7 py-3.5 rounded-xl glass border border-white/10 hover:border-white/20 text-white font-semibold text-base transition-all duration-300 hover:-translate-y-0.5"
          >
            Explore Demo
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform duration-200" />
          </button>
        </motion.div>

        {/* ── Authentic Product Preview ── */}
        <motion.div
          id="product-preview"
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Outer glow */}
          <div className="absolute -inset-6 bg-gradient-to-b from-primary/8 via-secondary/4 to-transparent rounded-3xl blur-2xl pointer-events-none" />

          {/* App chrome */}
          <div className="relative glass border border-white/8 rounded-2xl overflow-hidden shadow-2xl">
            {/* Browser bar */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-white/5 bg-surface/60">
              <div className="flex gap-1.5 flex-shrink-0">
                <div className="w-3 h-3 rounded-full bg-[#FF5F57]/70" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E]/70" />
                <div className="w-3 h-3 rounded-full bg-[#28C840]/70" />
              </div>
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-1.5 bg-white/5 rounded-md px-3 py-1 text-xs text-muted-foreground max-w-xs w-full">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />
                  app.selectai.io/workspace
                </div>
              </div>
            </div>

            {/* Two-column layout: sidebar + main */}
            <div className="flex min-h-[560px]">

              {/* ── Sidebar ── */}
              <div className="w-44 flex-shrink-0 border-r border-white/5 bg-surface/40 p-3 flex flex-col gap-0.5">
                <div className="flex items-center gap-2 px-2 py-2 mb-3">
                  <div className="w-5 h-5 rounded bg-gradient-to-br from-primary to-secondary flex-shrink-0" />
                  <span className="text-xs font-semibold text-white">SelectAI</span>
                </div>
                {[
                  { label: 'Workspace', active: false },
                  { label: 'Datasets', active: false },
                  { label: 'Query Editor', active: true },
                  { label: 'Charts', active: false },
                  { label: 'Reports', active: false },
                  { label: 'Settings', active: false },
                ].map(({ label, active }) => (
                  <div
                    key={label}
                    className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-default ${
                      active
                        ? 'bg-primary/15 text-primary'
                        : 'text-muted hover:text-muted-foreground'
                    }`}
                  >
                    <div className={`w-1 h-1 rounded-full flex-shrink-0 ${active ? 'bg-primary' : 'bg-white/10'}`} />
                    {label}
                  </div>
                ))}

                {/* Dataset chip */}
                <div className="mt-auto pt-3 border-t border-white/5">
                  <p className="text-[9px] text-muted uppercase tracking-wider px-2 mb-2">Active Dataset</p>
                  <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-accent/8 border border-accent/15">
                    <FileText className="w-3 h-3 text-accent flex-shrink-0" />
                    <div>
                      <p className="text-[10px] font-semibold text-white leading-tight">sales_2025.csv</p>
                      <p className="text-[9px] text-muted leading-tight">4,820 rows · 7 cols</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Main content ── */}
              <div className="flex-1 flex flex-col overflow-hidden">

                {/* Step tabs */}
                <div className="flex items-center gap-0 border-b border-white/5 bg-surface/20 px-4">
                  {[
                    { icon: Upload,        label: 'Upload',  step: 1 },
                    { icon: MessageSquare, label: 'Ask',     step: 2 },
                    { icon: Code2,         label: 'SQL',     step: 3 },
                    { icon: Table2,        label: 'Results', step: 4 },
                    { icon: BarChart2,     label: 'Chart',   step: 5 },
                    { icon: Lightbulb,     label: 'Insight', step: 6 },
                  ].map(({ icon: Icon, label, step }) => (
                    <div
                      key={step}
                      className={`flex items-center gap-1.5 px-3 py-3 text-[10px] font-medium border-b-2 transition-colors ${
                        step <= 6
                          ? 'border-primary text-primary'
                          : 'border-transparent text-muted'
                      }`}
                    >
                      <Icon className="w-3 h-3" />
                      <span className="hidden sm:inline">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Scrollable content */}
                <div className="flex-1 overflow-auto p-4 space-y-4">

                  {/* ── Step 1: Upload ── */}
                  <div className="rounded-xl border border-white/6 bg-surface/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md bg-accent/20 flex items-center justify-center flex-shrink-0">
                        <Upload className="w-3 h-3 text-accent" />
                      </div>
                      <span className="text-[11px] font-semibold text-white">Dataset Uploaded</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-400 ml-auto" />
                    </div>
                    <div className="flex items-center gap-3 bg-white/4 rounded-lg px-3 py-2.5 border border-white/5">
                      <div className="w-8 h-8 rounded-md bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
                        <FileText className="w-4 h-4 text-accent" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white">sales_2025.csv</p>
                        <p className="text-[10px] text-muted-foreground">4,820 rows · 7 columns · 312 KB</p>
                      </div>
                      <div className="ml-auto flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        <span className="text-[10px] text-green-400 font-medium">Ready</span>
                      </div>
                    </div>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {['month', 'category', 'product', 'units_sold', 'unit_price', 'total_sales', 'region'].map(col => (
                        <span key={col} className="px-2 py-0.5 rounded-md bg-white/5 border border-white/8 text-[9px] font-mono text-muted-foreground">
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* ── Step 2: Natural Language Query ── */}
                  <div className="rounded-xl border border-white/6 bg-surface/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md bg-primary/20 flex items-center justify-center flex-shrink-0">
                        <MessageSquare className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-[11px] font-semibold text-white">Natural Language Query</span>
                    </div>
                    <div className="flex items-center gap-2 bg-white/4 border border-primary/20 rounded-lg px-3.5 py-2.5">
                      <p className="text-sm text-white flex-1 font-medium">
                        "Show monthly sales by category."
                      </p>
                      <div className="flex-shrink-0 w-6 h-6 rounded-md bg-primary flex items-center justify-center">
                        <ArrowRight className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>

                  {/* ── Step 3: Generated SQL ── */}
                  <div className="rounded-xl border border-white/6 bg-surface/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md bg-secondary/20 flex items-center justify-center flex-shrink-0">
                        <Code2 className="w-3 h-3 text-secondary" />
                      </div>
                      <span className="text-[11px] font-semibold text-white">Generated SQL</span>
                      <span className="ml-auto text-[9px] font-medium text-secondary bg-secondary/10 border border-secondary/15 px-2 py-0.5 rounded-full">AI Generated</span>
                    </div>
                    <div className="bg-[#0D0D12] border border-white/6 rounded-lg p-3 font-mono text-[11px] leading-relaxed">
                      <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/5">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                          <div className="w-1.5 h-1.5 rounded-full bg-white/10" />
                        </div>
                        <span className="text-[9px] text-muted">SQL Query</span>
                      </div>
                      <pre className="whitespace-pre-wrap text-[11px]">
<span className="text-secondary">SELECT</span>
{'  '}<span className="text-accent">month</span>,
{'  '}<span className="text-accent">category</span>,
{'  '}<span className="text-primary">SUM</span>(<span className="text-accent">total_sales</span>) <span className="text-secondary">AS</span> <span className="text-white">total_sales</span>,
{'  '}<span className="text-primary">SUM</span>(<span className="text-accent">units_sold</span>) <span className="text-secondary">AS</span> <span className="text-white">units_sold</span>
<span className="text-secondary">FROM</span>   <span className="text-white">sales_2025</span>
<span className="text-secondary">GROUP BY</span> <span className="text-accent">month</span>, <span className="text-accent">category</span>
<span className="text-secondary">ORDER BY</span> <span className="text-accent">month</span> <span className="text-secondary">ASC</span>, <span className="text-white">total_sales</span> <span className="text-secondary">DESC</span><span className="text-muted">;</span>
                      </pre>
                    </div>
                  </div>

                  {/* ── Step 4: Query Results Table ── */}
                  <div className="rounded-xl border border-white/6 bg-surface/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md bg-green-500/20 flex items-center justify-center flex-shrink-0">
                        <Table2 className="w-3 h-3 text-green-400" />
                      </div>
                      <span className="text-[11px] font-semibold text-white">Query Results</span>
                      <span className="ml-auto text-[9px] text-muted-foreground">5 rows · 0.28s</span>
                    </div>
                    <div className="overflow-hidden rounded-lg border border-white/6">
                      <table className="w-full text-[10px]">
                        <thead>
                          <tr className="border-b border-white/6 bg-white/4">
                            <th className="text-left px-3 py-2 text-muted-foreground font-semibold uppercase tracking-wider">Month</th>
                            <th className="text-left px-3 py-2 text-muted-foreground font-semibold uppercase tracking-wider">Category</th>
                            <th className="text-right px-3 py-2 text-muted-foreground font-semibold uppercase tracking-wider">Units Sold</th>
                            <th className="text-right px-3 py-2 text-muted-foreground font-semibold uppercase tracking-wider">Total Sales</th>
                          </tr>
                        </thead>
                        <tbody>
                          {tableRows.map((row, i) => (
                            <tr
                              key={i}
                              className={`border-b border-white/4 last:border-0 transition-colors ${
                                i === 0 ? 'bg-primary/5' : 'hover:bg-white/2'
                              }`}
                            >
                              <td className="px-3 py-2 text-muted-foreground font-mono">{row.month}</td>
                              <td className="px-3 py-2">
                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-medium ${
                                  row.category === 'Electronics'
                                    ? 'bg-primary/15 text-primary'
                                    : 'bg-secondary/15 text-secondary'
                                }`}>
                                  {row.category}
                                </span>
                              </td>
                              <td className="px-3 py-2 text-right text-white font-mono">{row.units.toLocaleString()}</td>
                              <td className="px-3 py-2 text-right text-white font-mono font-semibold">
                                ${row.sales.toLocaleString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* ── Step 5: Bar Chart ── */}
                  <div className="rounded-xl border border-white/6 bg-surface/50 p-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-5 h-5 rounded-md bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                        <BarChart2 className="w-3 h-3 text-amber-400" />
                      </div>
                      <span className="text-[11px] font-semibold text-white">Monthly Sales by Category</span>
                      <div className="ml-auto flex items-center gap-3 text-[9px] text-muted-foreground">
                        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-primary" />Electronics</span>
                        <span className="flex items-center gap-1"><span className="inline-block w-2 h-2 rounded-sm bg-secondary" />Apparel</span>
                      </div>
                    </div>
                    {/* Bar chart */}
                    <div className="flex items-end gap-3 h-28 px-1">
                      {barData.map((d) => (
                        <div key={d.label} className="flex-1 flex flex-col items-center gap-1">
                          <div className="w-full flex items-end gap-0.5 h-24">
                            {/* Electronics bar */}
                            <div
                              className="flex-1 rounded-t-sm transition-all"
                              style={{
                                height: `${(d.electronics / 100) * 100}%`,
                                background: 'linear-gradient(to top, #2563EB, #3B82F6)',
                                opacity: 0.85,
                              }}
                            />
                            {/* Apparel bar */}
                            <div
                              className="flex-1 rounded-t-sm transition-all"
                              style={{
                                height: `${(d.apparel / 100) * 100}%`,
                                background: 'linear-gradient(to top, #7C3AED, #8B5CF6)',
                                opacity: 0.75,
                              }}
                            />
                          </div>
                          <span className="text-[9px] text-muted">{d.label}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[9px] text-muted border-t border-white/5 pt-2">
                      <span>Jan 2025 — Jun 2025</span>
                      <span>Values in USD (thousands)</span>
                    </div>
                  </div>

                  {/* ── Step 6: AI Business Summary ── */}
                  <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/8 to-secondary/6 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-5 h-5 rounded-md bg-primary/25 flex items-center justify-center flex-shrink-0">
                        <Lightbulb className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-[11px] font-semibold text-white">AI Business Summary</span>
                      <div className="ml-auto w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      <span className="text-white font-medium">Electronics</span> leads total sales across all months, peaking in{' '}
                      <span className="text-white font-medium">May 2025</span> at <span className="text-primary font-semibold">$91K</span>.{' '}
                      <span className="text-white font-medium">Apparel</span> shows consistent month-over-month growth of approximately{' '}
                      <span className="text-green-400 font-semibold">+5.3%</span>. The gap between categories has narrowed by{' '}
                      <span className="text-accent font-medium">18%</span> since January, suggesting Apparel demand is accelerating.
                      Consider increasing Apparel inventory ahead of Q3 to avoid stock-out risk.
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
