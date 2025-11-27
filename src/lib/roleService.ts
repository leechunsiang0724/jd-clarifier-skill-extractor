import { supabase } from './supabase'

export interface UserRole {
    id: string
    user_id: string
    role: 'user' | 'manager'
    created_at: string
}

/**
 * Get the role of a specific user
 */
export async function getUserRole(userId: string): Promise<'user' | 'manager'> {
    const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle()

    if (error) {
        console.error('Error fetching user role:', error)
        return 'user' // Default to user role on error
    }

    return data?.role || 'user'
}

/**
 * Get the role of the currently logged-in user
 */
export async function getCurrentUserRole(): Promise<'user' | 'manager'> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        throw new Error('User must be authenticated')
    }

    return getUserRole(user.id)
}

/**
 * Check if a specific user is a manager
 */
export async function isUserManager(userId: string): Promise<boolean> {
    const role = await getUserRole(userId)
    return role === 'manager'
}

/**
 * Check if the currently logged-in user is a manager
 */
export async function isCurrentUserManager(): Promise<boolean> {
    const role = await getCurrentUserRole()
    return role === 'manager'
}

/**
 * Set user role (requires appropriate permissions)
 */
export async function setUserRole(userId: string, role: 'user' | 'manager'): Promise<UserRole> {
    const { data, error } = await supabase
        .from('user_roles')
        .upsert({ user_id: userId, role })
        .select()
        .single()

    if (error) throw error
    return data
}

/**
 * Initialize role for current user (defaults to 'user')
 */
export async function initializeCurrentUserRole(): Promise<UserRole> {
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
        throw new Error('User must be authenticated')
    }

    return setUserRole(user.id, 'user')
}
