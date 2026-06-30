// ─── Dataset API calls ────────────────────────────────────────────────────────
// Thin wrappers over apiClient for each /datasets endpoint.
// src/api/datasets.ts

import { apiClient } from './client'
import type { DatasetDTO } from '../types/dataset'

interface APIResponse<T> {
  success: boolean
  message: string | null
  data:    T
}

export const datasetsApi = {
  /**
   * GET /datasets?workspace_id=...
   * Returns all datasets in a workspace.
   */
  list(workspaceId: string): Promise<DatasetDTO[]> {
    return apiClient
      .get<APIResponse<DatasetDTO[]>>('/datasets', {
        params: { workspace_id: workspaceId },
      })
      .then((r) => r.data.data)
  },

  /**
   * POST /datasets
   * Uploads a CSV file using multipart/form-data.
   */
  upload(
    file: File,
    workspaceId: string,
    onUploadProgress?: (progress: number) => void
  ): Promise<DatasetDTO> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('workspace_id', workspaceId)

    return apiClient
      .post<APIResponse<DatasetDTO>>('/datasets', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (progressEvent) => {
          if (onUploadProgress && progressEvent.total) {
            const pct = Math.round((progressEvent.loaded * 100) / progressEvent.total)
            onUploadProgress(pct)
          }
        },
      })
      .then((r) => r.data.data)
  },

  /**
   * GET /datasets/:id?workspace_id=...
   * Fetches metadata of a single dataset.
   */
  getById(id: string, workspaceId: string): Promise<DatasetDTO> {
    return apiClient
      .get<APIResponse<DatasetDTO>>(`/datasets/${id}`, {
        params: { workspace_id: workspaceId },
      })
      .then((r) => r.data.data)
  },

  /**
   * DELETE /datasets/:id?workspace_id=...
   * Deletes a dataset.
   */
  delete(id: string, workspaceId: string): Promise<void> {
    return apiClient
      .delete<APIResponse<any>>(`/datasets/${id}`, {
        params: { workspace_id: workspaceId },
      })
      .then(() => undefined)
  },
}
