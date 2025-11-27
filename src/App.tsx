import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from './components/layout/AppLayout'
import { JobEditor } from './pages/JobEditor'
import { MyJobs } from './pages/MyJobs'
import { Login } from './pages/Login'
import { ManagerDashboard } from './pages/ManagerDashboard'
import { LandingPage } from './pages/LandingPage'
import { useAuth } from './hooks/useAuth'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
        <Route
          path="/"
          element={user ? <AppLayout><JobEditor /></AppLayout> : <LandingPage />}
        />
        <Route
          path="/jobs"
          element={user ? <AppLayout><MyJobs /></AppLayout> : <Navigate to="/login" />}
        />
        <Route
          path="/jobs/:jobId"
          element={user ? <AppLayout><JobEditor /></AppLayout> : <Navigate to="/login" />}
        />
        <Route
          path="/manager"
          element={user ? <AppLayout><ManagerDashboard /></AppLayout> : <Navigate to="/login" />}
        />
      </Routes>
    </BrowserRouter>
  )
}

export default App
