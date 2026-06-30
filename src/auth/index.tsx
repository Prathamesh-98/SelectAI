// ─── Auth Router (legacy file — now just a barrel) ───────────────────────────
// React Router handles all auth routing now. This file is kept to avoid
// any remaining import paths breaking, but is no longer used.
// The router.tsx directly imports each auth page.
// src/auth/index.tsx

export { LoginPage }          from './LoginPage'
export { RegisterPage }       from './RegisterPage'
export { ForgotPasswordPage } from './ForgotPasswordPage'
export { ResetPasswordPage }  from './ResetPasswordPage'
