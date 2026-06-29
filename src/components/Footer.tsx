import { motion } from 'framer-motion'
import { Database, GitBranch, ExternalLink, MessageCircle, Globe } from 'lucide-react'

const footerLinks = {
  Company: [
    { label: 'About', href: '#about' },
    { label: 'Blog', href: '#blog' },
    { label: 'Careers', href: '#careers' },
    { label: 'Press', href: '#press' },
  ],
  Resources: [
    { label: 'Documentation', href: '#docs' },
    { label: 'API Reference', href: '#api' },
    { label: 'Tutorials', href: '#tutorials' },
    { label: 'Changelog', href: '#changelog' },
  ],
  Legal: [
    { label: 'Privacy Policy', href: '#privacy' },
    { label: 'Terms of Service', href: '#terms' },
    { label: 'Cookie Policy', href: '#cookies' },
    { label: 'Security', href: '#security' },
  ],
  Contact: [
    { label: 'hello@selectai.io', href: 'mailto:hello@selectai.io' },
    { label: 'Support Center', href: '#support' },
    { label: 'Status Page', href: '#status' },
    { label: 'Community', href: '#community' },
  ],
}

const socials = [
  { icon: GitBranch, label: 'GitHub', href: 'https://github.com' },
  { icon: MessageCircle, label: 'Twitter', href: 'https://twitter.com' },
  { icon: Globe, label: 'LinkedIn', href: 'https://linkedin.com' },
]

export default function Footer() {
  return (
    <footer className="border-t border-white/5 pt-16 pb-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-6 gap-8 mb-14">
          {/* Brand column */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="col-span-2"
          >
            <a href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <Database className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-semibold text-lg tracking-tight">
                Select<span className="gradient-text-blue">AI</span>
              </span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6 max-w-xs">
              AI-powered data analytics platform. Upload CSV datasets, ask questions in natural language, generate SQL, and visualize results instantly.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-3">
              {socials.map((social) => {
                const Icon = social.icon
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-surface border border-white/8 flex items-center justify-center text-muted hover:text-white hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                )
              })}
            </div>
          </motion.div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links], i) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <h3 className="text-xs font-semibold text-white uppercase tracking-widest mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-white transition-colors duration-200 flex items-center gap-1 group"
                    >
                      {link.label}
                      {link.href.startsWith('http') && (
                        <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-70 transition-opacity" />
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted">
            © 2024 SelectAI, Inc. All rights reserved.
          </p>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-muted-foreground">All systems operational</span>
            <span className="text-xs text-muted mx-2">·</span>
            <span className="text-xs text-muted-foreground">99.9% uptime this month</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
