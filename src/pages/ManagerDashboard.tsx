import { useEffect, useState } from 'react'
import { getPendingSubmissions, getAllSubmissions, approveJobSubmission, rejectJobSubmission, type Job } from '../lib/jobService'
import { FileText, CheckCircle, XCircle, Clock, MessageSquare, User, Calendar, X, Maximize2 } from 'lucide-react'

type TabType = 'pending' | 'all'

export function ManagerDashboard() {
    const [activeTab, setActiveTab] = useState<TabType>('pending')
    const [jobs, setJobs] = useState<Job[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedJob, setSelectedJob] = useState<Job | null>(null)
    const [viewingJob, setViewingJob] = useState<Job | null>(null)
    const [feedback, setFeedback] = useState('')
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        loadJobs()
    }, [activeTab])

    const loadJobs = async () => {
        setLoading(true)
        try {
            const data = activeTab === 'pending'
                ? await getPendingSubmissions()
                : await getAllSubmissions()
            setJobs(data)
        } catch (error) {
            console.error('Failed to load submissions:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApprove = async (jobId: string) => {
        if (!confirm('Are you sure you want to approve this job description?')) return

        setActionLoading(true)
        try {
            await approveJobSubmission(jobId)
            setSelectedJob(null)
            await loadJobs()
        } catch (error) {
            console.error('Failed to approve job:', error)
            alert('Failed to approve job')
        } finally {
            setActionLoading(false)
        }
    }

    const handleReject = async (jobId: string) => {
        if (!feedback.trim()) {
            alert('Please provide feedback for rejection')
            return
        }

        if (!confirm('Are you sure you want to reject this job description?')) return

        setActionLoading(true)
        try {
            await rejectJobSubmission(jobId, feedback)
            setSelectedJob(null)
            setFeedback('')
            await loadJobs()
        } catch (error) {
            console.error('Failed to reject job:', error)
            alert('Failed to reject job')
        } finally {
            setActionLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'approved':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="h-3 w-3" />
                        Approved
                    </span>
                )
            case 'rejected':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
                        <XCircle className="h-3 w-3" />
                        Rejected
                    </span>
                )
            case 'pending_approval':
                return (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700">
                        <Clock className="h-3 w-3" />
                        Pending
                    </span>
                )
            default:
                return null
        }
    }

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
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
        <div className="max-w-7xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800">Manager Dashboard</h1>
                <p className="text-slate-600 mt-2">Review and manage job description submissions</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'pending'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    Pending Submissions
                </button>
                <button
                    onClick={() => setActiveTab('all')}
                    className={`px-6 py-3 rounded-lg font-medium transition-all ${activeTab === 'all'
                        ? 'bg-primary text-primary-foreground shadow-md'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                >
                    All Submissions
                </button>
            </div>

            {jobs.length === 0 ? (
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-slate-200 p-12 text-center">
                    <FileText className="h-16 w-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-slate-800 mb-2">
                        {activeTab === 'pending' ? 'No pending submissions' : 'No submissions yet'}
                    </h3>
                    <p className="text-slate-600">
                        {activeTab === 'pending'
                            ? 'All submissions have been reviewed'
                            : 'Submissions will appear here once users submit job descriptions'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {jobs.map((job) => (
                        <div
                            key={job.id}
                            id={`job-card-${job.id}`}
                            className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-slate-200 p-6 hover:shadow-lg transition-all"
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-xl font-semibold text-slate-800">
                                            {job.title || 'Untitled Job Description'}
                                        </h3>
                                        {getStatusBadge(job.status)}
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-slate-500 mb-3">
                                        <div className="flex items-center gap-1">
                                            <User className="h-4 w-4" />
                                            <span>User ID: {job.user_id.substring(0, 8)}...</span>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            <span>Updated: {formatDate(job.updated_at)}</span>
                                        </div>
                                    </div>

                                    {/* Refined Text Preview */}
                                    {job.refined_text && (
                                        <div
                                            className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-3 cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all group/preview"
                                            onClick={() => setViewingJob(job)}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-sm font-medium text-slate-700">Refined Description:</p>
                                                <span className="text-xs text-primary opacity-0 group-hover/preview:opacity-100 transition-opacity flex items-center gap-1">
                                                    <Maximize2 className="h-3 w-3" />
                                                    Click to expand
                                                </span>
                                            </div>
                                            <p className="text-slate-600 text-sm line-clamp-3">{job.refined_text}</p>
                                        </div>
                                    )}

                                    {/* Skills */}
                                    {(job.skills_must_have.length > 0 || job.skills_nice_to_have.length > 0) && (
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {job.skills_must_have.map((skill, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                                                    {skill}
                                                </span>
                                            ))}
                                            {job.skills_nice_to_have.map((skill, idx) => (
                                                <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium">
                                                    {skill} (Nice)
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    {/* Manager Feedback (if rejected) */}
                                    {job.status === 'rejected' && job.manager_feedback && (
                                        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                                            <div className="flex items-start gap-2">
                                                <MessageSquare className="h-4 w-4 text-red-600 mt-0.5" />
                                                <div>
                                                    <p className="text-sm font-medium text-red-800">Rejection Feedback:</p>
                                                    <p className="text-sm text-red-700 mt-1">{job.manager_feedback}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Action Buttons */}
                            {job.status === 'pending_approval' && (
                                <div className="flex items-center gap-3 pt-4 border-t border-slate-200">
                                    <button
                                        onClick={() => setSelectedJob(selectedJob?.id === job.id ? null : job)}
                                        className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-medium hover:bg-slate-200 transition-all"
                                    >
                                        {selectedJob?.id === job.id ? 'Hide Details' : 'Review'}
                                    </button>
                                    <button
                                        onClick={() => handleApprove(job.id)}
                                        disabled={actionLoading}
                                        className="px-6 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-all flex items-center gap-2"
                                    >
                                        <CheckCircle className="h-4 w-4" />
                                        Approve
                                    </button>
                                </div>
                            )}

                            {/* Rejection Form */}
                            {selectedJob?.id === job.id && job.status === 'pending_approval' && (
                                <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Rejection Feedback (required to reject):
                                    </label>
                                    <textarea
                                        value={feedback}
                                        onChange={(e) => setFeedback(e.target.value)}
                                        placeholder="Provide detailed feedback on what needs to be improved..."
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary resize-none"
                                        rows={4}
                                    />
                                    <div className="flex gap-2 mt-3">
                                        <button
                                            onClick={() => handleReject(job.id)}
                                            disabled={actionLoading || !feedback.trim()}
                                            className="px-6 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 disabled:opacity-50 transition-all flex items-center gap-2"
                                        >
                                            <XCircle className="h-4 w-4" />
                                            Reject with Feedback
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedJob(null)
                                                setFeedback('')
                                            }}
                                            className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-300 transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
            {/* Job Preview Modal */}
            {viewingJob && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-slate-100">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">
                                    {viewingJob.title || 'Untitled Job Description'}
                                </h2>
                                <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                                    {getStatusBadge(viewingJob.status)}
                                    <span>Updated: {formatDate(viewingJob.updated_at)}</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setViewingJob(null)}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 min-h-[400px]">
                                <div className="prose prose-slate max-w-none whitespace-pre-wrap font-sans text-slate-700 leading-relaxed">
                                    {viewingJob.refined_text || viewingJob.original_text}
                                </div>
                            </div>

                            {/* Skills Section in Modal */}
                            {(viewingJob.skills_must_have.length > 0 || viewingJob.skills_nice_to_have.length > 0) && (
                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-slate-800 mb-3">Detected Skills</h3>
                                    <div className="flex flex-wrap gap-2">
                                        {viewingJob.skills_must_have.map((skill, idx) => (
                                            <span key={`must-${idx}`} className="px-3 py-1.5 bg-primary/10 text-primary rounded-lg text-sm font-medium border border-primary/20">
                                                {skill}
                                            </span>
                                        ))}
                                        {viewingJob.skills_nice_to_have.map((skill, idx) => (
                                            <span key={`nice-${idx}`} className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium border border-slate-200">
                                                {skill} (Nice to have)
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Footer Actions */}
                        <div className="p-6 border-t border-slate-100 bg-slate-50 rounded-b-2xl flex justify-end gap-3">
                            <button
                                onClick={() => setViewingJob(null)}
                                className="px-6 py-2.5 bg-white text-slate-700 border border-slate-300 rounded-lg font-medium hover:bg-slate-50 transition-all"
                            >
                                Close
                            </button>
                            {viewingJob.status === 'pending_approval' && (
                                <>
                                    <button
                                        onClick={() => {
                                            setViewingJob(null)
                                            setSelectedJob(viewingJob)
                                            // Scroll to the job card
                                            setTimeout(() => {
                                                const element = document.getElementById(`job-card-${viewingJob.id}`)
                                                element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                            }, 100)
                                        }}
                                        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow"
                                    >
                                        Review & Act
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
