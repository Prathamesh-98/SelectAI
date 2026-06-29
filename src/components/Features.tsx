import { motion } from 'framer-motion'
import {
  MessageSquare,
  Upload,
  BarChart2,
  Lightbulb,
  Shield,
  Zap,
} from 'lucide-react'

const features = [
  {
    id: 'ai-query',
    icon: MessageSquare,
    title: 'AI Query Engine',
    description:
      'Ask questions in plain English. Our AI translates your intent into precise, optimized SQL queries instantly — no technical knowledge required.',
    gradient: 'from-primary/20 to-primary/5',
    iconColor: 'text-primary',
    iconBg: 'bg-primary/15',
    borderHover: 'hover:border-primary/30',
    badge: 'Most Popular',
  },
  {
    id: 'data-upload',
    icon: Upload,
    title: 'Seamless Data Upload',
    description:
      'Upload CSV files up to 500MB in seconds. SelectAI automatically infers schema, detects data types, and prepares your dataset for querying.',
    gradient: 'from-secondary/20 to-secondary/5',
    iconColor: 'text-secondary',
    iconBg: 'bg-secondary/15',
    borderHover: 'hover:border-secondary/30',
    badge: null,
  },
  {
    id: 'interactive-charts',
    icon: BarChart2,
    title: 'Interactive Charts',
    description:
      'Results come to life with auto-generated bar charts, line graphs, pie charts, heatmaps, and scatter plots. One-click export to PNG or CSV.',
    gradient: 'from-accent/20 to-accent/5',
    iconColor: 'text-accent',
    iconBg: 'bg-accent/15',
    borderHover: 'hover:border-accent/30',
    badge: null,
  },
  {
    id: 'business-insights',
    icon: Lightbulb,
    title: 'Business Insights',
    description:
      'Go beyond raw data. SelectAI generates executive-level summaries explaining trends, anomalies, and actionable recommendations from your results.',
    gradient: 'from-amber-500/20 to-amber-500/5',
    iconColor: 'text-amber-400',
    iconBg: 'bg-amber-500/15',
    borderHover: 'hover:border-amber-500/30',
    badge: 'New',
  },
  {
    id: 'secure-sql',
    icon: Shield,
    title: 'Secure SQL Execution',
    description:
      'All queries run in sandboxed environments with read-only permissions. Enterprise-grade encryption, SOC 2 Type II compliant, GDPR ready.',
    gradient: 'from-green-500/20 to-green-500/5',
    iconColor: 'text-green-400',
    iconBg: 'bg-green-500/15',
    borderHover: 'hover:border-green-500/30',
    badge: null,
  },
  {
    id: 'lightning-analytics',
    icon: Zap,
    title: 'Lightning Fast Analytics',
    description:
      'Queries execute in milliseconds across datasets with millions of rows. Powered by columnar storage and vectorized execution engines.',
    gradient: 'from-purple-500/20 to-purple-500/5',
    iconColor: 'text-purple-400',
    iconBg: 'bg-purple-500/15',
    borderHover: 'hover:border-purple-500/30',
    badge: null,
  },
]

export default function Features() {
  return (
    <section id="features" className="py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">
            Platform Features
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold gradient-text mb-5">
            Everything you need to
            <br />
            analyze data at scale
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            A complete analytics platform that turns raw data into business intelligence — no data engineering team required.
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={feature.id}
                id={feature.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className={`group relative bg-surface border border-white/5 ${feature.borderHover} rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-card-hover overflow-hidden`}
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl`} />

                <div className="relative z-10">
                  {/* Badge */}
                  {feature.badge && (
                    <div className="absolute top-0 right-0">
                      <span className="px-2.5 py-1 text-[10px] font-bold rounded-bl-xl rounded-tr-xl bg-primary/20 text-primary border border-primary/20">
                        {feature.badge}
                      </span>
                    </div>
                  )}

                  {/* Icon */}
                  <div className={`w-11 h-11 rounded-xl ${feature.iconBg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>

                {/* Shimmer on hover */}
                <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none" />
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
