import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';
import { 
  LayoutDashboard, 
  Target, 
  LogOut, 
  Sun, 
  Moon, 
  Terminal,
  User
} from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown when clicking anywhere outside
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('touchstart', handler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('touchstart', handler);
    };
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  if (!user) return null;

  const navLinks = [
    { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
    { path: '/analysis/total/revision', label: 'Revise', icon: <Target size={18} /> },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-[var(--bg-card)]/80 backdrop-blur-xl border-b border-[var(--border)] z-50 px-6 flex items-center justify-between">
      <div className="flex items-center gap-8">
        <Link to="/dashboard" className="flex items-center gap-2 group">
          <div className="w-8 h-8 bg-[var(--cyan)] rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(34,211,238,0.3)] group-hover:scale-110 transition-transform">
            <Terminal size={18} className="text-white" />
          </div>
          <span className="font-['Space_Grotesk'] text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Codalyx
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                location.pathname === link.path 
                  ? 'bg-[var(--cyan)]/10 text-[var(--cyan)] border border-[var(--cyan)]/20 shadow-[0_0_10px_rgba(34,211,238,0.1)]' 
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] border border-transparent'
              }`}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={toggle}
          className="p-2.5 rounded-xl bg-[var(--bg-hover)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--cyan)]/30 transition-all"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="h-8 w-[1px] bg-[var(--border)] mx-1" />

        <div className="flex items-center gap-3 pl-2">
          {/* Name - hidden on mobile */}
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-[var(--text-primary)] leading-none">{user.name}</div>
            <div className="text-[10px] text-[var(--cyan)] font-bold uppercase tracking-tighter mt-1">Prime Member</div>
          </div>

          {/* Avatar + dropdown — click-based, works on mobile */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(prev => !prev)}
              className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--cyan)] to-[var(--blue,#6366f1)] border-2 border-[var(--cyan)]/40 flex items-center justify-center text-white font-bold text-sm shadow-lg hover:scale-105 transition-transform focus:outline-none focus:ring-2 focus:ring-[var(--cyan)]/50"
              aria-label="Open profile menu"
              aria-expanded={menuOpen}
            >
              {user.image 
                ? <img src={user.image} className="w-full h-full rounded-full object-cover" alt={user.name} /> 
                : <User size={18} />
              }
            </button>

            {/* Dropdown */}
            {menuOpen && (
              <div className="absolute right-0 top-[calc(100%+8px)] w-52 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl shadow-black/10 p-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-150">
                {/* User info header */}
                <div className="px-4 py-3 border-b border-[var(--border)] mb-1">
                  <p className="text-xs font-bold text-[var(--text-primary)] truncate">{user.name}</p>
                  <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">{user.email}</p>
                </div>

                <Link
                  to="/profile"
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-colors text-sm font-bold"
                >
                  <User size={16} />
                  My Profile DNA
                </Link>

                <div className="h-[1px] bg-[var(--border)] my-1 mx-2" />

                <button
                  onClick={() => { setMenuOpen(false); logout(); }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-sm font-bold"
                >
                  <LogOut size={16} />
                  Logout Session
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
