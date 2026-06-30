// ─── Workspace API calls ──────────────────────────────────────────────────────
// Thin wrappers over apiClient for every /workspaces endpoint.
// WorkspaceContext is the only caller — pages never import this directly.
// src/api/workspaces.ts

import { apiClient } from './client'
import type {
  WorkspaceCreatePayload,
  WorkspaceDTO,
  WorkspaceUpdatePayload,
} from '../types/workspace'

export const workspacesApi = {

  /**
   * GET /workspaces
   * Returns all workspaces owned by the authenticated user.
   */
  list(): Promise<WorkspaceDTO[]> {
    return apiClient
      .get<WorkspaceDTO[]>('/workspaces')
      .then((r) => r.data)
  },

  /**
   * POST /workspaces
   * Create a new workspace. Returns the created WorkspaceDTO.
   */
  create(payload: WorkspaceCreatePayload): Promise<WorkspaceDTO> {
    return apiClient
      .post<WorkspaceDTO>('/workspaces', payload)
      .then((r) => r.data)
  },

  /**
   * GET /workspaces/:id
   * Fetch a single workspace by id.
   */
  getById(id: string): Promise<WorkspaceDTO> {
    return apiClient
      .get<WorkspaceDTO>(`/workspaces/${id}`)
      .then((r) => r.data)
  },

  /**
   * PATCH /workspaces/:id
   * Partially update a workspace. Only provided fields are changed.
   */
  update(id: string, payload: WorkspaceUpdatePayload): Promise<WorkspaceDTO> {
    return apiClient
      .patch<WorkspaceDTO>(`/workspaces/${id}`, payload)
      .then((r) => r.data)
  },

  /**
   * DELETE /workspaces/:id
   * Soft-deletes a workspace. Returns 204 No Content.
   */
  softDelete(id: string): Promise<void> {
    return apiClient
      .delete(`/workspaces/${id}`)
      .then(() => undefined)
  },
}
