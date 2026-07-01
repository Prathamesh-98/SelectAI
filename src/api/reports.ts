import { apiClient } from './client'
import type { Report } from '../app/types'

export interface ExportRequestPayload {
  workspace_id: string
  saved_query_id?: string
  execution_result?: any[]
  insight_data?: any
  chart_image_base64?: string
  
  // Metadata
  execution_time_ms?: number
  row_count?: number
  chart_type?: string
  workspace_name?: string
  saved_query_name?: string
  user_question?: string
  generated_sql?: string
}

export const reportsApi = {
  exportPdf: async (payload: ExportRequestPayload) => {
    const { data } = await apiClient.post<Report>('/exports/pdf', payload)
    return data
  },

  exportExcel: async (payload: ExportRequestPayload) => {
    const { data } = await apiClient.post<Report>('/exports/excel', payload)
    return data
  },

  exportCsv: async (payload: ExportRequestPayload) => {
    const { data } = await apiClient.post<Report>('/exports/csv', payload)
    return data
  },

  exportPng: async (payload: ExportRequestPayload) => {
    const { data } = await apiClient.post<Report>('/exports/png', payload)
    return data
  },

  list: async (workspaceId: string, page = 1, pageSize = 50, status?: string) => {
    const params = new URLSearchParams({ 
      workspace_id: workspaceId, 
      page: page.toString(), 
      page_size: pageSize.toString() 
    })
    if (status) params.append('status', status)
    
    const { data } = await apiClient.get(`/reports?${params.toString()}`)
    return data
  },

  getById: async (id: string) => {
    const { data } = await apiClient.get<Report>(`/reports/${id}`)
    return data
  },

  delete: async (id: string) => {
    await apiClient.delete(`/reports/${id}`)
  }
}
