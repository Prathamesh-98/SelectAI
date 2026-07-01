import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Download, FileText, Table, Image, Trash2, Search, Filter } from 'lucide-react'
import { reportsApi } from '../../api/reports'
import { useWorkspace } from '../WorkspaceContext'
import type { Report } from '../../app/types'
import { Button } from '../../design-system/components/Button'
import { EmptyState } from '../../design-system/components/EmptyState'

function formatTimeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days > 0) return `${days}d`
  const hours = Math.floor(diff / 3600000)
  if (hours > 0) return `${hours}h`
  const minutes = Math.floor(diff / 60000)
  if (minutes > 0) return `${minutes}m`
  return 'Just now'
}

const FormatIcon = ({ format }: { format: string }) => {
  if (format === 'pdf') return <FileText className="w-5 h-5 text-red-400" />
  if (format === 'excel') return <Table className="w-5 h-5 text-green-400" />
  if (format === 'csv') return <Table className="w-5 h-5 text-blue-400" />
  if (format === 'png') return <Image className="w-5 h-5 text-purple-400" />
  return <FileText className="w-5 h-5 text-zinc-400" />
}

export function ReportHistoryPage() {
  const { activeWorkspace } = useWorkspace()
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    let mounted = true
    const loadReports = async () => {
      if (!activeWorkspace) return
      setLoading(true)
      try {
        const res = await reportsApi.list(activeWorkspace.id)
        if (mounted) setReports(res.data)
      } catch (err) {
        console.error(err)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    loadReports()
    return () => { mounted = false }
  }, [activeWorkspace])

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this report?')) return
    try {
      await reportsApi.delete(id)
      setReports(prev => prev.filter(r => r.id !== id))
    } catch (err) {
      console.error(err)
    }
  }

  const handleDownload = (id: string) => {
    window.location.href = `/api/v1/reports/${id}/download`
    // Optimistically increment download count in UI
    setReports(prev => prev.map(r => r.id === id ? { ...r, download_count: r.download_count + 1 } : r))
  }

  const filtered = reports.filter(r => 
    r.file_name.toLowerCase().includes(search.toLowerCase()) ||
    r.metadata_info?.saved_query_name?.toLowerCase().includes(search.toLowerCase()) ||
    r.metadata_info?.user_question?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] p-6 lg:p-10 max-w-6xl mx-auto w-full">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Download className="w-6 h-6 text-indigo-400" /> Export History
          </h1>
          <p className="text-sm text-zinc-400 mt-1">Manage and download your previously generated reports.</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input 
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by file name or query name..."
          className="w-full bg-[#0A0A0C] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50"
        />
      </div>

      <div className="flex-1 overflow-y-auto min-h-0 bg-[#0A0A0C] border border-white/5 rounded-xl">
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12">
            <EmptyState
              icon={<Download className="w-12 h-12 mb-4 text-zinc-600" />}
              title={search ? "No matches found" : "No exports yet"}
              description={search ? "Try adjusting your search terms." : "Export a query result from an Analysis Session or Saved Query."}
            />
          </div>
        ) : (
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/[0.02] border-b border-white/5 text-zinc-400">
              <tr>
                <th className="font-medium px-5 py-3">File Name</th>
                <th className="font-medium px-5 py-3">Source Query</th>
                <th className="font-medium px-5 py-3">Status</th>
                <th className="font-medium px-5 py-3">Downloads</th>
                <th className="font-medium px-5 py-3">Created</th>
                <th className="font-medium px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              <AnimatePresence>
                {filtered.map(report => (
                  <motion.tr 
                    key={report.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-4 flex items-center gap-3">
                      <FormatIcon format={report.format} />
                      <div>
                        <div className="font-medium text-zinc-200">{report.file_name}</div>
                        <div className="text-[11px] text-zinc-500 uppercase">{report.format}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-zinc-300 max-w-[200px] truncate">
                        {report.metadata_info?.saved_query_name || 'Session Export'}
                      </div>
                      <div className="text-[12px] text-zinc-500 max-w-[200px] truncate">
                        {report.metadata_info?.user_question || ''}
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${
                        report.status === 'completed' ? 'bg-green-500/10 text-green-400' :
                        report.status === 'failed' ? 'bg-red-500/10 text-red-400' :
                        'bg-amber-500/10 text-amber-400'
                      }`}>
                        {report.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {report.download_count}
                    </td>
                    <td className="px-5 py-4 text-zinc-400">
                      {formatTimeAgo(report.created_at)} ago
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {report.status === 'completed' && (
                          <Button variant="ghost" className="h-8 px-2" onClick={() => handleDownload(report.id)}>
                            <Download className="w-4 h-4" />
                          </Button>
                        )}
                        <Button variant="ghost" className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-red-400/10" onClick={() => handleDelete(report.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
