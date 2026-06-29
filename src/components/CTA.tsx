import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'

export default function CTA() {
  return (
    <section className="py-24 px-4" id="get-started">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/15 to-accent/10" />
          <div className="absolute inset-0 bg-surface/60" />

          {/* Grid overlay */}
          <div
            className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />

          {/* Glow orbs */}
          <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />
          <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-64 h-64 bg-secondary/20 rounded-full blur-[80px]" />

          {/* Border */}
          <div className="absolute inset-0 rounded-3xl border border-white/10" />

          {/* Content */}
          <div className="relative z-10 text-center px-8 py-20">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1, duration: 0.5 }}
              className="flex items-center justify-center gap-2 mb-6"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-semibold text-primary">Start for free, upgrade anytime</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15, duration: 0.6 }}
              className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight"
            >
              Ready to analyze
              <br />
              <span className="gradient-text-blue">your data?</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="text-lg text-muted-foreground mb-10 max-w-lg mx-auto"
            >
              Upload your first dataset in seconds. No credit card required.
              Get from raw CSV to a clear answer in under a minute.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <button
                id="cta-get-started"
                type="button"
                onClick={() => { window.location.href = '/?auth=register' }}
                className="group flex items-center gap-2 px-8 py-4 rounded-xl bg-primary hover:bg-primary-600 text-white font-semibold text-base transition-all duration-300 shadow-glow-blue hover:shadow-lg hover:-translate-y-0.5"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                id="cta-schedule-demo"
                type="button"
                onClick={() => {
                  document.getElementById('product-showcase')?.scrollIntoView({ behavior: 'smooth' })
                }}
                className="flex items-center gap-2 px-8 py-4 rounded-xl glass border border-white/12 hover:border-white/25 text-white font-semibold text-base transition-all duration-300 hover:-translate-y-0.5"
              >
                Explore the Demo
              </button>
            </motion.div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="flex flex-wrap items-center justify-center gap-6 mt-10 text-xs text-muted-foreground"
            >
              {['✓ Free 14-day trial', '✓ No credit card required', '✓ SOC 2 Type II', '✓ GDPR compliant', '✓ Cancel anytime'].map((item) => (
                <span key={item} className="font-medium">{item}</span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
