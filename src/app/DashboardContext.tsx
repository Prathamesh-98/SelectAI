import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { dashboardsApi, CreateDashboardPayload, AddWidgetPayload } from '../api/dashboards'
import type { Dashboard, DashboardWidget } from './types'
import { useWorkspace } from './WorkspaceContext'

interface DashboardContextValue {
  dashboards: Dashboard[]
  isLoading: boolean
  error: string | null
  activeDashboardId: string | null
  activeDashboard: Dashboard | null
  
  setActiveDashboardId: (id: string | null) => void
  fetchDashboards: () => Promise<void>
  createDashboard: (payload: Omit<CreateDashboardPayload, 'workspace_id'>) => Promise<Dashboard>
  updateDashboard: (id: string, payload: Partial<Dashboard>) => Promise<void>
  deleteDashboard: (id: string) => Promise<void>
  
  addWidget: (payload: AddWidgetPayload) => Promise<void>
  updateWidget: (widgetId: string, payload: Partial<DashboardWidget>) => Promise<void>
  removeWidget: (widgetId: string) => Promise<void>
}

const DashboardContext = createContext<DashboardContextValue | undefined>(undefined)

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const { activeWorkspace } = useWorkspace()
  const [dashboards, setDashboards] = useState<Dashboard[]>([])
  const [activeDashboardId, setActiveDashboardId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchDashboards = useCallback(async () => {
    if (!activeWorkspace) return
    setIsLoading(true)
    try {
      const data = await dashboardsApi.list(activeWorkspace.id, 1, 100)
      setDashboards(data.data)
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboards')
    } finally {
      setIsLoading(false)
    }
  }, [activeWorkspace])

  useEffect(() => {
    fetchDashboards()
  }, [fetchDashboards])

  const createDashboard = async (payload: Omit<CreateDashboardPayload, 'workspace_id'>) => {
    if (!activeWorkspace) throw new Error('No workspace')
    const created = await dashboardsApi.create({ ...payload, workspace_id: activeWorkspace.id })
    setDashboards(prev => [created, ...prev])
    return created
  }

  const updateDashboard = async (id: string, payload: Partial<Dashboard>) => {
    const updated = await dashboardsApi.update(id, payload)
    setDashboards(prev => prev.map(d => d.id === id ? updated : d))
  }

  const deleteDashboard = async (id: string) => {
    await dashboardsApi.delete(id)
    setDashboards(prev => prev.filter(d => d.id !== id))
    if (activeDashboardId === id) setActiveDashboardId(null)
  }

  const addWidget = async (payload: AddWidgetPayload) => {
    if (!activeDashboardId) throw new Error('No active dashboard')
    const newWidget = await dashboardsApi.addWidget(activeDashboardId, payload)
    setDashboards(prev => prev.map(d => {
      if (d.id === activeDashboardId) {
        return { ...d, widgets: [...d.widgets, newWidget] }
      }
      return d
    }))
  }

  const updateWidget = async (widgetId: string, payload: Partial<DashboardWidget>) => {
    if (!activeDashboardId) throw new Error('No active dashboard')
    const updated = await dashboardsApi.updateWidget(activeDashboardId, widgetId, payload)
    setDashboards(prev => prev.map(d => {
      if (d.id === activeDashboardId) {
        return { ...d, widgets: d.widgets.map(w => w.id === widgetId ? updated : w) }
      }
      return d
    }))
  }

  const removeWidget = async (widgetId: string) => {
    if (!activeDashboardId) throw new Error('No active dashboard')
    await dashboardsApi.removeWidget(activeDashboardId, widgetId)
    setDashboards(prev => prev.map(d => {
      if (d.id === activeDashboardId) {
        return { ...d, widgets: d.widgets.filter(w => w.id !== widgetId) }
      }
      return d
    }))
  }

  const activeDashboard = dashboards.find(d => d.id === activeDashboardId) || null

  return (
    <DashboardContext.Provider value={{
      dashboards, isLoading, error, activeDashboardId, activeDashboard,
      setActiveDashboardId, fetchDashboards, createDashboard, updateDashboard, deleteDashboard,
      addWidget, updateWidget, removeWidget
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboards() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboards must be used within a DashboardProvider')
  }
  return context
}
