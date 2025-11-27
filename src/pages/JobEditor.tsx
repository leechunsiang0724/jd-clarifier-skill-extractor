import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { InputSection } from '../components/input/InputSection'
import { EditorSection } from '../components/editor/EditorSection'
import { SkillsSidebar } from '../components/skills/SkillsSidebar'
import { refineJobDescription } from '../lib/aiService'
import { createJob, updateJob, getJobById } from '../lib/jobService'
import { generateJobDescriptionPDF } from '../lib/pdfService'
import { AlertCircle, Save, FileDown } from 'lucide-react'

export interface JobData {
  originalText: string
  refinedText: string
  skills: {
    mustHave: string[]
    niceToHave: string[]
  }
  tone: 'corporate' | 'startup' | 'academic'
  length: 'concise' | 'detailed'
}

export function JobEditor() {
  const { jobId } = useParams<{ jobId?: string }>()
  const navigate = useNavigate()

  const [currentJobId, setCurrentJobId] = useState<string | undefined>(jobId)
  const [title, setTitle] = useState('')
  const [jobData, setJobData] = useState<JobData>({
    originalText: '',
    refinedText: '',
    skills: {
      mustHave: [],
      niceToHave: [],
    },
    tone: 'corporate',
    length: 'concise',
  })

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const [successMessage, setSuccessMessage] = useState('')

  // Load existing job if jobId is provided
  useEffect(() => {
    if (jobId) {
      loadJob(jobId)
    }
  }, [jobId])

  const loadJob = async (id: string) => {
    try {
      const job = await getJobById(id)
      if (job) {
        setCurrentJobId(job.id)
        setTitle(job.title || '')
        setJobData({
          originalText: job.original_text,
          refinedText: job.refined_text || '',
          skills: {
            mustHave: job.skills_must_have || [],
            niceToHave: job.skills_nice_to_have || [],
          },
          tone: (job.tone as any) || 'corporate',
          length: (job.length as any) || 'concise',
        })
      }
    } catch (error) {
      console.error('Failed to load job:', error)
      setError('Failed to load job description')
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    setSuccessMessage('')

    try {
      const jobPayload = {
        title: title || 'Untitled Job Description',
        original_text: jobData.originalText,
        refined_text: jobData.refinedText,
        skills_must_have: jobData.skills.mustHave,
        skills_nice_to_have: jobData.skills.niceToHave,
        tone: jobData.tone,
        length: jobData.length,
      }

      if (currentJobId) {
        // Update existing job
        await updateJob(currentJobId, jobPayload)
        setSuccessMessage('Job description updated successfully!')
      } else {
        // Create new job
        const newJob = await createJob(jobPayload)
        setCurrentJobId(newJob.id)
        navigate(`/jobs/${newJob.id}`, { replace: true })
        setSuccessMessage('Job description saved successfully!')
      }

      setTimeout(() => setSuccessMessage(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save job description')
    } finally {
      setIsSaving(false)
    }
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    setError('')

    try {
      const result = await refineJobDescription(jobData.originalText, {
        tone: jobData.tone,
        length: jobData.length,
      })

      setJobData((prev) => ({
        ...prev,
        refinedText: result.refinedText,
        skills: result.skills,
      }))
    } catch (err: any) {
      setError(err.message || 'Failed to analyze job description. Please try again.')
      console.error('Analysis error:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleDownloadPDF = () => {
    generateJobDescriptionPDF(
      title || 'Untitled Job Description',
      jobData.refinedText,
      jobData.skills
    )
  }

  return (
    <>
      {/* Success Message */}
      {successMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
          <Save className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-green-800">Success</h3>
            <p className="text-sm text-green-600 mt-1">{successMessage}</p>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="text-sm font-semibold text-red-800">Error</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
      )}

      {/* Title and Actions */}
      <div className="mb-6 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-slate-200 p-4">
        <div className="flex items-center gap-4">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Job Title (e.g., Senior Full Stack Developer)"
            className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <button
            onClick={handleDownloadPDF}
            disabled={!jobData.refinedText}
            className="p-2 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download PDF"
          >
            <FileDown className="h-5 w-5" />
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !jobData.originalText}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            {isSaving ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Input */}
        <div className="lg:col-span-4">
          <InputSection
            jobData={jobData}
            setJobData={setJobData}
            onAnalyze={handleAnalyze}
            isAnalyzing={isAnalyzing}
          />
        </div>

        {/* Middle Column - Editor */}
        <div className="lg:col-span-5">
          <EditorSection
            jobData={jobData}
            setJobData={setJobData}
          />
        </div>

        {/* Right Column - Skills */}
        <div className="lg:col-span-3">
          <SkillsSidebar
            jobData={jobData}
            setJobData={setJobData}
          />
        </div>
      </div>
    </>
  )
}
