import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Target, LogOut, Mail, User, X, Library, BookOpen, Zap, Trophy } from 'lucide-react'
import { useAuth } from '../../context/AuthContext.jsx'

export default function Sidebar({ isOpen, setIsOpen }) {
  const location = useLocation()
  const { user, logout } = useAuth()
  
  // auto-close on navigation for mobile
  useEffect(() => {
    if (setIsOpen) setIsOpen(false)
  }, [location.pathname, setIsOpen])

  if (!user) return null;

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Arena', path: '/contests', icon: Trophy },
    { name: 'Resources', path: '/resources', icon: BookOpen },
    { name: 'Sheets', path: '/sheets', icon: Library },
    { name: 'Revision', path: '/analysis/total/revision', icon: Target },
  ]

  const bottomItems = [
    { name: 'Contact Support', icon: Mail, path: '/support' },
  ]

  return (
    <aside className={`w-[260px] h-screen bg-[var(--bg-card)] border-r border-[var(--border)] flex flex-col fixed left-0 top-0 z-[50] transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="p-5 flex items-center justify-between border-b border-[var(--border)]">
        <div className="flex items-center gap-3">
          {/* Logo mark — stylized bolt/C icon, no letter */}
          <div className="w-8 h-8 bg-[var(--cyan)] rounded-lg flex items-center justify-center shadow-lg shadow-[var(--cyan-glow)]">
            <Zap size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold font-['Space_Grotesk'] tracking-tight text-[var(--text-primary)]">Codalyx</span>
        </div>
        <button
          onClick={() => setIsOpen && setIsOpen(false)}
          className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
        >
          <X size={18} />
        </button>
      </div>

      <nav className="flex-1 px-4 space-y-1 mt-4">
        {navItems.map(item => {
           // Basic active check (exact for dashboard, includes for analysis)
          const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.includes(item.path))
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold transition-all ${
                isActive 
                  ? 'bg-[var(--bg-hover)] text-[var(--cyan)]' 
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)]'
              }`}
            >
              <item.icon size={18} className={isActive ? 'text-[var(--cyan)]' : 'opacity-70'} />
              {item.name}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 mb-2 border-b border-[var(--border)]">
        <div className="space-y-1">
          {bottomItems.map(item => {
            const isActive = location.pathname === item.path
            return (
              <Link 
                key={item.name} 
                to={item.path}
                className={`w-full flex items-center gap-3 px-4 py-2 text-sm font-medium transition-colors rounded-xl ${
                  isActive 
                    ? 'bg-[var(--bg-hover)] text-[var(--cyan)]' 
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)]'
                }`}
              >
                <item.icon size={16} className={isActive ? 'text-[var(--cyan)]' : 'opacity-70'} />
                {item.name}
              </Link>
            )
          })}
        </div>
      </div>

      <div className="p-4 border-t border-[var(--border)] space-y-1">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--cyan)] to-blue-500 border-2 border-[var(--cyan)]/30 flex items-center justify-center text-white font-bold text-sm shadow shrink-0">
            {user.image ? <img src={user.image} className="w-full h-full rounded-full object-cover" alt="" /> : <User size={16} />}
          </div>
          <div className="flex-1 overflow-hidden">
            <div className="text-xs font-bold text-[var(--text-primary)] leading-none truncate">{user.name}</div>
            <div className="text-[10px] text-[var(--cyan)] font-bold uppercase tracking-tighter mt-1">Prime Member</div>
          </div>
        </div>

        <Link
          to="/profile"
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-sm font-semibold"
        >
          <User size={16} className="opacity-70" />
          My Profile DNA
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-sm font-semibold"
        >
          <LogOut size={16} />
          Logout Session
        </button>
      </div>
    </aside>
  )
}
