import React, { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Save, Plus, X, Trash2, Layout as LayoutIcon } from 'lucide-react'
import { Responsive as ResponsiveGridLayout } from 'react-grid-layout'
// @ts-ignore
import { WidthProvider } from 'react-grid-layout'
const GridLayout = WidthProvider(ResponsiveGridLayout)
import 'react-grid-layout/css/styles.css'
import 'react-resizable/css/styles.css'

import { useDashboards } from '../DashboardContext'
import { useSavedQueries } from '../SavedQueryContext'
import { Button } from '../../design-system/components/Button'
import { WidgetRenderer } from '../../design-system/components/WidgetRenderer'
import type { DashboardWidget } from '../types'

export function DashboardEditor() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { 
    dashboards, fetchDashboards, setActiveDashboardId, 
    activeDashboard, addWidget, removeWidget, updateDashboard
  } = useDashboards()
  
  const { queries } = useSavedQueries()
  const [showAddModal, setShowAddModal] = useState(false)
  const [layoutStr, setLayoutStr] = useState<string>('[]')
  
  useEffect(() => {
    if (id) {
      if (dashboards.length === 0) {
        fetchDashboards()
      } else {
        setActiveDashboardId(id)
      }
    }
    return () => setActiveDashboardId(null)
  }, [id, dashboards.length, fetchDashboards, setActiveDashboardId])

  useEffect(() => {
    if (activeDashboard) {
      setLayoutStr(JSON.stringify(activeDashboard.layout || []))
    }
  }, [activeDashboard?.layout])

  if (!activeDashboard) {
    return <div className="p-8 text-zinc-400">Loading dashboard...</div>
  }

  const handleLayoutChange = (newLayout: any) => {
    setLayoutStr(JSON.stringify(newLayout))
    // We optionally save on layout drag/resize stop. 
    // For now we autosave on layout change directly.
    updateDashboard(activeDashboard.id, { layout: newLayout }).catch(console.error)
  }

  const handleAddWidget = async (queryId: string, type: 'chart' | 'table' | 'kpi' | 'insight', title: string) => {
    try {
      const widgetId = `temp-${Date.now()}` // Just to position it before backend returns ID
      const newLayoutItem = { i: widgetId, x: 0, y: Infinity, w: 6, h: 4 }
      
      await addWidget({
        saved_query_id: queryId,
        widget_type: type,
        title: title,
      })
      
      // Layout auto updates via activeDashboard reference.
      setShowAddModal(false)
    } catch (e) {
      console.error(e)
    }
  }

  // React-grid-layout dynamically binds widget grid props from the array `layout`
  // so we dynamically construct the layout array for grid-layout matching the widgets array
  const currentLayout = useMemo(() => {
    let parsed: any[] = []
    try { parsed = JSON.parse(layoutStr) } catch (e) {}
    
    // Ensure all widgets have a layout
    return activeDashboard.widgets.map((w, index) => {
      const existing = parsed.find((l: any) => l.i === w.id)
      if (existing) return existing
      // default position if missing
      return { i: w.id, x: (index * 6) % 12, y: Infinity, w: 6, h: typeToHeight(w.widget_type) }
    })
  }, [activeDashboard.widgets, layoutStr])

  const typeToHeight = (type: string) => {
    if (type === 'kpi') return 2
    if (type === 'insight') return 4
    return 6
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505]">
      {/* Topbar */}
      <div className="h-14 border-b border-white/5 bg-[#0A0A0C] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate('/dashboards')}
            className="p-1.5 hover:bg-white/10 rounded-lg text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-[15px] font-medium text-white">{activeDashboard.name}</h1>
          </div>
        </div>
        <Button onClick={() => setShowAddModal(true)} className="bg-indigo-500 hover:bg-indigo-600 gap-2 h-8 text-[13px]">
          <Plus className="w-3.5 h-3.5" /> Add Widget
        </Button>
      </div>

      {/* Canvas */}
      <div className="flex-1 overflow-y-auto p-6 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:24px_24px]">
        {activeDashboard.widgets.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-zinc-500">
            <LayoutIcon className="w-12 h-12 mb-4 text-zinc-700" />
            <p>This dashboard is empty.</p>
            <Button onClick={() => setShowAddModal(true)} variant="secondary" className="mt-4">
              Add your first widget
            </Button>
          </div>
        ) : (
          <GridLayout
            className="layout"
            layouts={{ lg: currentLayout }}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={40}
            onLayoutChange={handleLayoutChange}
            draggableHandle=".drag-handle"
          >
            {activeDashboard.widgets.map((widget) => (
              <div key={widget.id} className="bg-[#0f111a] border border-white/10 rounded-xl overflow-hidden shadow-xl flex flex-col group relative">
                
                {/* Widget Header - Drag Handle */}
                <div className="drag-handle h-10 border-b border-white/5 bg-white/[0.02] flex items-center justify-between px-4 cursor-grab active:cursor-grabbing absolute top-0 left-0 right-0 z-10 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-md">
                  <span className="text-[12px] font-medium text-zinc-300 truncate">{widget.title}</span>
                  <button 
                    onMouseDown={(e) => { e.stopPropagation() }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      removeWidget(widget.id)
                    }}
                    className="p-1 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Widget Body */}
                <div className="flex-1 overflow-hidden">
                  <WidgetRenderer widget={widget} />
                </div>
              </div>
            ))}
          </GridLayout>
        )}
      </div>

      {/* Add Widget Modal */}
      {showAddModal && (
        <AddWidgetModal 
          queries={queries} 
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddWidget}
        />
      )}
    </div>
  )
}

function AddWidgetModal({ queries, onClose, onAdd }: { queries: any[], onClose: () => void, onAdd: (q: string, type: any, title: string) => void }) {
  const [selectedQuery, setSelectedQuery] = useState(queries[0]?.id || '')
  const [selectedType, setSelectedType] = useState<'chart' | 'table' | 'kpi' | 'insight'>('chart')
  
  if (queries.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
        <div className="bg-[#0f111a] rounded-xl p-8 max-w-sm text-center">
          <p className="text-zinc-400 mb-4">You have no saved queries yet. Go to Analysis Sessions to save a query first.</p>
          <Button onClick={onClose}>Close</Button>
        </div>
      </div>
    )
  }

  const query = queries.find(q => q.id === selectedQuery)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[#0f111a] rounded-xl overflow-hidden w-full max-w-lg border border-white/10 shadow-2xl">
        <div className="px-5 py-4 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
          <h3 className="font-medium">Add Widget</h3>
          <button onClick={onClose}><X className="w-4 h-4 text-zinc-400" /></button>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <label className="block text-[13px] text-zinc-400 mb-2">Source Saved Query</label>
            <select 
              value={selectedQuery} 
              onChange={e => setSelectedQuery(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 rounded-lg p-2.5 text-sm outline-none"
            >
              {queries.map(q => (
                <option key={q.id} value={q.id}>{q.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[13px] text-zinc-400 mb-2">Display Type</label>
            <div className="grid grid-cols-2 gap-3">
              {(['chart', 'table', 'kpi', 'insight'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setSelectedType(type)}
                  className={`p-3 rounded-lg border text-sm capitalize transition-colors ${
                    selectedType === type 
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' 
                    : 'border-white/10 hover:border-white/20 text-zinc-400'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="p-4 border-t border-white/5 flex justify-end gap-3 bg-black/20">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={() => onAdd(selectedQuery, selectedType, query?.name || 'Widget')}>
            Add Widget
          </Button>
        </div>
      </div>
    </div>
  )
}
