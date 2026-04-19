import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import ThemeToggle from './ThemeToggle'
import { LogOut, Menu, X, LayoutDashboard, Database, Activity, User } from 'lucide-react'
import { useState } from 'react'

export default function Navbar() {
  const { user, logout } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const navLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={18} /> },
    { name: 'Analyzer', path: '/dashboard', icon: <Activity size={18} /> }, // Analyzer usually needs a profileId
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[var(--bg-surface)] border-b border-[var(--border)] z-50 flex items-center px-6 justify-between transition-colors duration-200">
      <div className="flex items-center gap-8">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-gradient-to-br from-[var(--cyan)] to-[var(--purple)] rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
            <span className="text-white font-bold text-sm">CX</span>
          </div>
          <span className="font-['Space_Grotesk'] text-xl font-bold tracking-tight text-[var(--text-primary)]">
            CODALYX
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          {navLinks.map(link => (
            <Link 
              key={link.name} 
              to={link.path}
              className="px-3 py-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] rounded-lg transition-all flex items-center gap-2 text-sm font-medium"
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        <div className="h-8 w-[1px] bg-[var(--border)] hidden sm:block mx-2" />

        {user && (
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-[var(--text-primary)]">{user.name}</span>
              <span className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest leading-none">Standard User</span>
            </div>
            <button 
              onClick={logout}
              className="p-2 text-[var(--text-secondary)] hover:text-[var(--red)] hover:bg-[var(--red)]/10 rounded-lg transition-all"
              aria-label="Logout"
            >
              <LogOut size={20} />
            </button>
            <button className="md:hidden p-2 text-[var(--text-secondary)]" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="absolute top-16 left-0 right-0 bg-[var(--bg-surface)] border-b border-[var(--border)] overflow-hidden md:hidden shadow-lg"
          >
            <div className="flex flex-col p-4 gap-2">
              {navLinks.map(link => (
                <Link 
                  key={link.name} 
                  to={link.path}
                  className="p-3 text-[var(--text-secondary)] flex items-center gap-3 rounded-lg hover:bg-[var(--bg-hover)]"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
              <hr className="border-[var(--border)] my-2" />
              <button 
                onClick={logout}
                className="p-3 text-[var(--red)] flex items-center gap-3 rounded-lg hover:bg-[var(--red)]/10"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
