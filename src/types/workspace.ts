// ─── Workspace API types ──────────────────────────────────────────────────────
// Mirrors the Pydantic WorkspaceResponse from the backend.
// src/types/workspace.ts

/** Full workspace as returned by the backend */
export interface WorkspaceDTO {
  id:          string
  name:        string
  description: string | null
  color:       string
  owner_id:    string
  created_at:  string
  updated_at:  string
}

/** POST /workspaces body */
export interface WorkspaceCreatePayload {
  name:        string
  description?: string | null
  color:       string
}

/** PATCH /workspaces/:id body — all fields optional */
export interface WorkspaceUpdatePayload {
  name?:        string
  description?: string | null
  color?:       string
}
