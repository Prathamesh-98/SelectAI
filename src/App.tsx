import Navbar           from './components/Navbar'
import Hero             from './components/Hero'
import Features         from './components/Features'
import ProductShowcase  from './components/ProductShowcase'
import Workflow         from './components/Workflow'
import FAQ              from './components/FAQ'
import CTA              from './components/CTA'
import Footer           from './components/Footer'
import AuthRouter       from './auth'
import AppShell         from './app/AppShell'
import DesignSystemPage from './DesignSystem'

const qs     = new URLSearchParams(window.location.search)
const isDS   = qs.has('design-system')
const isAuth = qs.has('auth')
const isApp  = qs.has('app')

function LandingPage() {
  return (
    <div className="relative min-h-screen bg-background text-white overflow-x-hidden">
      {/* Global background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-accent/5 rounded-full blur-3xl" />
      </div>

      <Navbar />
      <main>
        <Hero />
        <Features />
        <ProductShowcase />
        <Workflow />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
  )
}

function App() {
  if (isDS)   return <DesignSystemPage />
  if (isApp)  return <AppShell />
  if (isAuth) return <AuthRouter />
  return <LandingPage />
}

export default App
