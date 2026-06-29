import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react'
import { AuthLayout } from './AuthLayout'

const item = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.38, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] as const } }),
}

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: 'At least 8 characters', pass: password.length >= 8 },
    { label: 'One uppercase letter',  pass: /[A-Z]/.test(password) },
    { label: 'One number',            pass: /[0-9]/.test(password) },
    { label: 'One special character', pass: /[^A-Za-z0-9]/.test(password) },
  ]
  if (!password) return null
  return (
    <ul className="mt-2 space-y-1">
      {checks.map(c => (
        <li key={c.label} className={`flex items-center gap-1.5 text-[11px] transition-colors duration-200 ${c.pass ? 'text-green-400' : 'text-zinc-600'}`}>
          <CheckCircle2 className={`w-3 h-3 flex-shrink-0 ${c.pass ? 'text-green-400' : 'text-white/10'}`} />
          {c.label}
        </li>
      ))}
    </ul>
  )
}

export function ResetPasswordPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [showCf,   setShowCf]   = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [done,     setDone]     = useState(false)

  const pwMismatch = confirm.length > 0 && password !== confirm
  const valid      = password.length >= 8 && !pwMismatch && confirm.length > 0

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid) return
    setLoading(true)
    setTimeout(() => { setLoading(false); setDone(true) }, 1600)
  }

  const eyeBtn = (show: boolean, toggle: () => void) => (
    <button type="button" tabIndex={-1} onClick={toggle} className="text-zinc-600 hover:text-zinc-300 transition-colors" aria-label={show ? 'Hide' : 'Show'}>
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  )

  return (
    <AuthLayout title="Set new password" subtitle="Choose a strong password to secure your SelectAI account.">
      <AnimatePresence mode="wait">
        {done ? (
          /* ── Success ── */
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="text-center space-y-5"
          >
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 240, damping: 20, delay: 0.1 }}
                className="w-16 h-16 rounded-2xl bg-primary/15 border border-primary/25 flex items-center justify-center"
              >
                <ShieldCheck className="w-8 h-8 text-primary" />
              </motion.div>
            </div>
            <div>
              <h3 className="text-[17px] font-bold text-white mb-1.5">Password updated!</h3>
              <p className="text-[13px] text-zinc-500 leading-relaxed">
                Your password has been reset successfully. You can now sign in with your new credentials.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('login')}
              className="w-full h-11 rounded-xl font-semibold text-[14px] text-white bg-primary hover:bg-[#2563EB] flex items-center justify-center gap-2 shadow-[0_0_28px_rgba(59,130,246,0.25)] hover:shadow-[0_0_36px_rgba(59,130,246,0.4)] transition-all duration-200"
            >
              Sign in to your account <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          /* ── Form ── */
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            noValidate
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* New Password */}
            <motion.div custom={0} variants={item} initial="hidden" animate="visible">
              <label htmlFor="reset-pw" className="block text-[13px] font-medium text-zinc-300 mb-1.5">
                New password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                <input
                  id="reset-pw"
                  type={showPw ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  required
                  className="w-full h-10 pl-10 pr-10 rounded-xl bg-zinc-900/60 border border-white/8 text-zinc-100 text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 hover:border-white/14 transition-all duration-200"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {eyeBtn(showPw, () => setShowPw(v => !v))}
                </span>
              </div>
              <PasswordStrength password={password} />
            </motion.div>

            {/* Confirm Password */}
            <motion.div custom={1} variants={item} initial="hidden" animate="visible">
              <label htmlFor="reset-cf" className="block text-[13px] font-medium text-zinc-300 mb-1.5">
                Confirm new password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
                <input
                  id="reset-cf"
                  type={showCf ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className={`w-full h-10 pl-10 pr-10 rounded-xl bg-zinc-900/60 border text-zinc-100 text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 hover:border-white/14 transition-all duration-200 ${
                    pwMismatch ? 'border-red-500/40' : 'border-white/8'
                  }`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {eyeBtn(showCf, () => setShowCf(v => !v))}
                </span>
              </div>
              {pwMismatch && <p className="mt-1 text-[11px] text-red-400">Passwords do not match</p>}
              {!pwMismatch && confirm && password === confirm && (
                <p className="mt-1 text-[11px] text-green-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Passwords match
                </p>
              )}
            </motion.div>

            {/* Submit */}
            <motion.div custom={2} variants={item} initial="hidden" animate="visible">
              <motion.button
                type="submit"
                whileHover={!valid || loading ? {} : { y: -1 }}
                whileTap={!valid  || loading ? {} : { scale: 0.98 }}
                disabled={!valid || loading}
                className={`w-full h-11 rounded-xl font-semibold text-[14px] text-white flex items-center justify-center gap-2 transition-all duration-200 ${
                  !valid || loading
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
                  <>Reset password <ArrowRight className="w-4 h-4" /></>
                )}
              </motion.button>
            </motion.div>

            {/* Back */}
            <motion.div custom={3} variants={item} initial="hidden" animate="visible" className="flex justify-center">
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-[13px] text-zinc-600 hover:text-zinc-300 transition-colors"
              >
                ← Back to sign in
              </button>
            </motion.div>
          </motion.form>
        )}
      </AnimatePresence>
    </AuthLayout>
  )
}
