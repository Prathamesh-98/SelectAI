// ─── Dataset API types ────────────────────────────────────────────────────────
// Mirrors the Pydantic DatasetResponse from the backend.
// src/types/dataset.ts

export type DatasetStatusDTO = 'pending' | 'processing' | 'ready' | 'error'

export interface DatasetDTO {
  id:               string
  workspace_id:      string
  uploaded_by:       string
  name:             string
  storage_key:       string
  file_size_bytes:   number
  row_count:        number | null
  column_count:     number | null
  columns_metadata: any | null
  status:           DatasetStatusDTO
  error_message:    string | null
  created_at:       string
  updated_at:       string
}
