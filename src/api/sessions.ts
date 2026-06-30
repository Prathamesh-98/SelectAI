// ─── Sessions API calls ───────────────────────────────────────────────────────
// src/api/sessions.ts

import { apiClient } from './client'

export interface AnalysisSessionDTO {
  id: string
  workspace_id: string
  created_by: string
  name: string
  description?: string | null
  goal?: string | null
  status: 'active' | 'archived'
  dataset_ids: string[]
  created_at: string
  updated_at: string
}

export interface CreateSessionPayload {
  workspace_id: string
  name: string
  description?: string
  goal?: string
  dataset_ids?: string[]
}

export interface UpdateSessionPayload {
  name?: string
  description?: string | null
  goal?: string | null
  status?: 'active' | 'archived'
}

interface APIResponse<T> {
  success: boolean
  message: string | null
  data: T
}

export const sessionsApi = {
  list(workspaceId: string): Promise<AnalysisSessionDTO[]> {
    return apiClient
      .get<APIResponse<AnalysisSessionDTO[]>>('/sessions', {
        params: { workspace_id: workspaceId },
      })
      .then((r) => r.data.data)
  },

  getById(id: string, workspaceId: string): Promise<AnalysisSessionDTO> {
    return apiClient
      .get<APIResponse<AnalysisSessionDTO>>(`/sessions/${id}`, {
        params: { workspace_id: workspaceId },
      })
      .then((r) => r.data.data)
  },

  create(payload: CreateSessionPayload): Promise<AnalysisSessionDTO> {
    return apiClient
      .post<APIResponse<AnalysisSessionDTO>>('/sessions', payload)
      .then((r) => r.data.data)
  },

  update(id: string, workspaceId: string, payload: UpdateSessionPayload): Promise<AnalysisSessionDTO> {
    return apiClient
      .patch<APIResponse<AnalysisSessionDTO>>(`/sessions/${id}`, payload, {
        params: { workspace_id: workspaceId },
      })
      .then((r) => r.data.data)
  },

  delete(id: string, workspaceId: string): Promise<void> {
    return apiClient
      .delete<APIResponse<any>>(`/sessions/${id}`, {
        params: { workspace_id: workspaceId },
      })
      .then(() => undefined)
  },
}
