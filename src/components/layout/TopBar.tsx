import { LogOut, Folder, Shield } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { isCurrentUserManager } from '../../lib/roleService'
import { useState, useEffect } from 'react'

export function TopBar() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [isManager, setIsManager] = useState(false)

  useEffect(() => {
    const checkManagerRole = async () => {
      if (user) {
        try {
          const managerStatus = await isCurrentUserManager()
          setIsManager(managerStatus)
        } catch (error) {
          console.error('Failed to check manager role:', error)
        }
      }
    }
    checkManagerRole()
  }, [user])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/')
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
    <header className="bg-white/80 backdrop-blur-lg border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img src="/kadoshAI.png" alt="kadoshAI" className="h-10 w-auto" />
            <div className="h-8 w-px bg-slate-200 mx-1"></div>
            <h1 className="text-xl font-bold text-primary">
              JD Refine & Skills Extractor
            </h1>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/jobs"
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-primary hover:bg-slate-100 rounded-lg transition-all duration-200"
            >
              <Folder className="h-4 w-4" />
              Dashboard
            </Link>
            {isManager && (
              <Link
                to="/manager"
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-primary hover:bg-slate-100 rounded-lg transition-all duration-200"
              >
                <Shield className="h-4 w-4" />
                Manager Dashboard
              </Link>
            )}
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
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-primary hover:bg-slate-100 rounded-lg transition-all duration-200"
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
