import { ReactNode } from 'react'
import { TopBar } from './TopBar'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50">
      <TopBar />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
