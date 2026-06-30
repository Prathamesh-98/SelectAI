import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react'
import { AuthLayout } from './AuthLayout'
import { useAuth }    from './useAuth'

const item = {
  hidden:  { opacity: 0, y: 14 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { duration: 0.38, delay: i * 0.065, ease: [0.22, 1, 0.36, 1] as const } }),
}

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

// ─── Labelled input ───────────────────────────────────────────────────────────
interface FieldProps {
  id:          string
  label:       string
  type?:       string
  placeholder: string
  value:       string
  onChange:    (v: string) => void
  icon:        React.ReactNode
  autoComplete?: string
  rightSlot?:  React.ReactNode
  error?:      string
}
function Field({ id, label, type = 'text', placeholder, value, onChange, icon, autoComplete, rightSlot, error }: FieldProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-[13px] font-medium text-zinc-300 mb-1.5">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600 pointer-events-none">{icon}</span>
        <input
          id={id}
          type={type}
          autoComplete={autoComplete}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full h-10 pl-10 pr-${rightSlot ? '10' : '4'} rounded-xl bg-zinc-900/60 border text-zinc-100 text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 hover:border-white/14 transition-all duration-200 ${
            error ? 'border-red-500/40' : 'border-white/8'
          }`}
        />
        {rightSlot && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">{rightSlot}</span>
        )}
      </div>
      {error && <p className="mt-1 text-[11px] text-red-400">{error}</p>}
    </div>
  )
}

// ─── Password strength bar ────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  const score = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ].filter(Boolean).length

  const levels = ['', 'Weak', 'Fair', 'Good', 'Strong']
  const colors = ['', 'bg-red-500', 'bg-amber-400', 'bg-blue-400', 'bg-green-400']
  const text   = ['', 'text-red-400', 'text-amber-400', 'text-blue-400', 'text-green-400']

  if (!password) return null
  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`flex-1 h-1 rounded-full transition-all duration-300 ${i <= score ? colors[score] : 'bg-white/10'}`} />
        ))}
      </div>
      <p className={`text-[11px] font-medium ${text[score]}`}>{levels[score]}</p>
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────
export function RegisterPage() {
  const { register }            = useAuth()
  const [name,     setName]     = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [confirm,  setConfirm]  = useState('')
  const [showPw,   setShowPw]   = useState(false)
  const [showCf,   setShowCf]   = useState(false)
  const [terms,    setTerms]    = useState(false)
  const [loading,  setLoading]  = useState(false)
  const [error,    setError]    = useState<string | null>(null)

  const pwMismatch = confirm.length > 0 && password !== confirm

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!terms || pwMismatch) return
    setError(null)
    setLoading(true)
    try {
      await register({ full_name: name, email, password })
      // AuthContext.register() saves tokens and navigates to ?app
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string; detail?: { message?: string } | string } } })
          ?.response?.data?.detail
      if (typeof msg === 'object' && msg !== null && 'message' in msg) {
        setError(msg.message ?? 'Registration failed. Please try again.')
      } else if (typeof msg === 'string') {
        setError(msg)
      } else {
        setError('Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const eyeBtn = (show: boolean, toggle: () => void) => (
    <button type="button" tabIndex={-1} onClick={toggle} className="text-zinc-600 hover:text-zinc-300 transition-colors" aria-label={show ? 'Hide' : 'Show'}>
      {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  )

  return (
    <AuthLayout title="Create your account" subtitle="Start querying your data with AI in minutes.">
      <form onSubmit={handleSubmit} noValidate className="space-y-4">

        {/* Error banner */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-3.5 py-3"
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <p className="text-[13px] text-red-300 leading-snug">{error}</p>
          </motion.div>
        )}

        {/* Full Name */}
        <motion.div custom={0} variants={item} initial="hidden" animate="visible">
          <Field id="reg-name" label="Full name" placeholder="Alex Chen" value={name} onChange={setName}
            icon={<User className="w-4 h-4" />} autoComplete="name" />
        </motion.div>

        {/* Email */}
        <motion.div custom={1} variants={item} initial="hidden" animate="visible">
          <Field id="reg-email" label="Work email" type="email" placeholder="you@company.com" value={email}
            onChange={setEmail} icon={<Mail className="w-4 h-4" />} autoComplete="email" />
        </motion.div>

        {/* Password */}
        <motion.div custom={2} variants={item} initial="hidden" animate="visible">
          <Field id="reg-password" label="Password" type={showPw ? 'text' : 'password'}
            placeholder="Min. 8 characters" value={password} onChange={setPassword}
            icon={<Lock className="w-4 h-4" />} autoComplete="new-password"
            rightSlot={eyeBtn(showPw, () => setShowPw(v => !v))} />
          <PasswordStrength password={password} />
        </motion.div>

        {/* Confirm Password */}
        <motion.div custom={3} variants={item} initial="hidden" animate="visible">
          <Field id="reg-confirm" label="Confirm password" type={showCf ? 'text' : 'password'}
            placeholder="Repeat password" value={confirm} onChange={setConfirm}
            icon={<Lock className="w-4 h-4" />} autoComplete="new-password"
            rightSlot={eyeBtn(showCf, () => setShowCf(v => !v))}
            error={pwMismatch ? 'Passwords do not match' : undefined} />
        </motion.div>

        {/* Terms */}
        <motion.div custom={4} variants={item} initial="hidden" animate="visible" className="flex items-start gap-2.5">
          <button
            type="button"
            role="checkbox"
            aria-checked={terms}
            onClick={() => setTerms(v => !v)}
            className={`w-4 h-4 rounded flex items-center justify-center border transition-all duration-150 flex-shrink-0 mt-0.5 ${
              terms ? 'bg-primary border-primary' : 'border-white/20 bg-zinc-900/60 hover:border-white/35'
            }`}
          >
            {terms && (
              <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 8" fill="none">
                <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </button>
          <span className="text-[12px] text-zinc-500 leading-relaxed">
            I agree to SelectAI's{' '}
            <a href="#" className="text-primary underline-offset-2 hover:underline">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary underline-offset-2 hover:underline">Privacy Policy</a>
          </span>
        </motion.div>

        {/* Submit */}
        <motion.div custom={5} variants={item} initial="hidden" animate="visible">
          <motion.button
            type="submit"
            whileHover={loading ? {} : { y: -1 }}
            whileTap={loading  ? {} : { scale: 0.98 }}
            disabled={loading || !terms || pwMismatch}
            className={`w-full h-11 rounded-xl font-semibold text-[14px] text-white flex items-center justify-center gap-2 transition-all duration-200 ${
              loading || !terms || pwMismatch
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
              <>Create account <ArrowRight className="w-4 h-4" /></>
            )}
          </motion.button>
        </motion.div>

        {/* Google */}
        <motion.div custom={6} variants={item} initial="hidden" animate="visible">
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-white/8" />
            <span className="text-[11px] text-zinc-600">or</span>
            <div className="flex-1 h-px bg-white/8" />
          </div>
          <motion.button
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            className="w-full h-11 rounded-xl font-semibold text-[14px] text-zinc-200 flex items-center justify-center gap-2.5 bg-white/5 border border-white/10 hover:bg-white/8 hover:border-white/18 transition-all duration-200"
          >
            <GoogleLogo />
            Sign up with Google
          </motion.button>
        </motion.div>

        {/* Login link */}
        <motion.p custom={7} variants={item} initial="hidden" animate="visible" className="text-center text-[13px] text-zinc-600">
          Already have an account?{' '}
          <Link to="/login" className="text-primary font-semibold hover:text-primary/80 transition-colors">
            Sign in
          </Link>
        </motion.p>
      </form>
    </AuthLayout>
  )
}
