import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, AlertTriangle } from 'lucide-react'
import { WORKSPACE_COLORS } from '../mockData'
import type { Workspace } from '../types'

interface Props {
  workspace:  Workspace
  onUpdate:   (patch: Partial<Pick<Workspace, 'name' | 'description' | 'color'>>) => void
}

export function SettingsPage({ workspace, onUpdate }: Props) {
  const [name,   setName]   = useState(workspace.name)
  const [desc,   setDesc]   = useState(workspace.description ?? '')
  const [color,  setColor]  = useState(workspace.color)
  const [saved,  setSaved]  = useState(false)
  const [delConfirm, setDelConfirm] = useState(false)

  const isDirty = name !== workspace.name || desc !== (workspace.description ?? '') || color !== workspace.color

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    onUpdate({ name: name.trim(), description: desc.trim(), color })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-[22px] font-bold text-white tracking-tight">Settings</h1>
        <p className="text-[13px] text-zinc-500 mt-0.5">Manage the {workspace.name} workspace</p>
      </div>

      {/* General settings */}
      <section className="bg-white/[0.025] border border-white/6 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-white/6 flex items-center gap-2">
          <Settings className="w-4 h-4 text-zinc-500" />
          <h2 className="text-[14px] font-bold text-white">General</h2>
        </div>
        <form onSubmit={handleSave} className="px-6 py-5 space-y-5">

          {/* Name */}
          <div>
            <label htmlFor="settings-name" className="block text-[13px] font-medium text-zinc-300 mb-1.5">
              Workspace name
            </label>
            <input
              id="settings-name"
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={48}
              required
              className="w-full h-10 px-3.5 rounded-xl bg-zinc-900/70 border border-white/8 text-zinc-100 text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 hover:border-white/14 transition-all duration-200"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="settings-desc" className="block text-[13px] font-medium text-zinc-300 mb-1.5">
              Description <span className="text-zinc-600 font-normal">(optional)</span>
            </label>
            <textarea
              id="settings-desc"
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={3}
              maxLength={200}
              placeholder="Describe what this workspace is for…"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/70 border border-white/8 text-zinc-100 text-[14px] placeholder:text-zinc-600 focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 hover:border-white/14 transition-all duration-200 resize-none leading-relaxed"
            />
          </div>

          {/* Accent color */}
          <div>
            <p className="text-[13px] font-medium text-zinc-300 mb-3">Accent color</p>
            <div className="flex flex-wrap gap-2.5">
              {WORKSPACE_COLORS.map(c => (
                <button
                  key={c.value}
                  type="button"
                  title={c.label}
                  onClick={() => setColor(c.value)}
                  className={`w-8 h-8 rounded-full transition-all duration-150 flex items-center justify-center ${
                    color === c.value ? 'ring-2 ring-offset-2 ring-offset-[#1a1a1d] scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                  style={{ backgroundColor: c.value }}
                >
                  {color === c.value && (
                    <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 14 11" fill="none">
                      <path d="M1 5.5l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Save */}
          <div className="flex items-center gap-3 pt-1">
            <motion.button
              type="submit"
              whileHover={!isDirty ? {} : { y: -1 }}
              whileTap={!isDirty ? {} : { scale: 0.98 }}
              disabled={!isDirty || !name.trim()}
              className={`h-9 px-5 rounded-xl text-[13px] font-semibold transition-all duration-200 ${
                isDirty && name.trim()
                  ? saved
                    ? 'bg-green-600 text-white'
                    : 'bg-primary text-white hover:bg-[#2563EB] shadow-[0_0_16px_rgba(59,130,246,0.2)]'
                  : 'bg-white/5 text-zinc-600 cursor-not-allowed'
              }`}
            >
              {saved ? '✓ Saved' : 'Save Changes'}
            </motion.button>
            {isDirty && (
              <button type="button" onClick={() => { setName(workspace.name); setDesc(workspace.description ?? ''); setColor(workspace.color) }}
                className="text-[13px] text-zinc-600 hover:text-zinc-300 transition-colors">
                Reset
              </button>
            )}
          </div>
        </form>
      </section>

      {/* Danger zone */}
      <section className="bg-red-500/[0.04] border border-red-500/15 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-red-500/10 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400" />
          <h2 className="text-[14px] font-bold text-red-400">Danger Zone</h2>
        </div>
        <div className="px-6 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-[13px] font-semibold text-zinc-300">Delete this workspace</p>
              <p className="text-[12px] text-zinc-600 mt-0.5">
                All datasets, queries, charts and history will be permanently removed.
              </p>
            </div>
            {!delConfirm ? (
              <button type="button" onClick={() => setDelConfirm(true)}
                className="flex-shrink-0 h-9 px-4 rounded-xl text-[13px] font-semibold text-red-400 border border-red-500/25 bg-red-500/8 hover:bg-red-500/15 hover:border-red-500/40 transition-all duration-200">
                Delete Workspace
              </button>
            ) : (
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-[12px] text-red-400">Are you sure?</span>
                <button type="button" className="h-8 px-3 rounded-lg text-[12px] font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors">
                  Yes, delete
                </button>
                <button type="button" onClick={() => setDelConfirm(false)}
                  className="h-8 px-3 rounded-lg text-[12px] text-zinc-500 hover:text-zinc-300 transition-colors">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
