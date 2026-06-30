// ─── Landing Page ─────────────────────────────────────────────────────────────
// Pure landing page — all routing now handled by React Router in src/router.tsx
// src/App.tsx

import Navbar          from './components/Navbar'
import Hero            from './components/Hero'
import Features        from './components/Features'
import ProductShowcase from './components/ProductShowcase'
import Workflow        from './components/Workflow'
import FAQ             from './components/FAQ'
import CTA             from './components/CTA'
import Footer          from './components/Footer'

export default function LandingPage() {
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
