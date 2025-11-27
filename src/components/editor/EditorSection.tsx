import { useState } from 'react'
import { Copy, Check } from 'lucide-react'
import type { JobData } from '../../pages/JobEditor'

interface EditorSectionProps {
  jobData: JobData
  setJobData: (data: JobData | ((prev: JobData) => JobData)) => void
}

export function EditorSection({ jobData, setJobData }: EditorSectionProps) {
  const [copied, setCopied] = useState(false)
  const [showComparison, setShowComparison] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(jobData.refinedText)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-6 h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-slate-800">Refined JD</h2>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input
              type="checkbox"
              checked={showComparison}
              onChange={(e) => setShowComparison(e.target.checked)}
              className="rounded border-slate-300 text-primary focus:ring-primary"
            />
            Show Comparison
          </label>
          <button
            onClick={handleCopy}
            disabled={!jobData.refinedText}
            className="flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {showComparison ? (
        <div className="grid grid-cols-2 gap-4">
          {/* Before */}
          <div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">Before</h3>
            <div className="h-96 p-4 bg-slate-50 border border-slate-200 rounded-lg overflow-y-auto text-sm text-slate-700 whitespace-pre-wrap">
              {jobData.originalText || 'No original text...'}
            </div>
          </div>

          {/* After */}
          <div>
            <h3 className="text-sm font-medium text-slate-600 mb-2">After</h3>
            <div className="h-96 p-4 bg-slate-50 border border-slate-200 rounded-lg overflow-y-auto text-sm text-slate-700 whitespace-pre-wrap">
              {jobData.refinedText || 'Refined text will appear here...'}
            </div>
          </div>
        </div>
      ) : (
        <textarea
          value={jobData.refinedText}
          onChange={(e) => setJobData((prev) => ({ ...prev, refinedText: e.target.value }))}
          placeholder="Your refined job description will appear here after analysis..."
          className="w-full h-96 p-4 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none transition-all"
        />
      )}
    </div>
  )
}
