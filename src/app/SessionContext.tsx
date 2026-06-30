// ─── Session Context ────────────────────────────────────────────────────────
// src/app/SessionContext.tsx

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { sessionsApi, AnalysisSessionDTO } from '../api/sessions'
import { useWorkspace } from './WorkspaceContext'
import type { AnalysisSession } from './types'

// ── Helper: Map DTO to Frontend Model ───────────────────────────────────────
function dtoToSession(dto: AnalysisSessionDTO, existingSession?: AnalysisSession): AnalysisSession {
  return {
    id:          dto.id,
    name:        dto.name,
    description: dto.description ?? undefined,
    datasetIds:  dto.dataset_ids,
    // Preserve local transient state if it exists, otherwise initialize empty
    messages:    existingSession?.messages ?? [],
    queries:     existingSession?.queries ?? [],
    charts:      existingSession?.charts ?? [],
    insights:    existingSession?.insights ?? [],
    createdAt:   dto.created_at,
    updatedAt:   dto.updated_at,
  }
}

// ── Context Shape ─────────────────────────────────────────────────────────────

export interface SessionContextValue {
  sessions:        AnalysisSession[]
  activeSession:   AnalysisSession | null // Optional based on route, but let's provide getSession instead
  isLoading:       boolean
  error:           string | null
  
  createSession:   (name: string, datasetIds: string[], description: string) => Promise<AnalysisSession>
  updateSession:   (id: string, patch: Partial<AnalysisSession>) => Promise<void>
  deleteSession:   (id: string) => Promise<void>
  getSession:      (id: string) => AnalysisSession | undefined
  
  refresh:         () => Promise<void>
  refetch:         () => Promise<void>
}

const SessionContext = createContext<SessionContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const { activeWsId } = useWorkspace()
  const mountedRef = useRef(true)

  const [sessions, setSessions] = useState<AnalysisSession[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ── Fetch sessions ──────────────────────────────────────────────────────────
  const refresh = useCallback(async () => {
    if (!activeWsId || activeWsId === '__loading__') {
      setSessions([])
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      const dtos = await sessionsApi.list(activeWsId)
      if (!mountedRef.current) return
      
      setSessions(prev => {
        // Map DTOs, preserving local transient states (messages, etc.)
        const prevMap = new Map(prev.map(s => [s.id, s]))
        return dtos.map(dto => dtoToSession(dto, prevMap.get(dto.id)))
      })
    } catch (err: any) {
      if (!mountedRef.current) return
      const msg = err.response?.data?.message ?? 'Failed to load sessions.'
      setError(msg)
    } finally {
      if (mountedRef.current) setIsLoading(false)
    }
  }, [activeWsId])

  useEffect(() => {
    mountedRef.current = true
    refresh()
    return () => {
      mountedRef.current = false
    }
  }, [refresh])

  // ── Create session ──────────────────────────────────────────────────────────
  const createSession = useCallback(async (name: string, datasetIds: string[], description: string) => {
    if (!activeWsId || activeWsId === '__loading__') {
      throw new Error('No active workspace selected.')
    }
    const dto = await sessionsApi.create({
      workspace_id: activeWsId,
      name,
      description,
      dataset_ids: datasetIds,
    })
    const newSession = dtoToSession(dto)
    if (mountedRef.current) {
      setSessions(prev => [newSession, ...prev])
    }
    return newSession
  }, [activeWsId])

  // ── Update session ──────────────────────────────────────────────────────────
  const updateSession = useCallback(async (id: string, patch: Partial<AnalysisSession>) => {
    if (!activeWsId || activeWsId === '__loading__') return

    // Extract fields that the backend supports
    const backendPatch: { name?: string; description?: string | null } = {}
    let hasBackendChanges = false

    if (patch.name !== undefined) {
      backendPatch.name = patch.name
      hasBackendChanges = true
    }
    if (patch.description !== undefined) {
      backendPatch.description = patch.description || null
      hasBackendChanges = true
    }

    if (hasBackendChanges) {
      await sessionsApi.update(id, activeWsId, backendPatch)
    }

    // Apply local update after backend success (or immediately if no backend changes)
    setSessions(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s))
  }, [activeWsId])

  // ── Delete session ──────────────────────────────────────────────────────────
  const deleteSession = useCallback(async (id: string) => {
    if (!activeWsId || activeWsId === '__loading__') return
    await sessionsApi.delete(id, activeWsId)
    if (mountedRef.current) {
      setSessions(prev => prev.filter(s => s.id !== id))
    }
  }, [activeWsId])

  // ── Get session ─────────────────────────────────────────────────────────────
  const getSession = useCallback((id: string) => {
    return sessions.find(s => s.id === id)
  }, [sessions])

  const contextValue = useMemo(() => ({
    sessions,
    activeSession: null, // Provided for completeness if needed by UI
    isLoading,
    error,
    createSession,
    updateSession,
    deleteSession,
    getSession,
    refresh,
    refetch: refresh,
  }), [
    sessions,
    isLoading,
    error,
    createSession,
    updateSession,
    deleteSession,
    getSession,
    refresh,
  ])

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSessions(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSessions() must be used inside <SessionProvider>')
  return ctx
}
