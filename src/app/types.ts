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
  id:          string
  title:       string
  sql:         string
  datasetName: string
  createdAt:   string
  runCount:    number
  sessionId?:  string   // which session it was saved from
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
