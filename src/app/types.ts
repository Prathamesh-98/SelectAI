// ─── Primitive types ──────────────────────────────────────────────────────────

export type DatasetStatus = 'ready' | 'processing' | 'error' | 'idle'

export interface Dataset {
  id:         string
  name:       string
  rows:       number
  columns:    string[]
  size:       string
  uploadedAt: string
  status:     DatasetStatus
}

export interface AIMessage {
  id:      string
  role:    'user' | 'ai'
  has_sql: boolean
  content: string
  generated_sql?: string
  validation_error?: string
  execution_result?: any
  execution_time_ms?: number
  chart_data?: any
  insight_data?: {
    summary: string
    key_findings: string[]
    recommendations: string[]
    limitations: string[]
  }
}

// ─── Analysis Session ─────────────────────────────────────────────────────────

export interface SessionQuery {
  id:    string
  title: string
  sql:   string
  ranAt: string
}

export interface SessionChart {
  id:    string
  title: string
  type:  'bar' | 'line'
  data:  BarDataPoint[]
}

export interface AnalysisSession {
  id:           string
  name:         string
  description?: string
  datasetIds:   string[]
  messages:     AIMessage[]
  queries:      SessionQuery[]
  charts:       SessionChart[]
  insights:     string[]
  createdAt:    string
  updatedAt:    string
}

// ─── Workspace-level library ──────────────────────────────────────────────────

export interface SavedQuery {
  id: string
  workspace_id: string
  session_id?: string
  created_by?: string
  created_by_name?: string
  
  name: string
  description?: string
  user_prompt: string
  generated_sql: string
  sql_hash: string
  
  tags: string[]
  is_favorite: boolean
  is_pinned: boolean
  
  version: number
  execution_count: number
  last_executed?: string
  
  created_at: string
  updated_at: string
}

export interface SavedQueryRun {
  id: string
  saved_query_id: string
  execution_time_ms?: number
  row_count?: number
  status: 'success' | 'failed'
  error_message?: string
  executed_at: string
}

export interface SavedQueryListResponse {
  data: SavedQuery[]
  total: number
  page: number
  page_size: number
}

export interface SavedQueryExecutionResult {
  execution_result: any
  execution_time_ms?: number
  chart_data: any
  insight_data: any
  error?: string
}

export interface BarDataPoint {
  label:  string
  value:  number
  color?: string
}

export interface SavedChart {
  id:          string
  title:       string
  description?: string
  type:        'bar' | 'line'
  data:        BarDataPoint[]
  datasetName: string
  createdAt:   string
  sessionId?:  string
}

export type HistoryType = 'upload' | 'query' | 'chart' | 'session'

export interface HistoryEntry {
  id:          string
  type:        HistoryType
  description: string
  detail?:     string
  createdAt:   string
  status:      'success' | 'error'
}

// ─── Workspace ────────────────────────────────────────────────────────────────

export interface Workspace {
  id:           string
  name:         string
  description?: string
  color:        string
  datasets:     Dataset[]
  savedQueries: SavedQuery[]
  savedCharts:  SavedChart[]
  history:      HistoryEntry[]
  createdAt:    string
}

export interface DashboardWidget {
  id: string
  dashboard_id: string
  widget_type: 'chart' | 'table' | 'kpi' | 'insight'
  title: string
  saved_query_id: string
  layout: any
  settings: any
  created_at: string
}

export interface Dashboard {
  id: string
  workspace_id: string
  name: string
  description?: string
  layout: any[]
  widgets: DashboardWidget[]
  created_at: string
  updated_at: string
}

export interface Report {
  id: string
  workspace_id: string
  saved_query_id?: string
  created_by?: string
  format: 'pdf' | 'excel' | 'csv' | 'png'
  file_name: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  error_message?: string
  download_count: number
  metadata_info: any
  created_at: string
  expires_at?: string
}
