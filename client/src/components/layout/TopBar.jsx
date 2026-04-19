import { User, LogOut, Sun, Moon, Search, Menu, X, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { useTheme } from '../../context/ThemeContext.jsx'

export default function TopBar({ onMenuClick, isSidebarOpen }) {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()

  if (!user) return null

  return (
    <header className="h-16 border-b border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-md sticky top-0 z-[30] px-4 md:px-6 flex items-center justify-between">

      {/* Left: Hamburger + Codalyx logo (shown only when sidebar is collapsed) */}
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all duration-200"
          title={isSidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <div className="flex flex-col justify-center gap-[5px] w-5 h-5">
            <span className="block h-0.5 w-5 bg-current rounded-full transition-all duration-300" />
            <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${isSidebarOpen ? 'w-3' : 'w-5'}`} />
            <span className={`block h-0.5 bg-current rounded-full transition-all duration-300 ${isSidebarOpen ? 'w-4' : 'w-5'}`} />
          </div>
        </button>

        {/* Logo — only visible when sidebar is hidden */}
        <div className={`flex items-center gap-2 transition-all duration-300 overflow-hidden ${isSidebarOpen ? 'opacity-0 w-0 pointer-events-none' : 'opacity-100 w-auto'}`}>
          <div className="w-7 h-7 bg-[var(--cyan)] rounded-lg flex items-center justify-center shadow-md shadow-[var(--cyan-glow)] shrink-0">
            <Zap size={15} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="text-lg font-bold font-['Space_Grotesk'] tracking-tight text-[var(--text-primary)] whitespace-nowrap">Codalyx</span>
        </div>
      </div>

      {/* Right side actions */}
      <div className="flex items-center gap-5">
        <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1.5 rounded-lg hover:bg-[var(--bg-hover)]">
          <Search size={18} />
        </button>

        <button
          onClick={toggle}
          className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1.5 rounded-lg hover:bg-[var(--bg-hover)]"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="h-6 w-[1px] bg-[var(--border)]" />

        {/* User profile */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <div className="text-xs font-bold text-[var(--text-primary)] leading-none">{user.name}</div>
            <div className="text-[10px] text-[var(--cyan)] font-bold uppercase tracking-tighter mt-1">Prime Member</div>
          </div>

          <div className="relative group">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--cyan)] to-blue-500 border-2 border-[var(--cyan)]/30 flex items-center justify-center text-white font-bold text-sm shadow cursor-pointer hover:scale-105 transition-transform">
              {user.image
                ? <img src={user.image} className="w-full h-full rounded-full object-cover" alt="" />
                : <User size={16} />
              }
            </div>

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 p-2 z-[60]">
              <Link
                to="/profile"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-sm font-bold"
              >
                <User size={16} />
                My Profile DNA
              </Link>
              <div className="h-[1px] bg-[var(--border)] my-1 mx-2" />
              <button
                onClick={logout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-400/10 transition-colors text-sm font-bold"
              >
                <LogOut size={16} />
                Logout Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
