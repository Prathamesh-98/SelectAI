import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, LayoutDashboard, Search, Settings2, Trash2, Edit2, Copy, FileText, ChevronRight, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useDashboards } from '../DashboardContext'
import { Button } from '../../design-system/components/Button'
import { Input } from '../../design-system/components/Input'
import { Card } from '../../design-system/components/Card'
import { EmptyState } from '../../design-system/components/EmptyState'

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days}d`
  const hours = Math.floor(diff / 3600000)
  if (hours > 0) return `${hours}h`
  const minutes = Math.floor(diff / 60000)
  return `${minutes}m`
}

export function DashboardsPage() {
  const navigate = useNavigate()
  const { dashboards, isLoading, createDashboard, deleteDashboard } = useDashboards()
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [newName, setNewName] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [creating, setCreating] = useState(false)

  const filtered = dashboards.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    (d.description && d.description.toLowerCase().includes(search.toLowerCase()))
  )

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName.trim() || creating) return
    setCreating(true)
    try {
      const db = await createDashboard({ name: newName.trim(), description: newDesc.trim() || undefined })
      setShowCreate(false)
      navigate(`/dashboards/${db.id}`)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation()
    if (confirm('Delete this dashboard?')) {
      await deleteDashboard(id)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] p-6 lg:p-10 max-w-6xl mx-auto w-full">
      
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-indigo-400" /> Dashboards
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Compose metrics and AI insights into unified views.</p>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2 bg-indigo-500 hover:bg-indigo-600">
          <Plus className="w-4 h-4" /> New Dashboard
        </Button>
      </div>

      <div className="relative mb-6">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search dashboards..."
          className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50"
        />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<LayoutDashboard className="w-12 h-12 mb-4 text-zinc-600" />}
            title={search ? "No matches found" : "No dashboards yet"}
            description={search ? "Try adjusting your search terms." : "Create your first interactive dashboard."}
            action={!search ? { label: "Create Dashboard", onClick: () => setShowCreate(true) } : undefined}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {filtered.map((db, i) => (
                <motion.div
                  key={db.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => navigate(`/dashboards/${db.id}`)}
                  className="group relative bg-[#0A0A0C] border border-white/5 hover:border-indigo-500/30 rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-indigo-500/5"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                        <LayoutDashboard className="w-5 h-5 text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-[15px] font-medium text-white">{db.name}</h3>
                        <p className="text-[12px] text-zinc-500">{db.widgets.length} widgets</p>
                      </div>
                    </div>
                    <button 
                      onClick={(e) => handleDelete(e, db.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-white/10 rounded text-zinc-400 hover:text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="mt-4 text-sm text-zinc-400 line-clamp-2 min-h-[40px]">
                    {db.description || 'No description provided.'}
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-600">Updated {formatTimeAgo(db.updated_at)} ago</span>
                    <span className="text-[12px] text-indigo-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 font-medium">
                      Open <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-[#0f111a] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
          >
            <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <h3 className="font-medium">Create Dashboard</h3>
              <button onClick={() => setShowCreate(false)} className="text-zinc-400 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreate} className="p-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name</label>
                  <Input autoFocus value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Executive Overview" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Description (Optional)</label>
                  <textarea 
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    placeholder="What metrics are tracked here?"
                    className="w-full h-20 bg-[#050505] border border-white/10 rounded-lg p-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 resize-none"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
                <Button type="submit" variant="primary" disabled={!newName.trim() || creating}>
                  {creating ? 'Creating...' : 'Create Dashboard'}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}
