
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'

// Load env vars
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase env vars')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function main() {
    // 1. Get the job
    const jobId = '6ac8d0a7-8f78-403f-b93b-c98fa376b1ad'
    const { data: job, error: jobError } = await supabase
        .from('jobs')
        .select('*')
        .eq('id', jobId)
        .single()

    if (jobError) {
        console.error('Error fetching job:', jobError)
    } else {
        console.log('Job found:', {
            id: job.id,
            user_id: job.user_id,
            title: job.title
        })
    }

    // 2. We can't easily get the "current user" from the server side script unless we have their access token.
    // But we can check if the job exists.

    // If I want to check the user, I need to know who the user is logged in as.
    // I can't know that from here.

    // However, I can check if the job exists at all.
}

main()
