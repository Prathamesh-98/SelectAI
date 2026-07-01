import { apiClient } from './client'
import type { Dashboard, DashboardWidget } from '../app/types'

export interface CreateDashboardPayload {
  workspace_id: string
  name: string
  description?: string
}

export interface AddWidgetPayload {
  widget_type: 'chart' | 'table' | 'kpi' | 'insight'
  title: string
  saved_query_id: string
  layout?: any
  settings?: any
}

export const dashboardsApi = {
  list: async (workspaceId: string, page = 1, pageSize = 50, search?: string) => {
    const params = new URLSearchParams({ 
      workspace_id: workspaceId, 
      page: page.toString(), 
      page_size: pageSize.toString() 
    })
    if (search) params.append('search', search)
    const { data } = await apiClient.get(`/dashboards?${params.toString()}`)
    return data
  },
  
  getById: async (id: string) => {
    const { data } = await apiClient.get<Dashboard>(`/dashboards/${id}`)
    return data
  },
  
  create: async (payload: CreateDashboardPayload) => {
    const { data } = await apiClient.post<Dashboard>('/dashboards', payload)
    return data
  },
  
  update: async (id: string, payload: Partial<Dashboard>) => {
    const { data } = await apiClient.patch<Dashboard>(`/dashboards/${id}`, payload)
    return data
  },
  
  delete: async (id: string) => {
    await apiClient.delete(`/dashboards/${id}`)
  },
  
  addWidget: async (dashboardId: string, payload: AddWidgetPayload) => {
    const { data } = await apiClient.post<DashboardWidget>(`/dashboards/${dashboardId}/widgets`, payload)
    return data
  },
  
  updateWidget: async (dashboardId: string, widgetId: string, payload: Partial<DashboardWidget>) => {
    const { data } = await apiClient.patch<DashboardWidget>(`/dashboards/${dashboardId}/widgets/${widgetId}`, payload)
    return data
  },
  
  removeWidget: async (dashboardId: string, widgetId: string) => {
    await apiClient.delete(`/dashboards/${dashboardId}/widgets/${widgetId}`)
  }
}
