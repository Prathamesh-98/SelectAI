import React from 'react'
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, ScatterChart, Scatter,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'

interface ChartDataset {
  label: string
  data: number[]
}

export interface ChartDataPayload {
  chart_type: 'bar' | 'line' | 'pie' | 'scatter' | 'kpi' | 'none'
  title?: string
  x_axis?: string
  y_axis?: string
  confidence?: number
  reason?: string
  labels?: string[]
  datasets?: ChartDataset[]
}

interface QueryChartProps {
  data: ChartDataPayload
}

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1', '#14B8A6']

export function QueryChart({ data }: QueryChartProps) {
  if (!data || data.chart_type === 'none') return null

  const { chart_type, title, x_axis, y_axis, labels = [], datasets = [] } = data

  if (chart_type === 'kpi') {
    const value = datasets[0]?.data[0]
    return (
      <div className="w-full mt-3 bg-[#0A0A0C] border border-white/10 rounded-xl p-5 flex flex-col items-center justify-center">
        <span className="text-[12px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">{title || y_axis}</span>
        <span className="text-4xl font-bold text-white tracking-tight">
          {typeof value === 'number' ? value.toLocaleString() : value ?? '-'}
        </span>
      </div>
    )
  }

  // Transform data into Recharts format
  // Recharts expects an array of objects: [{ name: 'A', value: 400 }, { name: 'B', value: 300 }]
  const chartData = labels.map((label, idx) => {
    const row: any = { name: label }
    datasets.forEach(ds => {
      row[ds.label] = ds.data[idx]
    })
    return row
  })

  const renderChart = () => {
    switch (chart_type) {
      case 'bar':
        return (
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="name" stroke="#ffffff50" fontSize={11} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="#ffffff50" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181B', borderColor: '#ffffff10', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#E4E4E7' }}
              cursor={{ fill: '#ffffff05' }}
            />
            {datasets.map((ds, i) => (
              <Bar key={ds.label} dataKey={ds.label} fill={COLORS[i % COLORS.length]} radius={[4, 4, 0, 0]} maxBarSize={50} />
            ))}
          </BarChart>
        )
      case 'line':
        return (
          <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
            <XAxis dataKey="name" stroke="#ffffff50" fontSize={11} tickLine={false} axisLine={false} dy={10} />
            <YAxis stroke="#ffffff50" fontSize={11} tickLine={false} axisLine={false} dx={-10} />
            <Tooltip
              contentStyle={{ backgroundColor: '#18181B', borderColor: '#ffffff10', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#E4E4E7' }}
            />
            {datasets.map((ds, i) => (
              <Line key={ds.label} type="monotone" dataKey={ds.label} stroke={COLORS[i % COLORS.length]} strokeWidth={2} dot={{ r: 3, fill: COLORS[i % COLORS.length], strokeWidth: 0 }} activeDot={{ r: 5 }} />
            ))}
          </LineChart>
        )
      case 'pie':
        // PieChart uses a single dataset, usually
        const pieData = chartData.map(d => ({ name: d.name, value: d[datasets[0]?.label] }))
        return (
          <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
            <Tooltip
              contentStyle={{ backgroundColor: '#18181B', borderColor: '#ffffff10', borderRadius: '8px', fontSize: '12px' }}
              itemStyle={{ color: '#E4E4E7' }}
            />
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={2}>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
              ))}
            </Pie>
            <Legend wrapperStyle={{ fontSize: '11px', color: '#ffffff80' }} />
          </PieChart>
        )
      case 'scatter':
        // Recharts Scatter expects a slightly different format if using multiple axes, 
        // but since we mapped everything to name and value, we can just use scatter.
        // Actually, scatter is best when we have two numeric values. We assume name is X, value is Y.
        // But our chartData format has X in `name` (which might be string). Recharts Scatter requires numeric X.
        // Let's adapt it to use `name` as X if it's numeric.
        const scatterData = chartData.map(d => ({ x: Number(d.name), y: d[datasets[0]?.label], name: d.name }))
        return (
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis dataKey="x" type="number" stroke="#ffffff50" fontSize={11} tickLine={false} axisLine={false} name={x_axis} />
            <YAxis dataKey="y" type="number" stroke="#ffffff50" fontSize={11} tickLine={false} axisLine={false} name={y_axis} />
            <Tooltip
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#18181B', borderColor: '#ffffff10', borderRadius: '8px', fontSize: '12px' }}
            />
            <Scatter name={title} data={scatterData} fill={COLORS[0]} />
          </ScatterChart>
        )
      default:
        return null
    }
  }

  return (
    <div className="w-full mt-3 bg-[#0A0A0C] border border-white/10 rounded-xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-white/5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-white">{title}</span>
          {data.confidence && (
            <span className="text-[9px] font-bold text-secondary bg-secondary/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
              {Math.round(data.confidence * 100)}% Match
            </span>
          )}
        </div>
        <span className="text-[10px] text-zinc-500 uppercase font-semibold tracking-wider">{chart_type} Chart</span>
      </div>
      <div className="w-full h-[280px] p-2">
        <ResponsiveContainer width="100%" height="100%">
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  )
}
