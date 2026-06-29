import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, Lock, ArrowRight, Eye, EyeOff } from 'lucide-react'
import { AuthLayout } from './AuthLayout'

// Shared stagger helper
const item = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.38, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] as const } }),
}

// ─── Google SVG logo ──────────────────────────────────────────────────────────
function GoogleLogo() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
      <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332Z"/>
      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58Z"/>
    </svg>
  )
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function OrDivider() {
  return (
    <div className="flex items-center gap-3 my-5">
      <div className="flex-1 h-px bg-white/8" />
      <span className="text-[11px] font-medium text-zinc-600 flex-shrink-0">or continue with</span>
      <div className="flex-1 h-px bg-white/8" />
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export function LoginPage({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [showPw,   setShowPw]   = useState(false)
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => setLoading(false), 1800) // simulate
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your SelectAI workspace."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-0">

        {/* Email */}
        <motion.div custom={0} variants={item} initial="hidden" animate="visible" className="mb-4">
          <label htmlFor="login-email" className="block text-[13px] font-medium text-zinc-300 mb-1.5">
            Email address
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
            <input
              id="login-email"
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

        {/* Password */}
        <motion.div custom={1} variants={item} initial="hidden" animate="visible" className="mb-2">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="login-password" className="text-[13px] font-medium text-zinc-300">
              Password
            </label>
            <button
              type="button"
              onClick={() => onNavigate('forgot')}
              className="text-[12px] font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
            <input
              id="login-password"
              type={showPw ? 'text' : 'password'}
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full h-10 pl-10 pr-10 rounded-xl bg-zinc-900/60 border border-white/8 text-zinc-100 text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 hover:border-white/14 transition-all duration-200"
            />
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300 transition-colors"
              aria-label={showPw ? 'Hide password' : 'Show password'}
            >
              {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </motion.div>

        {/* Remember me */}
        <motion.div custom={2} variants={item} initial="hidden" animate="visible" className="flex items-center gap-2.5 mb-5">
          <button
            type="button"
            role="checkbox"
            aria-checked={remember}
            onClick={() => setRemember(v => !v)}
            className={`w-4 h-4 rounded flex items-center justify-center border transition-all duration-150 flex-shrink-0 ${
              remember ? 'bg-primary border-primary' : 'border-white/20 bg-zinc-900/60 hover:border-white/35'
            }`}
          >
            {remember && (
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <span className="text-[13px] text-zinc-400 cursor-pointer" onClick={() => setRemember(v => !v)}>
            Keep me signed in
          </span>
        </motion.div>

        {/* Submit */}
        <motion.div custom={3} variants={item} initial="hidden" animate="visible">
          <motion.button
            type="submit"
            whileHover={loading ? {} : { y: -1 }}
            whileTap={loading  ? {} : { scale: 0.98 }}
            disabled={loading}
            className={`w-full h-11 rounded-xl font-semibold text-[14px] text-white flex items-center justify-center gap-2 transition-all duration-200 ${
              loading
                ? 'bg-primary/60 cursor-wait'
                : 'bg-primary hover:bg-[#2563EB] shadow-[0_0_28px_rgba(59,130,246,0.25)] hover:shadow-[0_0_36px_rgba(59,130,246,0.4)]'
            }`}
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <>Sign in <ArrowRight className="w-4 h-4" /></>
            )}
          </motion.button>
        </motion.div>

        {/* Divider */}
        <motion.div custom={4} variants={item} initial="hidden" animate="visible">
          <OrDivider />
        </motion.div>

        {/* Google */}
        <motion.div custom={5} variants={item} initial="hidden" animate="visible">
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-11 rounded-xl font-semibold text-[14px] text-zinc-200 flex items-center justify-center gap-2.5 bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/18 transition-all duration-200"
          >
            <GoogleLogo />
            Continue with Google
          </motion.button>
        </motion.div>

        {/* Register link */}
        <motion.p custom={6} variants={item} initial="hidden" animate="visible" className="text-center text-[13px] text-zinc-600 mt-6">
          Don't have an account?{' '}
          <button type="button" onClick={() => onNavigate('register')} className="text-primary font-semibold hover:text-primary/80 transition-colors">
            Create one free
          </button>
        </motion.p>
      </form>
    </AuthLayout>
  )
}
