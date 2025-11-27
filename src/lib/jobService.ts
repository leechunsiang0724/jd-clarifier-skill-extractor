import { supabase } from './supabase'

export interface Job {
  id: string
  user_id: string
  title?: string
  original_text: string
  refined_text?: string
  skills_must_have: string[]
  skills_nice_to_have: string[]
  tone?: string
  length?: string
  share_token?: string
  share_expires_at?: string
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected'
  manager_feedback?: string
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
  updated_at: string
}

export interface Comment {
  id: string
  job_id: string
  user_email?: string
  content: string
  created_at: string
}

export interface CreateJobData {
  title?: string
  original_text: string
  refined_text?: string
  skills_must_have: string[]
  skills_nice_to_have: string[]
  tone?: string
  length?: string
}

export interface UpdateJobData {
  title?: string
  original_text?: string
  refined_text?: string
  skills_must_have?: string[]
  skills_nice_to_have?: string[]
  tone?: string
  length?: string
  status?: 'draft' | 'pending_approval' | 'approved' | 'rejected'
}

// Create a new job
export async function createJob(data: CreateJobData): Promise<Job> {
  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('User must be authenticated to create a job')
  }

  const { data: job, error } = await supabase
    .from('jobs')
    .insert({
      ...data,
      user_id: user.id,
      status: 'draft',
    })
    .select()
    .select()
    .maybeSingle()

  if (error) throw error
  if (!job) throw new Error('Failed to create job')
  return job
}

// Get all jobs for current user
export async function getMyJobs(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Get a specific job by ID
export async function getJobById(id: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null // Not found
    throw error
  }
  return data
}

// Get a job by share token (for guest access)
export async function getJobByShareToken(token: string): Promise<Job | null> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('share_token', token)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw error
  }

  // Check if share link is expired
  if (data.share_expires_at && new Date(data.share_expires_at) < new Date()) {
    return null
  }

  return data
}

// Update a job
export async function updateJob(id: string, data: UpdateJobData): Promise<Job> {
  const { data: job, error } = await supabase
    .from('jobs')
    .update(data)
    .eq('id', id)
    .select()
    .select()
    .maybeSingle()

  if (error) throw error
  if (!job) throw new Error('Job not found or you do not have permission to update it')
  return job
}

// Delete a job
export async function deleteJob(id: string): Promise<void> {
  const { error } = await supabase
    .from('jobs')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Generate share link (set expiration to 7 days from now)
export async function generateShareLink(jobId: string): Promise<{ share_token: string; share_expires_at: string }> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

  const { data, error } = await supabase
    .from('jobs')
    .update({
      share_expires_at: expiresAt.toISOString(),
      status: 'pending_approval',
    })
    .eq('id', jobId)
    .select('share_token, share_expires_at')
    .single()

  if (error) throw error
  return data
}

// Get comments for a job
export async function getJobComments(jobId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('job_id', jobId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

// Add a comment
export async function addComment(jobId: string, content: string, userEmail?: string): Promise<Comment> {
  const { data, error } = await supabase
    .from('comments')
    .insert({
      job_id: jobId,
      content,
      user_email: userEmail,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// Submit job for manager approval
export async function submitJobForApproval(jobId: string): Promise<Job> {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + 7) // 7 days from now

  const { data, error } = await supabase
    .from('jobs')
    .update({
      status: 'pending_approval',
      share_expires_at: expiresAt.toISOString(),
    })
    .eq('id', jobId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Get all pending submissions (manager only)
export async function getPendingSubmissions(): Promise<Job[]> {
  const { data, error } = await supabase
    .from('jobs')
    .select('*')
    .eq('status', 'pending_approval')
    .order('updated_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Get all submissions with filters (manager only)
export async function getAllSubmissions(statusFilter?: 'approved' | 'rejected' | 'pending_approval'): Promise<Job[]> {
  let query = supabase
    .from('jobs')
    .select('*')
    .in('status', ['pending_approval', 'approved', 'rejected'])

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query.order('updated_at', { ascending: false })

  if (error) throw error
  return data || []
}

// Approve a job (manager only)
export async function approveJobSubmission(jobId: string): Promise<Job> {
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('User must be authenticated')
  }

  const { data, error } = await supabase
    .from('jobs')
    .update({
      status: 'approved',
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
      manager_feedback: null, // Clear any previous feedback
    })
    .eq('id', jobId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Reject a job with feedback (manager only)
export async function rejectJobSubmission(jobId: string, feedback: string): Promise<Job> {
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    throw new Error('User must be authenticated')
  }

  const { data, error } = await supabase
    .from('jobs')
    .update({
      status: 'rejected',
      manager_feedback: feedback,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq('id', jobId)
    .select()
    .single()

  if (error) throw error
  return data
}

// Legacy functions (kept for backward compatibility)
export async function approveJob(jobId: string): Promise<Job> {
  return approveJobSubmission(jobId)
}

export async function rejectJob(jobId: string): Promise<Job> {
  return rejectJobSubmission(jobId, 'Rejected')
}
