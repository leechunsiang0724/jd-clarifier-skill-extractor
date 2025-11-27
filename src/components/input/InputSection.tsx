import { useState } from 'react'
import { Upload, Sparkles, Loader2 } from 'lucide-react'
import type { JobData } from '../../pages/JobEditor'
import { parseFile } from '../../lib/fileParser'

interface InputSectionProps {
  jobData: JobData
  setJobData: (data: JobData | ((prev: JobData) => JobData)) => void
  onAnalyze: () => void
  isAnalyzing: boolean
}

export function InputSection({ jobData, setJobData, onAnalyze, isAnalyzing }: InputSectionProps) {
  const [isParsing, setIsParsing] = useState(false)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsParsing(true)
    try {
      const text = await parseFile(file)
      setJobData((prev) => ({ ...prev, originalText: text }))
    } catch (error) {
      console.error('File parsing error:', error)
      alert('Failed to parse file. Please ensure it is a valid PDF or DOCX file.')
    } finally {
      setIsParsing(false)
      // Reset the input value so the same file can be selected again if needed
      e.target.value = ''
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-6 h-full">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Original Notes</h2>

      {/* Text Area */}
      <textarea
        value={jobData.originalText}
        onChange={(e) => setJobData((prev) => ({ ...prev, originalText: e.target.value }))}
        placeholder="Paste your rough job description notes here..."
        className="w-full h-64 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
      />

      {/* File Upload */}
      <div className="mt-4">
        <label className={`flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 hover:bg-slate-100 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer transition-all ${isParsing ? 'opacity-50 cursor-not-allowed' : ''}`}>
          {isParsing ? (
            <Loader2 className="h-5 w-5 text-slate-600 animate-spin" />
          ) : (
            <Upload className="h-5 w-5 text-slate-600" />
          )}
          <span className="text-sm font-medium text-slate-600">{isParsing ? 'Parsing file...' : 'Upload PDF/DOCX'}</span>
          <input type="file" accept=".pdf,.docx" onChange={handleFileUpload} className="hidden" disabled={isParsing} />
        </label>
      </div>

      {/* Configuration */}
      <div className="mt-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Tone</label>
          <select
            value={jobData.tone}
            onChange={(e) => setJobData((prev) => ({ ...prev, tone: e.target.value as JobData['tone'] }))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="corporate">Corporate</option>
            <option value="startup">Startup/Casual</option>
            <option value="academic">Academic</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Length</label>
          <select
            value={jobData.length}
            onChange={(e) => setJobData((prev) => ({ ...prev, length: e.target.value as JobData['length'] }))}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          >
            <option value="concise">Concise</option>
            <option value="detailed">Detailed</option>
          </select>
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={onAnalyze}
        disabled={!jobData.originalText || isAnalyzing}
        className="w-full mt-6 bg-primary text-primary-foreground py-3 rounded-lg font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {isAnalyzing ? (
          <>
            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Analyze & Refine
          </>
        )}
      </button>
    </div>
  )
}
