import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, FileText, Download, Table, Image, Loader2, CheckCircle2, AlertCircle } from 'lucide-react'
import html2canvas from 'html2canvas'

import { reportsApi, ExportRequestPayload } from '../../api/reports'
import { Button } from './Button'
import type { Report } from '../../app/types'

interface ExportModalProps {
  isOpen: boolean
  onClose: () => void
  payload: Omit<ExportRequestPayload, 'format' | 'chart_image_base64'>
  chartElementId?: string
}

export function ExportModal({ isOpen, onClose, payload, chartElementId }: ExportModalProps) {
  const [format, setFormat] = useState<'pdf' | 'excel' | 'csv' | 'png'>('excel')
  const [status, setStatus] = useState<'idle' | 'generating' | 'polling' | 'success' | 'error'>('idle')
  const [report, setReport] = useState<Report | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    if (isOpen) {
      setStatus('idle')
      setReport(null)
      setErrorMsg('')
    }
  }, [isOpen])

  const handleExport = async () => {
    setStatus('generating')
    try {
      let base64Chart = undefined
      
      // Capture chart if PDF or PNG is selected
      if ((format === 'pdf' || format === 'png') && chartElementId) {
        const el = document.getElementById(chartElementId)
        if (el) {
          const canvas = await html2canvas(el, { scale: 2, useCORS: true, logging: false })
          base64Chart = canvas.toDataURL('image/png')
        }
      }

      const requestPayload: ExportRequestPayload = {
        ...payload,
        chart_image_base64: base64Chart
      }

      let generatedReport: Report
      if (format === 'pdf') generatedReport = await reportsApi.exportPdf(requestPayload)
      else if (format === 'excel') generatedReport = await reportsApi.exportExcel(requestPayload)
      else if (format === 'csv') generatedReport = await reportsApi.exportCsv(requestPayload)
      else generatedReport = await reportsApi.exportPng(requestPayload)

      setReport(generatedReport)
      setStatus('polling')
      pollReport(generatedReport.id)
    } catch (err: any) {
      setStatus('error')
      setErrorMsg(err.message || 'Failed to start export')
    }
  }

  const pollReport = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const rep = await reportsApi.getById(id)
        if (rep.status === 'completed') {
          clearInterval(interval)
          setReport(rep)
          setStatus('success')
        } else if (rep.status === 'failed') {
          clearInterval(interval)
          setStatus('error')
          setErrorMsg(rep.error_message || 'Report generation failed on server.')
        }
      } catch (err) {
        clearInterval(interval)
        setStatus('error')
        setErrorMsg('Lost connection to server while polling.')
      }
    }, 2000)
  }

  const handleDownload = () => {
    if (!report) return
    window.location.href = `/api/v1/reports/${report.id}/download`
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-[#0f111a] border border-white/10 rounded-xl overflow-hidden shadow-2xl"
      >
        <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
          <h3 className="font-medium flex items-center gap-2">
            <Download className="w-4 h-4 text-indigo-400" /> Export Results
          </h3>
          <button onClick={onClose} disabled={status === 'generating' || status === 'polling'} className="text-zinc-400 hover:text-white transition-colors disabled:opacity-50">
            <X className="w-4 h-4" />
          </button>
        </div>
        
        <div className="p-5">
          {status === 'idle' && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400 mb-4">Choose an export format for your query results and AI insights.</p>
              
              <div className="grid grid-cols-2 gap-3">
                <FormatOption 
                  id="excel" 
                  icon={Table} 
                  label="Excel Workbook" 
                  selected={format === 'excel'} 
                  onClick={() => setFormat('excel')} 
                />
                <FormatOption 
                  id="pdf" 
                  icon={FileText} 
                  label="PDF Report" 
                  selected={format === 'pdf'} 
                  onClick={() => setFormat('pdf')} 
                />
                <FormatOption 
                  id="csv" 
                  icon={Table} 
                  label="CSV Raw Data" 
                  selected={format === 'csv'} 
                  onClick={() => setFormat('csv')} 
                />
                <FormatOption 
                  id="png" 
                  icon={Image} 
                  label="Chart Image" 
                  selected={format === 'png'} 
                  onClick={() => setFormat('png')} 
                  disabled={!chartElementId}
                />
              </div>

              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-white/5">
                <Button variant="ghost" onClick={onClose}>Cancel</Button>
                <Button variant="primary" onClick={handleExport}>Generate Export</Button>
              </div>
            </div>
          )}

          {(status === 'generating' || status === 'polling') && (
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
              <h4 className="font-medium text-white mb-1">
                {status === 'generating' ? 'Starting Generation...' : 'Processing Export...'}
              </h4>
              <p className="text-sm text-zinc-400">
                This may take a few moments for large datasets or complex PDFs.
              </p>
            </div>
          )}

          {status === 'success' && (
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-6 h-6 text-green-500" />
              </div>
              <h4 className="font-medium text-white mb-1">Export Ready!</h4>
              <p className="text-sm text-zinc-400 mb-6">Your file has been generated successfully.</p>
              
              <div className="flex gap-3">
                <Button variant="ghost" onClick={onClose}>Close</Button>
                <Button variant="primary" onClick={handleDownload} className="bg-green-600 hover:bg-green-700">
                  Download File
                </Button>
              </div>
            </div>
          )}

          {status === 'error' && (
            <div className="py-6 flex flex-col items-center justify-center text-center">
              <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-red-500" />
              </div>
              <h4 className="font-medium text-white mb-1">Export Failed</h4>
              <p className="text-sm text-zinc-400 mb-6">{errorMsg}</p>
              
              <div className="flex gap-3">
                <Button variant="ghost" onClick={onClose}>Close</Button>
                <Button variant="primary" onClick={() => setStatus('idle')}>Try Again</Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

function FormatOption({ id, icon: Icon, label, selected, disabled, onClick }: any) {
  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`p-4 rounded-xl border flex flex-col items-center gap-3 transition-all ${
        disabled 
          ? 'opacity-50 cursor-not-allowed border-white/5 bg-white/[0.01]' 
          : selected
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-white/10 bg-[#0A0A0C] hover:border-white/20 hover:bg-white/5'
      }`}
    >
      <Icon className={`w-6 h-6 ${selected ? 'text-indigo-400' : 'text-zinc-500'}`} />
      <span className={`text-sm font-medium ${selected ? 'text-white' : 'text-zinc-400'}`}>{label}</span>
    </button>
  )
}
