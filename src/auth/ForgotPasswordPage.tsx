import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Mail, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { AuthLayout } from './AuthLayout'

const item = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.38, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const } }),
}

export function ForgotPasswordPage() {
  const [email,    setEmail]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [sent,     setSent]     = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setTimeout(() => { setLoading(false); setSent(true) }, 1600)
  }

  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter the email associated with your account and we'll send a reset link."
    >
      <AnimatePresence mode="wait">
        {sent ? (
          /* ── Success state ── */
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="text-center space-y-5"
          >
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 240, damping: 20, delay: 0.1 }}
                className="w-16 h-16 rounded-2xl bg-green-500/15 border border-green-500/25 flex items-center justify-center"
              >
                <CheckCircle2 className="w-8 h-8 text-green-400" />
              </motion.div>
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-white mb-1.5">Check your inbox</h3>
              <p className="text-[13px] text-zinc-500 leading-relaxed">
                We've sent a password reset link to{' '}
                <span className="text-white font-medium">{email}</span>.
                It expires in 15 minutes.
              </p>
            </div>
            <Link
              to="/login"
              className="w-full h-11 rounded-xl font-semibold text-[14px] text-white bg-primary hover:bg-[#2563EB] flex items-center justify-center gap-2 shadow-[0_0_28px_rgba(59,130,246,0.25)] hover:shadow-[0_0_36px_rgba(59,130,246,0.4)] transition-all duration-200"
            >
              Back to sign in <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-[12px] text-zinc-600">
              Didn't receive it?{' '}
              <button type="button" onClick={() => { setSent(false) }} className="text-primary hover:text-primary/80 font-semibold transition-colors">
                Resend email
              </button>
            </p>
          </motion.div>
        ) : (
          /* ── Form state ── */
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            noValidate
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Email */}
            <motion.div custom={0} variants={item} initial="hidden" animate="visible">
              <label htmlFor="forgot-email" className="block text-[13px] font-medium text-zinc-300 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                <input
                  id="forgot-email"
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  required
                  className="w-full h-10 pl-10 pr-4 rounded-xl bg-zinc-900/60 border border-white/8 text-zinc-100 text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 hover:border-white/14 transition-all duration-200"
                />
              </div>
            </motion.div>

            {/* Submit */}
            <motion.div custom={1} variants={item} initial="hidden" animate="visible">
              <motion.button
                type="submit"
                whileHover={loading ? {} : { y: -1 }}
                whileTap={loading  ? {} : { scale: 0.98 }}
                disabled={loading || !email}
                className={`w-full h-11 rounded-xl font-semibold text-[14px] text-white flex items-center justify-center gap-2 transition-all duration-200 ${
                  loading || !email
                    ? 'bg-primary/40 cursor-not-allowed'
                    : 'bg-primary hover:bg-[#2563EB] shadow-[0_0_28px_rgba(59,130,246,0.25)] hover:shadow-[0_0_36px_rgba(59,130,246,0.4)]'
                }`}
              >
                {loading ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                ) : (
                  <>Send reset link <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>
            </motion.div>

            {/* Back */}
            <motion.div custom={2} variants={item} initial="hidden" animate="visible" className="flex justify-center">
              <Link
                to="/login"
                className="flex items-center gap-1.5 text-[13px] text-zinc-500 hover:text-zinc-200 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to sign in
              </Link>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  )
}
