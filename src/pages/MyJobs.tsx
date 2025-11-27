import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyJobs, deleteJob, submitJobForApproval, type Job } from '../lib/jobService'
import { FileText, Trash2, Calendar, Tag, Send, Edit, ArrowLeft } from 'lucide-react'

export function MyJobs() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    loadJobs()
  }, [])

  const loadJobs = async () => {
    try {
      const data = await getMyJobs()
      setJobs(data)
    } catch (error) {
      console.error('Failed to load jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return

    try {
      await deleteJob(id)
      setJobs(jobs.filter((job) => job.id !== id))
    } catch (error) {
      console.error('Failed to delete job:', error)
      alert('Failed to delete job')
    }
  }

  const handleSubmit = async (job: Job) => {
    if (!job.refined_text) {
      alert('Please refine the job description before submitting')
      return
    }

    if (!confirm('Are you sure you want to submit this job description for manager approval?')) return

    try {
      const updatedJob = await submitJobForApproval(job.id)
      setJobs(jobs.map((j) => (j.id === job.id ? updatedJob : j)))
      alert('Job submitted for approval!')
    } catch (error) {
      console.error('Failed to submit job:', error)
      alert('Failed to submit job')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700'
      case 'rejected':
        return 'bg-red-100 text-red-700'
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-700'
      default:
        return 'bg-slate-100 text-slate-700'
    }
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <button
          onClick={() => navigate('/')}
          className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
        >
          <ArrowLeft className="h-5 w-5" />
          Back
        </button>
        <div className="text-right">
          <h1 className="text-3xl font-bold text-slate-800">My Job Descriptions</h1>
          <p className="text-slate-600 mt-2">Manage and share your refined job descriptions</p>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
          <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-800 mb-2">No job descriptions yet</h3>
          <p className="text-slate-600 mb-6">Create your first job description to get started</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all"
          >
            Create Job Description
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-all group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold text-slate-800">
                      {job.title || 'Untitled Job Description'}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
                      {job.status.replace('_', ' ')}
                    </span>
                  </div>

                  <p className="text-slate-600 text-sm line-clamp-2 mb-4">{job.original_text}</p>

                  <div className="flex items-center gap-6 text-sm text-slate-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(job.updated_at)}</span>
                    </div>
                    {(job.skills_must_have.length > 0 || job.skills_nice_to_have.length > 0) && (
                      <div className="flex items-center gap-1">
                        <Tag className="h-4 w-4" />
                        <span>{job.skills_must_have.length + job.skills_nice_to_have.length} skills</span>
                      </div>
                    )}
                    {job.tone && (
                      <div className="text-xs bg-slate-100 px-2 py-1 rounded">
                        {job.tone}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {(job.status === 'draft' || job.status === 'rejected') && job.refined_text && (
                    <button
                      onClick={() => handleSubmit(job)}
                      className="p-2 bg-green-500 text-white hover:bg-green-600 rounded-lg transition-all shadow-sm hover:shadow-md"
                      title="Submit for Approval"
                    >
                      <Send className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => navigate(`/jobs/${job.id}`)}
                    className="p-2 text-slate-600 hover:text-primary hover:bg-slate-100 rounded-lg transition-all"
                    title="Edit"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="p-2 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
