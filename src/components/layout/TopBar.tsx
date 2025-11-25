import { FileText, LogOut, Folder } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'

export function TopBar() {
  const { user } = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  const getUserDisplayName = () => {
    const firstName = user?.user_metadata?.first_name
    const lastName = user?.user_metadata?.last_name
    
    if (firstName && lastName) {
      return `${firstName} ${lastName}`
    } else if (firstName) {
      return firstName
    }
    return user?.email || 'User'
  }

  return (
    <header className="bg-white/80 backdrop-blur-lg border-b border-indigo-100 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg shadow-md">
              <FileText className="h-6 w-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              JD Refine & Skills Extractor
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/jobs"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
            >
              <Folder className="h-4 w-4" />
              My Jobs
            </Link>
            <div className="text-right">
              <div className="text-sm font-semibold text-slate-800">
                {getUserDisplayName()}
              </div>
              {user?.user_metadata?.first_name && (
                <div className="text-xs text-slate-500">
                  {user.email}
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
