// ─── Workspace Context ────────────────────────────────────────────────────────
// Replaces mock data with real backend calls.
// - On mount: fetches workspaces from GET /workspaces
// - createWorkspace: POST /workspaces → refetch
// - updateWorkspace: PATCH /workspaces/:id → optimistic update
// - deleteWorkspace: DELETE /workspaces/:id → remove from list
// - switchWorkspace:  local only (no API call needed)
// - Sessions remain local (future phase)
// src/app/WorkspaceContext.tsx

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { workspacesApi } from '../api/workspaces'
import { WORKSPACE_COLORS } from './mockData'          // colour palette only — no mock workspaces
import type { WorkspaceDTO } from '../types/workspace'
import type { Workspace, AnalysisSession } from './types'

// ── Helper: map a backend WorkspaceDTO → frontend Workspace shell ──────────────
// The backend doesn't return nested datasets / sessions yet (those are Phase 6+).
// We populate them with empty arrays so the rest of the UI works unchanged.
function dtoToWorkspace(dto: WorkspaceDTO): Workspace {
  return {
    id:           dto.id,
    name:         dto.name,
    description:  dto.description ?? undefined,
    color:        dto.color,
    datasets:     [],
    sessions:     [],
    savedQueries: [],
    savedCharts:  [],
    history:      [],
    createdAt:    dto.created_at,
  }
}

// ── Default fallback workspace (shown only while loading or on error) ──────────
const LOADING_WORKSPACE: Workspace = {
  id:           '__loading__',
  name:         'Loading…',
  description:  undefined,
  color:        '#3B82F6',
  datasets:     [],
  sessions:     [],
  savedQueries: [],
  savedCharts:  [],
  history:      [],
  createdAt:    new Date().toISOString(),
}

// ── Context shape ──────────────────────────────────────────────────────────────

export interface WorkspaceContextValue {
  workspaces:      Workspace[]
  activeWorkspace: Workspace
  activeWsId:      string
  isLoading:       boolean
  error:           string | null

  createWsOpen:    boolean
  setCreateWsOpen: (open: boolean) => void

  /** Switch the active workspace (local only, navigates to /dashboard) */
  switchWorkspace:  (id: string) => void
  /** POST /workspaces → add to list → switch to new workspace */
  createWorkspace:  (data: { name: string; description: string; color: string }) => Promise<void>
  /** PATCH /workspaces/:id → optimistic update in-place */
  updateWorkspace:  (patch: Partial<Pick<Workspace, 'name' | 'description' | 'color'>>) => Promise<void>
  /** DELETE /workspaces/:id → remove from list, switch to first remaining */
  deleteWorkspace:  () => Promise<void>
  /** Refetch the workspace list from the server */
  refetch:          () => Promise<void>

  // ── Session actions (local only — backend integration in Phase 6) ──────────
  createSession:   (name: string, datasetIds: string[], description: string) => void
  updateSession:   (sessionId: string, patch: Partial<AnalysisSession>) => void
  getSession:      (sessionId: string) => AnalysisSession | undefined
}

// ── Context ────────────────────────────────────────────────────────────────────

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null)

