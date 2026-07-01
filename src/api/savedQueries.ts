import { apiClient } from './client'
import { SavedQuery, SavedQueryListResponse, SavedQueryExecutionResult } from '../app/types'

export interface CreateSavedQueryPayload {
  workspace_id: string
  session_id?: string
  user_prompt: string
  generated_sql: string
  name: string
  description?: string
  tags?: string[]
  is_favorite?: boolean
  is_pinned?: boolean
}

export interface UpdateSavedQueryPayload {
  name?: string
  description?: string
  tags?: string[]
  is_favorite?: boolean
  is_pinned?: boolean
  generated_sql?: string
}

export interface ListSavedQueriesParams {
  workspace_id: string
  page?: number
  page_size?: number
  search?: string
  favorite_only?: boolean
  pinned_only?: boolean
}

export const savedQueriesApi = {
  list: async (params: ListSavedQueriesParams): Promise<SavedQueryListResponse> => {
    const { data } = await apiClient.get<SavedQueryListResponse>('/saved-queries', { params })
    return data
  },

  getById: async (id: string): Promise<SavedQuery> => {
    const { data } = await apiClient.get<SavedQuery>(`/saved-queries/${id}`)
    return data
  },

  create: async (payload: CreateSavedQueryPayload): Promise<SavedQuery> => {
    const { data } = await apiClient.post<SavedQuery>('/saved-queries', payload)
    return data
  },

  update: async (id: string, payload: UpdateSavedQueryPayload): Promise<SavedQuery> => {
    const { data } = await apiClient.patch<SavedQuery>(`/saved-queries/${id}`, payload)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/saved-queries/${id}`)
  },

  execute: async (id: string): Promise<SavedQueryExecutionResult> => {
    const { data } = await apiClient.post<SavedQueryExecutionResult>(`/saved-queries/${id}/execute`)
    return data
  },

  favorite: async (id: string, is_favorite: boolean): Promise<SavedQuery> => {
    return savedQueriesApi.update(id, { is_favorite })
  },

  pin: async (id: string, is_pinned: boolean): Promise<SavedQuery> => {
    return savedQueriesApi.update(id, { is_pinned })
  }
}
