import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Custom storage adapter that uses localStorage or sessionStorage based on a flag
const customStorageAdapter = {
    getItem: (key: string) => {
        // Check if we should use sessionStorage (Remember Me unchecked)
        const useSessionStorage = sessionStorage.getItem('use_session_storage') === 'true'
        if (useSessionStorage) {
            return sessionStorage.getItem(key)
        }
        return localStorage.getItem(key)
    },
    setItem: (key: string, value: string) => {
        // Check if we should use sessionStorage (Remember Me unchecked)
        const useSessionStorage = sessionStorage.getItem('use_session_storage') === 'true'
        if (useSessionStorage) {
            sessionStorage.setItem(key, value)
        } else {
            localStorage.setItem(key, value)
        }
    },
    removeItem: (key: string) => {
        sessionStorage.removeItem(key)
        localStorage.removeItem(key)
    },
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        storage: customStorageAdapter,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
    },
})
