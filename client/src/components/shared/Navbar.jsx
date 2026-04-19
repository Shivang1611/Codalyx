import { Link, useLocation, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

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
            ECHOES
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
                  : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
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
          className="p-2.5 rounded-xl bg-white/5 border border-[var(--border)] text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="h-8 w-[1px] bg-[var(--border)] mx-1" />

        <div className="flex items-center gap-3 pl-2">
          <div className="text-right hidden sm:block">
            <div className="text-xs font-bold text-[var(--text-primary)] leading-none">{user.name}</div>
            <div className="text-[10px] text-[var(--cyan)] font-bold uppercase tracking-tighter mt-1">Prime Member</div>
          </div>
          <div className="relative group">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-zinc-700 to-zinc-900 border border-zinc-700 flex items-center justify-center text-white font-bold text-sm shadow-inner cursor-pointer">
              {user.image ? <img src={user.image} className="w-full h-full rounded-full object-cover" alt="" /> : <User size={18} />}
            </div>
            
            <div className="absolute right-0 mt-2 w-48 bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl shadow-2xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all p-2 z-[60]">
               <Link 
                to="/profile"
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[var(--text-secondary)] hover:text-white hover:bg-white/5 transition-colors text-sm font-bold border border-transparent"
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
    </nav>
  );
}
