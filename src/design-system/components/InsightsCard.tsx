import React from 'react'
import { Sparkles, TrendingUp, Lightbulb, AlertTriangle } from 'lucide-react'

export interface InsightData {
  summary: string
  key_findings: string[]
  recommendations: string[]
  limitations: string[]
}

interface InsightsCardProps {
  data: InsightData
}

export function InsightsCard({ data }: InsightsCardProps) {
  if (!data || (!data.summary && data.key_findings.length === 0)) return null

  return (
    <div className="w-full mt-3 bg-gradient-to-br from-[#0f111a] to-[#0A0A0C] border border-indigo-500/20 rounded-xl overflow-hidden shadow-lg shadow-indigo-500/5">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-white/5 bg-indigo-500/5">
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span className="text-[13px] font-bold text-indigo-100 tracking-wide">AI Insights</span>
      </div>
      
      <div className="p-5 space-y-6">
        {data.summary && data.summary !== "Insights unavailable." && (
          <div>
            <p className="text-[13px] leading-relaxed text-zinc-300">
              {data.summary}
            </p>
          </div>
        )}

        {data.key_findings && data.key_findings.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Key Findings</h4>
            </div>
            <ul className="space-y-1.5 ml-1">
              {data.key_findings.map((finding, i) => (
                <li key={i} className="text-[12.5px] text-zinc-300 flex items-start gap-2">
                  <span className="text-emerald-500/50 mt-0.5">•</span>
                  <span>{finding}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.recommendations && data.recommendations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Recommendations</h4>
            </div>
            <ul className="space-y-1.5 ml-1">
              {data.recommendations.map((rec, i) => (
                <li key={i} className="text-[12.5px] text-zinc-300 flex items-start gap-2">
                  <span className="text-amber-500/50 mt-0.5">•</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {data.limitations && data.limitations.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
              <h4 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Limitations</h4>
            </div>
            <ul className="space-y-1.5 ml-1">
              {data.limitations.map((lim, i) => (
                <li key={i} className="text-[12.5px] text-zinc-400/80 flex items-start gap-2">
                  <span className="text-rose-500/40 mt-0.5">•</span>
                  <span className="italic">{lim}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
