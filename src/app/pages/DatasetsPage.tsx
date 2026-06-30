import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Search, Trash2, X, CheckCircle2, AlertCircle, Loader2, FolderOpen } from 'lucide-react'
import type { Dataset } from '../types'
import { useWorkspace } from '../WorkspaceContext'
import { useDatasets } from '../DatasetContext'
import { useToast } from '../../design-system'

const STATUS_CFG = {
  ready:      { label: 'Ready',      cls: 'bg-green-500/15 text-green-400',  icon: CheckCircle2 },
  processing: { label: 'Processing', cls: 'bg-amber-500/15 text-amber-400',  icon: Loader2      },
  error:      { label: 'Error',      cls: 'bg-red-500/15   text-red-400',    icon: AlertCircle  },
  idle:       { label: 'Idle',       cls: 'bg-white/8      text-zinc-500',   icon: FolderOpen   },
} as const

function DatasetCard({ ds, onDelete }: { ds: Dataset; onDelete: (id: string) => void }) {
  const { label, cls, icon: Icon } = STATUS_CFG[ds.status]
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white/[0.025] border border-white/6 rounded-2xl p-5 hover:bg-white/[0.04] hover:border-white/10 transition-all duration-200 group"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center flex-shrink-0">
            <FolderOpen className="w-4 h-4 text-accent" />
          </div>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold font-mono text-white truncate" title={ds.name}>{ds.name}</p>
            <p className="text-[11px] text-zinc-600 mt-0.5">{ds.size} · {ds.uploadedAt}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onDelete(ds.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500/70 hover:text-red-400 p-0.5"
          title="Delete dataset"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-4 mb-4">
        <div className="text-center">
          <p className="text-[18px] font-bold text-white leading-none">{ds.rows.toLocaleString()}</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Rows</p>
        </div>
        <div className="w-px bg-white/6" />
        <div className="text-center">
          <p className="text-[18px] font-bold text-white leading-none">{ds.columns.length}</p>
          <p className="text-[10px] text-zinc-600 mt-0.5">Columns</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 mb-4">
        {ds.columns.slice(0, 4).map(col => (
          <span key={col} className="text-[10px] font-mono px-1.5 py-0.5 bg-white/4 text-zinc-600 rounded border border-white/6">
            {col}
          </span>
        ))}
        {ds.columns.length > 4 && (
          <span className="text-[10px] px-1.5 py-0.5 text-zinc-700">+{ds.columns.length - 4} more</span>
        )}
      </div>
      <div className="flex items-center justify-between">
        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${cls}`}>
          <Icon className={`w-3 h-3 ${ds.status === 'processing' ? 'animate-spin' : ''}`} />
          {label}
        </span>
        <button type="button" className="text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors">
          Query →
        </button>
      </div>
    </motion.div>
  )
}

function UploadDropzone({ onClose }: { onClose: () => void }) {
  const { uploadDataset, uploadProgress, uploadingFile } = useDatasets()
  const { add: addToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isDragOver, setIsDragOver] = useState(false)

  const handleUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      addToast({
        variant: 'error',
        title: 'Invalid file type',
        description: 'Only CSV files are allowed.',
      })
      return
    }

    try {
      await uploadDataset(file)
      addToast({
        variant: 'success',
        title: 'Upload successful',
        description: `Dataset '${file.name}' has been processed.`,
      })
      onClose()
    } catch (err: any) {
      addToast({
        variant: 'error',
        title: 'Upload failed',
        description: err.response?.data?.message ?? 'Failed to upload CSV dataset.',
      })
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    if (!uploadingFile) setIsDragOver(true)
  }

  const handleDragLeave = () => {
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    if (uploadingFile) return

    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  const isUploading = !!uploadingFile

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97 }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-200 ${
        isDragOver
          ? 'border-primary bg-primary/10'
          : isUploading
          ? 'border-white/10 bg-white/[0.01]'
          : 'border-primary/30 bg-primary/5 hover:border-primary/50'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".csv"
        className="hidden"
        disabled={isUploading}
      />

      {isUploading ? (
        <div className="max-w-xs mx-auto">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-[14px] font-semibold text-zinc-200 truncate">Uploading {uploadingFile}</p>
          <p className="text-[12px] text-zinc-500 mt-1">{uploadProgress}% uploaded</p>
          <div className="w-full bg-white/5 rounded-full h-1.5 mt-3 overflow-hidden">
            <div
              className="bg-primary h-1.5 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      ) : (
        <>
          <Upload className="w-10 h-10 text-primary/40 mx-auto mb-3" />
          <p className="text-[14px] font-semibold text-zinc-300 mb-1">Drop CSV files here</p>
          <p className="text-[12px] text-zinc-600 mb-4">or click to browse your computer</p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="h-9 px-4 rounded-xl text-[13px] font-semibold text-white bg-primary hover:bg-[#2563EB] transition-colors"
            >
              Browse files
            </button>
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 rounded-xl text-[13px] font-medium text-zinc-500 hover:text-zinc-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </motion.div>
  )
}

export function DatasetsPage() {
  const { activeWorkspace } = useWorkspace()
  const { datasets, deleteDataset, isLoading, refetch } = useDatasets()
  const { add: addToast } = useToast()
  const workspace = activeWorkspace

  const [search,     setSearch]     = useState('')
  const [showUpload, setShowUpload] = useState(false)

  const handleDelete = async (id: string) => {
    const ds = datasets.find(d => d.id === id)
    if (!ds) return
    const confirmed = window.confirm(`Are you sure you want to delete dataset '${ds.name}'?`)
    if (!confirmed) return

    try {
      await deleteDataset(id)
      addToast({
        variant: 'success',
        title: 'Dataset deleted',
        description: `Dataset '${ds.name}' has been successfully deleted.`,
      })
    } catch (err: any) {
      addToast({
        variant: 'error',
        title: 'Deletion failed',
        description: err.response?.data?.message ?? 'Failed to delete dataset.',
      })
    }
  }

  const filtered = datasets.filter(ds =>
    ds.name.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-6 lg:p-8 max-w-6xl mx-auto space-y-6">

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1">
          <h1 className="text-[22px] font-bold text-white tracking-tight">Datasets</h1>
          <p className="text-[13px] text-zinc-500 mt-0.5">
            {datasets.length} dataset{datasets.length !== 1 ? 's' : ''} in this workspace
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowUpload(v => !v)}
          className="flex items-center gap-2 h-9 px-4 rounded-xl text-[13px] font-semibold text-white bg-primary hover:bg-[#2563EB] shadow-[0_0_20px_rgba(59,130,246,0.2)] hover:shadow-[0_0_28px_rgba(59,130,246,0.35)] transition-all duration-200"
        >
          <Upload className="w-3.5 h-3.5" />
          Upload Dataset
        </button>
      </div>

      <AnimatePresence>
        {showUpload && <UploadDropzone onClose={() => setShowUpload(false)} />}
      </AnimatePresence>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 pointer-events-none" />
        <input
          type="search"
          placeholder="Search datasets…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full h-9 pl-9 pr-4 rounded-xl bg-zinc-900/60 border border-white/8 text-zinc-200 text-[13px] placeholder:text-zinc-600 focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15 transition-all"
        />
        {search && (
          <button type="button" onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-300">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-[13px] text-zinc-500">Loading datasets…</p>
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(ds => <DatasetCard key={ds.id} ds={ds} onDelete={handleDelete} />)}
        </div>
      ) : (
        <div className="text-center py-16">
          <FolderOpen className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
          <p className="text-[14px] font-semibold text-zinc-500 mb-1">
            {search ? `No datasets match "${search}"` : 'No datasets yet'}
          </p>
          <p className="text-[12px] text-zinc-700">
            {search ? 'Try a different search term' : 'Upload a CSV file to get started'}
          </p>
        </div>
      )}
    </div>
  )
}
