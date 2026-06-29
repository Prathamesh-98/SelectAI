import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LoginPage }          from './LoginPage'
import { RegisterPage }       from './RegisterPage'
import { ForgotPasswordPage } from './ForgotPasswordPage'
import { ResetPasswordPage }  from './ResetPasswordPage'

// Which auth page to render — determined by ?auth= query param on first load,
// then controlled by internal state so navigation is instant (no full page reload).
function getInitialPage(): string {
  const p = new URLSearchParams(window.location.search).get('auth')
  if (p === 'register') return 'register'
  if (p === 'forgot')   return 'forgot'
  if (p === 'reset')    return 'reset'
  return 'login'
}

export default function AuthRouter() {
  const [page, setPage] = useState<string>(getInitialPage)

  // Sync URL without reload for bookmarkability
  const navigate = (next: string) => {
    history.pushState({}, '', `?auth=${next}`)
    setPage(next)
  }

  const pageMap: Record<string, React.ReactNode> = {
    login:    <LoginPage          onNavigate={navigate} />,
    register: <RegisterPage       onNavigate={navigate} />,
    forgot:   <ForgotPasswordPage onNavigate={navigate} />,
    reset:    <ResetPasswordPage  onNavigate={navigate} />,
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={page}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{    opacity: 0 }}
        transition={{ duration: 0.18 }}
        className="contents"
      >
        {pageMap[page] ?? pageMap['login']}
      </motion.div>
    </AnimatePresence>
  )
}