// ── Provider ───────────────────────────────────────────────────────────────────

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const navigate   = useNavigate()
  const mountedRef = useRef(true)

  const [workspaces,   setWorkspaces]   = useState<Workspace[]>([])
  const [activeWsId,   setActiveWsId]   = useState<string>('')
  const [createWsOpen, setCreateWsOpen] = useState(false)
  const [isLoading,    setIsLoading]    = useState(true)
  const [error,        setError]        = useState<string | null>(null)

  // Derived: the currently active workspace (fallback while loading)
  const activeWorkspace =
    workspaces.find(w => w.id === activeWsId) ??
    workspaces[0] ??
    LOADING_WORKSPACE

  // ── Fetch helpers ────────────────────────────────────────────────────────────

  const loadWorkspaces = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const dtos  = await workspacesApi.list()
      if (!mountedRef.current) return

      const mapped = dtos.map(dtoToWorkspace)
      setWorkspaces(mapped)

      // Keep the active selection if it still exists, else pick the first
      setActiveWsId(prev => {
        if (mapped.some(w => w.id === prev)) return prev
        return mapped[0]?.id ?? ''
      })
    } catch (err: unknown) {
      if (!mountedRef.current) return
      const msg = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message ?? 'Failed to load workspaces.'
      setError(msg)
    } finally {
      if (mountedRef.current) setIsLoading(false)
    }
  }, [])

  // Bootstrap on mount
  useEffect(() => {
    mountedRef.current = true
    loadWorkspaces()
    return () => { mountedRef.current = false }
  }, [loadWorkspaces])

  // ── Workspace actions ────────────────────────────────────────────────────────

  const switchWorkspace = (id: string) => {
    setActiveWsId(id)
    navigate('/dashboard')
  }

  const createWorkspace = async (data: {
    name: string
    description: string
    color: string
  }) => {
    const dto = await workspacesApi.create({
      name:        data.name.trim(),
      description: data.description.trim() || null,
      color:       data.color,
    })
    const ws = dtoToWorkspace(dto)
    setWorkspaces(prev => [...prev, ws])
    setActiveWsId(ws.id)
    navigate('/dashboard')
  }

  const updateWorkspace = async (
    patch: Partial<Pick<Workspace, 'name' | 'description' | 'color'>>
  ) => {
    if (!activeWsId || activeWsId === '__loading__') return

    const dto = await workspacesApi.update(activeWsId, {
      name:        patch.name,
      description: patch.description ?? null,
      color:       patch.color,
    })
    const updated = dtoToWorkspace(dto)

    // Preserve local session/dataset state that the server doesn't know about yet
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWsId
        ? { ...w, name: updated.name, description: updated.description, color: updated.color }
        : w
    ))
  }

  const deleteWorkspace = async () => {
    if (!activeWsId || activeWsId === '__loading__') return

    await workspacesApi.softDelete(activeWsId)

    setWorkspaces(prev => {
      const remaining = prev.filter(w => w.id !== activeWsId)
      // Switch to another workspace
      setActiveWsId(remaining[0]?.id ?? '')
      return remaining
    })
    navigate('/dashboard')
  }

  const refetch = loadWorkspaces

  // ── Session actions (local only — Phase 6 integrates sessions) ───────────────

  const createSession = (name: string, datasetIds: string[], description: string) => {
    const newSession: AnalysisSession = {
      id:          `sess-${Date.now()}`,
      name,
      description: description || undefined,
      datasetIds,
      messages:    [],
      queries:     [],
      charts:      [],
      insights:    [],
      createdAt:   new Date().toISOString(),
      updatedAt:   new Date().toISOString(),
    }
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWsId
        ? { ...w, sessions: [...w.sessions, newSession] }
        : w
    ))
    navigate(`/analysis/${newSession.id}`)
  }

  const updateSession = (sessionId: string, patch: Partial<AnalysisSession>) => {
    setWorkspaces(prev => prev.map(w =>
      w.id === activeWsId
        ? {
            ...w,
            sessions: w.sessions.map(s =>
              s.id === sessionId ? { ...s, ...patch } : s
            ),
          }
        : w
    ))
  }

  const getSession = (sessionId: string): AnalysisSession | undefined =>
    activeWorkspace.sessions.find(s => s.id === sessionId)

  // ── Value ────────────────────────────────────────────────────────────────────

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      activeWorkspace,
      activeWsId,
      isLoading,
      error,
      createWsOpen,
      setCreateWsOpen,
      switchWorkspace,
      createWorkspace,
      updateWorkspace,
      deleteWorkspace,
      refetch,
      createSession,
      updateSession,
      getSession,
    }}>
      {children}
    </WorkspaceContext.Provider>
  )
}

// ── Hook ───────────────────────────────────────────────────────────────────────

export function useWorkspace(): WorkspaceContextValue {
  const ctx = useContext(WorkspaceContext)
  if (!ctx) throw new Error('useWorkspace() must be used inside <WorkspaceProvider>')
  return ctx
}

// Re-export colour palette (pages still import this from here for convenience)
export { WORKSPACE_COLORS }
