import { motion } from 'framer-motion'
import { Star, Quote } from 'lucide-react'

const testimonials = [
  {
    id: 'testimonial-sarah',
    name: 'Sarah Chen',
    role: 'Head of Data Analytics',
    company: 'Meridian Financial',
    avatar: 'SC',
    avatarGradient: 'from-primary to-secondary',
    stars: 5,
    quote:
      "SelectAI cut our reporting time from 3 days to 20 minutes. Our executives can now ask data questions directly without waiting for the data team. It's been transformative for how we make decisions.",
    metric: '9× faster reporting',
    metricColor: 'text-primary',
  },
  {
    id: 'testimonial-marcus',
    name: 'Marcus Rodriguez',
    role: 'VP of Growth',
    company: 'Nexus Commerce',
    avatar: 'MR',
    avatarGradient: 'from-secondary to-accent',
    stars: 5,
    quote:
      "I'm not a SQL person at all, but SelectAI lets me analyze our sales funnel daily. The AI insights are surprisingly accurate and catch patterns I would have completely missed. Honestly a game-changer.",
    metric: '$2.1M revenue unlocked',
    metricColor: 'text-secondary',
  },
  {
    id: 'testimonial-priya',
    name: 'Priya Nair',
    role: 'Lead Data Scientist',
    company: 'Quantum Analytics',
    avatar: 'PN',
    avatarGradient: 'from-accent to-primary',
    stars: 5,
    quote:
      "What impresses me most is the SQL quality — it generates complex CTEs and window functions correctly on the first try. We use it for prototyping new metrics before building production pipelines. Exceptional tool.",
    metric: '40% faster exploration',
    metricColor: 'text-accent',
  },
]

export default function Testimonials() {
  return (
    <section className="py-24 px-4">
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
            Customer Stories
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5">
            Loved by data teams
            <br />
            <span className="gradient-text">around the world</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Join thousands of analysts, data scientists, and business leaders who use SelectAI every day.
          </p>

          {/* Rating summary */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-white font-semibold">4.9/5</span>
            <span className="text-muted-foreground text-sm">from 2,400+ reviews</span>
          </div>
        </motion.div>

        {/* Testimonial cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.id}
              id={t.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative bg-surface border border-white/5 hover:border-white/12 rounded-2xl p-6 transition-all duration-300 hover:shadow-card-hover flex flex-col"
            >
              {/* Quote icon */}
              <div className="absolute top-5 right-5 opacity-10 group-hover:opacity-20 transition-opacity">
                <Quote className="w-10 h-10 text-white" />
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 mb-5">
                {Array.from({ length: t.stars }).map((_, idx) => (
                  <Star key={idx} className="w-4 h-4 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote */}
              <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
                "{t.quote}"
              </p>

              {/* Metric highlight */}
              <div className="mb-5 px-3 py-2 rounded-lg bg-white/3 border border-white/5">
                <span className={`text-sm font-bold ${t.metricColor}`}>{t.metric}</span>
              </div>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5 border-t border-white/5">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.avatarGradient} flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xs font-bold text-white">{t.avatar}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role} · {t.company}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
