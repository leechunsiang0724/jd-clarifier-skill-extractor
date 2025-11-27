import type { ReactNode } from 'react'
import { TopBar } from './TopBar'

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50">
      <TopBar />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  )
}
