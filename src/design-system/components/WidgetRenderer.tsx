import React, { useEffect, useState } from 'react'
import { savedQueriesApi } from '../../api/savedQueries'
import type { DashboardWidget, SavedQueryExecutionResult } from '../../app/types'
import { ResultTable } from '../../app/pages/SessionDetailPage'
import { QueryChart } from './QueryChart'
import { InsightsCard } from './InsightsCard'
import { ExportModal } from './ExportModal'
import { Download } from 'lucide-react'
import { useWorkspace } from '../../app/WorkspaceContext'

export function WidgetRenderer({ widget }: { widget: DashboardWidget }) {
  const { activeWorkspace } = useWorkspace()
  const [data, setData] = useState<SavedQueryExecutionResult | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [exportOpen, setExportOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    const fetchWidgetData = async () => {
      try {
        setLoading(true)
        const result = await savedQueriesApi.execute(widget.saved_query_id)
        if (mounted) setData(result)
      } catch (err: any) {
        if (mounted) setError(err.message || 'Failed to load widget data')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchWidgetData()
    return () => { mounted = false }
  }, [widget.saved_query_id])

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="text-[12px] text-zinc-500">Loading {widget.title}...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center p-4 text-center">
        <p className="text-[12px] text-red-400">{error}</p>
      </div>
    )
  }

  if (!data) return null

  // Error inside execution result payload
  if (data.error) {
    return (
      <div className="w-full h-full p-4 overflow-y-auto">
        <p className="text-[12px] text-red-400 whitespace-pre-wrap">{data.error}</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full p-4 overflow-hidden relative">
      <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-4 pt-12">
        {widget.widget_type === 'table' && data.execution_result && (
          <ResultTable result={data.execution_result} />
        )}
        
        {widget.widget_type === 'chart' && data.chart_data && data.chart_data.chart_type !== 'none' && (
          <div className="h-full min-h-[200px]">
            <QueryChart data={data.chart_data} />
          </div>
        )}
        
        {widget.widget_type === 'insight' && data.insight_data && (
          <div className="-mt-3">
            <InsightsCard data={data.insight_data} />
          </div>
        )}
        
        {widget.widget_type === 'kpi' && data.execution_result && (
          <div className="h-full flex flex-col items-center justify-center">
            <span className="text-[11px] text-zinc-400 uppercase tracking-wider mb-2">{widget.title}</span>
            <span className="text-4xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-br from-white to-zinc-400">
              {data.execution_result.rows && data.execution_result.rows.length > 0 
                ? Object.values(data.execution_result.rows[0])[0]?.toString() || '0'
                : '0'}
            </span>
          </div>
        )}

        <button 
          onClick={() => setExportOpen(true)}
          className="absolute bottom-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-medium text-zinc-500 hover:text-white bg-black/40 hover:bg-black/60 transition-colors z-10"
        >
          <Download className="w-3 h-3" /> Export
        </button>

        <ExportModal
          isOpen={exportOpen}
          onClose={() => setExportOpen(false)}
          payload={{
            workspace_id: activeWorkspace.id,
            saved_query_id: widget.saved_query_id,
            execution_result: data?.execution_result?.rows || [],
            insight_data: data?.insight_data,
            execution_time_ms: data?.execution_result?.execution_time_ms,
            row_count: data?.execution_result?.rows?.length || 0,
            workspace_name: activeWorkspace.name,
            saved_query_name: widget.title
          }}
        />
      </div>
    </div>
  )
}
