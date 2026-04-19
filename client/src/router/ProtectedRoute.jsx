import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import LoadingSpinner from '../components/shared/LoadingSpinner.jsx'
import Sidebar from '../components/layout/Sidebar.jsx'
import TopBar from '../components/layout/TopBar.jsx'
import CoachAI from '../components/dashboard/CoachAI.jsx'
import { useState } from 'react'

export default function ProtectedRoute({ children }) {
  const { user, isLoading } = useAuth()
  // Default: open on desktop, closed on mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  )

  if (isLoading) return <LoadingSpinner />
  if (!user)     return <Navigate to="/login" replace />

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-base)] text-[var(--text-primary)] transition-colors duration-200">
      {/* Mobile Overlay - only on small screens */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[40] md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Main content shifts on desktop based on sidebar state */}
      <main
        className={`flex-1 overflow-y-auto relative transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-[260px]' : 'ml-0'
        }`}
      >
        <TopBar
          onMenuClick={() => setIsSidebarOpen(prev => !prev)}
          isSidebarOpen={isSidebarOpen}
        />
        {children}
        <CoachAI />
      </main>
    </div>
  )
}
