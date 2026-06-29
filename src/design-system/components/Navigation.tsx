import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Database, ChevronDown, ChevronRight } from 'lucide-react'

// ─── NavigationMenu ───────────────────────────────────────────────────────────
export interface NavItem {
  key:       string
  label:     string
  href?:     string
  icon?:     React.ReactNode
  badge?:    string
  children?: NavItem[]
  disabled?: boolean
}

export interface NavigationMenuProps {
  items:      NavItem[]
  activeKey?: string
  onSelect?:  (key: string) => void
  className?: string
}

function NavLink({ item, active, onSelect }: { item: NavItem; active: boolean; onSelect?: (key: string) => void }) {
  const [subOpen, setSubOpen] = useState(false)
  const hasChildren = item.children && item.children.length > 0

  return (
    <div className="relative">
      <a
        href={item.href ?? '#'}
        onClick={e => {
          if (hasChildren) { e.preventDefault(); setSubOpen(v => !v) }
          else onSelect?.(item.key)
        }}
        className={[
          'flex items-center gap-2 px-3.5 py-2 rounded-lg text-[13px] font-medium',
          'transition-all duration-150 select-none',
          item.disabled ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer',
          active
            ? 'bg-primary/12 text-primary border border-primary/20'
            : 'text-zinc-400 hover:text-white hover:bg-white/5',
        ].join(' ')}
      >
        {item.icon && <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>}
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-primary/15 text-primary border border-primary/20">
            {item.badge}
          </span>
        )}
        {hasChildren && (
          <motion.span animate={{ rotate: subOpen ? 90 : 0 }} transition={{ duration: 0.18 }}>
            <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          </motion.span>
        )}
      </a>

      <AnimatePresence>
        {hasChildren && subOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden pl-4 mt-0.5"
          >
            {item.children!.map(child => (
              <a
                key={child.key}
                href={child.href ?? '#'}
                onClick={() => onSelect?.(child.key)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[12px] text-zinc-500 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <span className="w-1 h-1 rounded-full bg-zinc-700 flex-shrink-0" />
                {child.label}
              </a>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function NavigationMenu({ items, activeKey, onSelect, className = '' }: NavigationMenuProps) {
  return (
    <nav className={`flex flex-col gap-0.5 ${className}`} aria-label="Main navigation">
      {items.map(item => (
        <NavLink
          key={item.key}
          item={item}
          active={activeKey === item.key}
          onSelect={onSelect}
        />
      ))}
    </nav>
  )
}

// ─── Sidebar ──────────────────────────────────────────────────────────────────
export interface SidebarSection {
  label?: string
  items:  NavItem[]
}

export interface SidebarProps {
  sections:   SidebarSection[]
  activeKey?: string
  onSelect?:  (key: string) => void
  collapsed?: boolean
  header?:    React.ReactNode
  footer?:    React.ReactNode
  width?:     number   // expanded width px
  className?: string
}

export function Sidebar({
  sections,
  activeKey,
  onSelect,
  collapsed = false,
  header,
  footer,
  width     = 220,
  className = '',
}: SidebarProps) {
  return (
    <motion.aside
      animate={{ width: collapsed ? 56 : width }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={[
        'flex flex-col h-full overflow-hidden',
        'bg-[#18181B] border-r border-white/[0.06]',
        className,
      ].join(' ')}
    >
      {/* Header slot */}
      {header && (
        <div className={`flex-shrink-0 px-3 pt-4 pb-3 border-b border-white/6 ${collapsed ? 'flex justify-center px-0' : ''}`}>
          {header}
        </div>
      )}

      {/* Sections */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden px-2 py-3 space-y-4">
        {sections.map((section, si) => (
          <div key={si}>
            {section.label && !collapsed && (
              <p className="px-3 py-1 text-[10px] font-semibold text-zinc-600 uppercase tracking-widest">
                {section.label}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map(item => (
                <SidebarItem
                  key={item.key}
                  item={item}
                  active={activeKey === item.key}
                  collapsed={collapsed}
                  onSelect={onSelect}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer slot */}
      {footer && (
        <div className={`flex-shrink-0 px-2 py-3 border-t border-white/6 ${collapsed ? 'flex justify-center px-0' : ''}`}>
          {footer}
        </div>
      )}
    </motion.aside>
  )
}

function SidebarItem({ item, active, collapsed, onSelect }: {
  item: NavItem; active: boolean; collapsed: boolean; onSelect?: (key: string) => void
}) {
  return (
    <a
      href={item.href ?? '#'}
      title={collapsed ? item.label : undefined}
      onClick={e => { e.preventDefault(); if (!item.disabled) onSelect?.(item.key) }}
      className={[
        'flex items-center gap-2.5 rounded-xl text-[13px] font-medium',
        'transition-all duration-150 cursor-pointer group',
        collapsed ? 'justify-center w-10 h-10 mx-auto' : 'px-3 py-2',
        item.disabled ? 'opacity-40 cursor-not-allowed' : '',
        active
          ? 'bg-primary/12 text-primary border border-primary/20'
          : 'text-zinc-400 hover:text-white hover:bg-white/5',
      ].join(' ')}
    >
      {item.icon && (
        <span className="w-4 h-4 flex-shrink-0">{item.icon}</span>
      )}
      {!collapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge && (
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-primary/15 text-primary border border-primary/20">
              {item.badge}
            </span>
          )}
        </>
      )}
    </a>
  )
}
