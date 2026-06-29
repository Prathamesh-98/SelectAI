import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Copy, Check } from 'lucide-react'

// ─── SQLCodeBlock ─────────────────────────────────────────────────────────────
export interface SQLCodeBlockProps {
  code:        string
  title?:      string
  onCopy?:     () => void
  showLineNums?: boolean
  maxHeight?:  number
  className?:  string
}

// Minimal SQL syntax token types
const TOKEN_PATTERNS: Array<{ type: string; regex: RegExp; className: string }> = [
  { type: 'keyword',  regex: /\b(SELECT|FROM|WHERE|AND|OR|NOT|GROUP\s+BY|ORDER\s+BY|HAVING|LIMIT|OFFSET|JOIN|LEFT|RIGHT|INNER|OUTER|CROSS|ON|AS|DISTINCT|UNION|ALL|INSERT|UPDATE|DELETE|CREATE|DROP|ALTER|TABLE|INDEX|VIEW|WITH|CASE|WHEN|THEN|ELSE|END|IN|IS|NULL|LIKE|BETWEEN|EXISTS|COUNT|SUM|AVG|MIN|MAX|COALESCE|DATE_TRUNC|YEAR|MONTH|DAY|CAST|CONCAT)\b/gi, className: 'text-secondary' },
  { type: 'string',   regex: /'[^']*'/g,                      className: 'text-green-300' },
  { type: 'number',   regex: /\b\d+(\.\d+)?\b/g,             className: 'text-amber-300' },
  { type: 'operator', regex: /[=<>!*+\-/%]+|,|;/g,            className: 'text-zinc-500'  },
  { type: 'ident',    regex: /\b([a-z_][a-z0-9_]*)\b/gi,     className: 'text-accent'    },
]

function tokenizeSQL(code: string): Array<{ text: string; className: string }> {
  // Simple line-by-line tokenizer
  const lines = code.split('\n')
  const result: Array<{ text: string; className: string }> = []

  for (let li = 0; li < lines.length; li++) {
    if (li > 0) result.push({ text: '\n', className: '' })
    const line = lines[li]
    let pos = 0

    // Gather all matches
    const matches: Array<{ start: number; end: number; className: string; text: string }> = []

    for (const pat of TOKEN_PATTERNS) {
      pat.regex.lastIndex = 0
      let m: RegExpExecArray | null
      while ((m = pat.regex.exec(line)) !== null) {
        matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], className: pat.className })
      }
    }

    // Sort by position, remove overlaps
    matches.sort((a, b) => a.start - b.start)
    const used: typeof matches = []
    for (const m of matches) {
      if (used.length === 0 || m.start >= used[used.length - 1].end) used.push(m)
    }

    // Build token array
    for (const m of used) {
      if (pos < m.start) result.push({ text: line.slice(pos, m.start), className: 'text-zinc-400' })
      result.push({ text: m.text, className: m.className })
      pos = m.end
    }
    if (pos < line.length) result.push({ text: line.slice(pos), className: 'text-zinc-400' })
  }

  return result
}

export function SQLCodeBlock({
  code,
  title      = 'SQL',
  onCopy,
  showLineNums = true,
  maxHeight  = 320,
  className  = '',
}: SQLCodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const tokens = tokenizeSQL(code)
  const lines  = code.split('\n')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      onCopy?.()
      setTimeout(() => setCopied(false), 2000)
    } catch { /* ignore */ }
  }

  return (
    <div className={`rounded-xl overflow-hidden border border-white/[0.07] bg-[#0D0D12] ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/6 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
            <div className="w-2.5 h-2.5 rounded-full bg-white/10" />
          </div>
          <span className="text-[11px] font-medium text-zinc-600 ml-1">{title}</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy SQL"
          className={[
            'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium',
            'transition-all duration-200',
            copied
              ? 'text-green-400 bg-green-500/10 border border-green-500/20'
              : 'text-zinc-500 bg-white/4 border border-white/8 hover:text-zinc-300 hover:bg-white/8',
          ].join(' ')}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>

      {/* Code area */}
      <div
        className="overflow-auto"
        style={{ maxHeight }}
      >
        <div className="flex">
          {/* Line numbers */}
          {showLineNums && (
            <div className="flex-shrink-0 select-none px-4 py-4 text-right border-r border-white/5 bg-white/[0.01]">
              {lines.map((_, i) => (
                <div key={i} className="text-[12px] font-mono leading-[1.8] text-zinc-700">
                  {i + 1}
                </div>
              ))}
            </div>
          )}

          {/* Code */}
          <pre className="flex-1 px-4 py-4 text-[12px] font-mono leading-[1.8] overflow-x-auto">
            {tokens.map((tok, i) => (
              tok.text === '\n'
                ? <br key={i} />
                : <span key={i} className={tok.className}>{tok.text}</span>
            ))}
          </pre>
        </div>
      </div>
    </div>
  )
}
