import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    id: 'faq-1',
    question: 'What file formats does SelectAI support?',
    answer:
      'SelectAI currently supports CSV files up to 500MB in size. We also support TSV files and Excel exports saved as CSV. Full Excel (.xlsx), Parquet, and JSON support is coming in Q1 2025. You can upload multiple files and join them using natural language queries.',
  },
  {
    id: 'faq-2',
    question: 'How accurate is the AI-generated SQL?',
    answer:
      'The AI always shows you the exact SQL it generated before executing — you can review, edit, or reject it. For standard aggregation and filter queries the output is typically precise. For complex queries involving multiple JOINs or window functions, you can refine the result by clarifying your question. We also offer an "Explain This Query" feature that breaks down exactly what each clause does.',
  },
  {
    id: 'faq-3',
    question: 'Is my data secure? Who can see my uploaded files?',
    answer:
      'Your data is encrypted at rest (AES-256) and in transit (TLS 1.3). Files are stored in isolated, SOC 2 Type II compliant infrastructure. No SelectAI employees have access to your data — it is fully sandboxed. We are GDPR and CCPA compliant. Enterprise customers can opt for on-premise deployment or private cloud with zero data egress.',
  },
  {
    id: 'faq-4',
    question: 'Can I connect SelectAI to my existing database?',
    answer:
      'Yes! In addition to CSV uploads, SelectAI Enterprise supports direct connections to PostgreSQL, MySQL, Snowflake, BigQuery, Redshift, and Databricks. You connect via read-only credentials and SelectAI never writes to your database. Database connectivity is available on the Growth and Enterprise plans.',
  },
  {
    id: 'faq-5',
    question: 'What happens to my data if I cancel my subscription?',
    answer:
      'If you cancel your subscription, you have 30 days to export all your uploaded datasets, queries, and generated reports. After 30 days, your data is permanently deleted from our servers using NIST SP 800-88 compliant data destruction methods. We never sell your data to third parties under any circumstances.',
  },
  {
    id: 'faq-6',
    question: 'Do you offer a free trial?',
    answer:
      'Yes — SelectAI offers a free tier with a limited number of datasets and queries per month, with access to all core features. No credit card required. When you are ready for more capacity, team collaboration, and priority support, paid plans are available. See our pricing page for details.',
  },
  {
    id: 'faq-7',
    question: 'Can non-technical users really use SelectAI?',
    answer:
      'Absolutely — that is our primary design goal. SelectAI was built for business analysts, product managers, marketers, and executives who need data insights without writing SQL. The interface is intentionally minimal: upload a file, type a question, get an answer. No technical background required.',
  },
]

function FAQItem({ faq, isOpen, onToggle }: { faq: typeof faqs[0]; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border border-white/5 rounded-xl overflow-hidden hover:border-white/10 transition-colors duration-200">
      <button
        id={faq.id}
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left group"
        aria-expanded={isOpen}
      >
        <span className={`text-base font-medium transition-colors duration-200 ${isOpen ? 'text-white' : 'text-muted-foreground group-hover:text-white'}`}>
          {faq.question}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25 }}
          className="flex-shrink-0"
        >
          <ChevronDown className={`w-5 h-5 transition-colors duration-200 ${isOpen ? 'text-primary' : 'text-muted'}`} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 border-t border-white/5">
              <p className="text-sm text-muted-foreground leading-relaxed pt-4">{faq.answer}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FAQ() {
  const [openId, setOpenId] = useState<string | null>('faq-1')

  return (
    <section className="py-24 px-4 bg-gradient-to-b from-transparent via-surface/15 to-transparent">
      <div className="max-w-3xl mx-auto">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-white/10 text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-6">
            FAQ
          </div>
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5">
            Frequently asked
            <br />
            <span className="gradient-text">questions</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about SelectAI. Can't find an answer?{' '}
            <a href="#contact" className="text-primary hover:underline">
              Contact our team.
            </a>
          </p>
        </motion.div>

        {/* FAQ accordion */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          {faqs.map((faq) => (
            <FAQItem
              key={faq.id}
              faq={faq}
              isOpen={openId === faq.id}
              onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
            />
          ))}
        </motion.div>
      </div>
    </section>
  )
}
