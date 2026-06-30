// ─── Dataset Context ─────────────────────────────────────────────────────────
// Manages datasets state for the active workspace.
// src/app/DatasetContext.tsx

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { datasetsApi } from '../api/datasets'
import { useWorkspace } from './WorkspaceContext'
import type { DatasetDTO } from '../types/dataset'
import type { Dataset } from './types'

// ── Helper: Map DTO to Dataset structure ──────────────────────────────────────
function dtoToDataset(dto: DatasetDTO): Dataset {
  // Format file size
  let sizeStr = '0 B'
  const bytes = dto.file_size_bytes
  if (bytes > 0) {
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    sizeStr = parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  // Extract columns
  let columns: string[] = []
  if (dto.columns_metadata && Array.isArray((dto.columns_metadata as any).columns)) {
    columns = (dto.columns_metadata as any).columns.map((c: any) => c.name)
  }

  // Map status
  let status: 'ready' | 'processing' | 'error' | 'idle' = 'idle'
  if (dto.status === 'ready') status = 'ready'
  else if (dto.status === 'processing' || dto.status === 'pending') status = 'processing'
  else if (dto.status === 'error') status = 'error'

  // Map uploadedAt relative string
  const uploadedDate = new Date(dto.created_at)
  const now = new Date()
  const diffMs = now.getTime() - uploadedDate.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  let uploadedAt = 'just now'
  if (diffDays > 0) {
    uploadedAt = diffDays === 1 ? '1 day ago' : `${diffDays} days ago`
  } else if (diffHours > 0) {
    uploadedAt = diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`
  } else if (diffMins > 0) {
    uploadedAt = diffMins === 1 ? '1 minute ago' : `${diffMins} minutes ago`
  }

  return {
    id:         dto.id,
    name:       dto.name,
    rows:       dto.row_count ?? 0,
    columns:    columns,
    size:       sizeStr,
    uploadedAt: uploadedAt,
    status:     status,
  }
}

// ── Context Shape ─────────────────────────────────────────────────────────────

export interface DatasetContextValue {
  datasets:        Dataset[]
  isLoading:       boolean
  error:           string | null
  uploadProgress:  number
  uploadingFile:   string | null
  uploadDataset:   (file: File) => Promise<Dataset>
  deleteDataset:   (id: string) => Promise<void>
  refresh:         () => Promise<void>
  refetch:         () => Promise<void>
}

const DatasetContext = createContext<DatasetContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function DatasetProvider({ children }: { children: React.ReactNode }) {
  const { activeWsId } = useWorkspace()
  const mountedRef = useRef(true)

  const [datasets, setDatasets] = useState<Dataset[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Upload state
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadingFile, setUploadingFile] = useState<string | null>(null)

  // ── Fetch datasets (refresh) ────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    // If no active workspace or loading placeholder workspace
    if (!activeWsId || activeWsId === '__loading__') {
      setDatasets([])
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const dtos = await datasetsApi.list(activeWsId)
      if (!mountedRef.current) return
      setDatasets(dtos.map(dtoToDataset))
    } catch (err: any) {
      if (!mountedRef.current) return
      const msg = err.response?.data?.message ?? 'Failed to load datasets.'
      setError(msg)
    } finally {
      if (mountedRef.current) setIsLoading(false)
    }
  }, [activeWsId])

  // Load on workspace change
  useEffect(() => {
    mountedRef.current = true
    refresh()
    return () => {
      mountedRef.current = false
    }
  }, [refresh])

  // ── Upload dataset ───────────────────────────────────────────────────────────
  const uploadDataset = useCallback(async (file: File): Promise<Dataset> => {
    if (!activeWsId || activeWsId === '__loading__') {
      throw new Error('No active workspace selected.')
    }

    setUploadingFile(file.name)
    setUploadProgress(0)
    try {
      const dto = await datasetsApi.upload(file, activeWsId, (pct) => {
        if (mountedRef.current) setUploadProgress(pct)
      })
      const ds = dtoToDataset(dto)
      if (mountedRef.current) {
        setDatasets((prev) => [ds, ...prev])
      }
      return ds
    } finally {
      if (mountedRef.current) {
        setUploadingFile(null)
        setUploadProgress(0)
      }
    }
  }, [activeWsId])

  // ── Delete dataset ───────────────────────────────────────────────────────────
  const deleteDataset = useCallback(async (id: string): Promise<void> => {
    if (!activeWsId || activeWsId === '__loading__') {
      throw new Error('No active workspace selected.')
    }

    await datasetsApi.delete(id, activeWsId)
    if (mountedRef.current) {
      setDatasets((prev) => prev.filter((ds) => ds.id !== id))
    }
  }, [activeWsId])

  // Memoize context value object to prevent redundant re-renders
  const contextValue = useMemo(() => ({
    datasets,
    isLoading,
    error,
    uploadProgress,
    uploadingFile,
    uploadDataset,
    deleteDataset,
    refresh,
    refetch: refresh,
  }), [
    datasets,
    isLoading,
    error,
    uploadProgress,
    uploadingFile,
    uploadDataset,
    deleteDataset,
    refresh,
  ])

  return (
    <DatasetContext.Provider value={contextValue}>
      {children}
    </DatasetContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useDatasets(): DatasetContextValue {
  const ctx = useContext(DatasetContext)
  if (!ctx) throw new Error('useDatasets() must be used inside <DatasetProvider>')
  return ctx
}
