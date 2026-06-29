import { motion } from 'framer-motion'

const logos = [
  { name: 'Accenture', abbr: 'AC' },
  { name: 'Salesforce', abbr: 'SF' },
  { name: 'Databricks', abbr: 'DB' },
  { name: 'Snowflake', abbr: 'SN' },
  { name: 'MongoDB', abbr: 'MG' },
  { name: 'Stripe', abbr: 'ST' },
  { name: 'HubSpot', abbr: 'HS' },
]

export default function TrustedBy() {
  return (
    <section className="py-16 px-4 border-y border-white/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="max-w-6xl mx-auto"
      >
        <p className="text-center text-sm font-medium text-muted uppercase tracking-widest mb-10">
          Trusted by data teams at world-class companies
        </p>

        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
          {logos.map((logo, i) => (
            <motion.div
              key={logo.name}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07, duration: 0.5 }}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2.5 group cursor-pointer"
            >
              <div className="w-9 h-9 rounded-lg bg-surface-2 border border-white/8 flex items-center justify-center group-hover:border-primary/30 transition-colors duration-300">
                <span className="text-[11px] font-bold text-muted-foreground group-hover:text-white transition-colors duration-200">
                  {logo.abbr}
                </span>
              </div>
              <span className="text-base font-semibold text-muted-foreground group-hover:text-white transition-colors duration-300">
                {logo.name}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-8 mt-16 pt-10 border-t border-white/5 max-w-2xl mx-auto text-center">
          {[
            { value: '50M+', label: 'Queries Processed' },
            { value: '12K+', label: 'Active Teams' },
            { value: '99.9%', label: 'Uptime SLA' },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-3xl sm:text-4xl font-bold gradient-text-blue">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  )
}
