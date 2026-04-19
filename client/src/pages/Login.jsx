import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useTheme } from '../context/ThemeContext.jsx';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  Zap, 
  BarChart3, 
  ChevronRight,
  Code,
  Globe
} from 'lucide-react';

export default function Login() {
  const { user, loginWithGoogle, loginWithGitHub, isLoading } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  // AUTH LOOP FIX: Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, isLoading, navigate]);

  const features = [
    { title: 'Platform Sync', desc: 'LeetCode, Codeforces, CodeChef', icon: <Zap size={16} /> },
    { title: 'Psychology Analysis', desc: 'Behavior & mindset tracking', icon: <ShieldCheck size={16} /> },
    { title: 'Visual Insights', desc: 'Topic-wise progress charts', icon: <BarChart3 size={16} /> },
  ];

  const handleLogin = (provider) => {
    setLoading(provider);
    if (provider === 'google') loginWithGoogle();
    else loginWithGitHub();
  };

  if (isLoading) return null; // Wait for auth check

  return (
    <div className={`min-h-screen relative flex flex-col items-center justify-center p-6 transition-colors duration-500 ${theme === 'dark' ? 'bg-[#050505]' : 'bg-[#f8fafc]'}`}>
      
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-[var(--cyan)]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[var(--cyan)]/5 blur-[120px] rounded-full" />
      </div>

      {/* Nav Overlay */}
      <div className="absolute top-8 left-8 flex items-center gap-2">
        <div className="w-10 h-10 bg-[var(--cyan)] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
          <Code className="text-white" size={24} />
        </div>
        <span className="font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          Codalyx
        </span>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-[var(--bg-card)] rounded-3xl p-8 shadow-[var(--shadow-card)] border border-[var(--border)] relative z-10"
      >
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold mb-3 text-[var(--text-primary)] tracking-tight font-['Space_Grotesk']">Master your craft.</h1>
          <p className="text-[var(--text-secondary)] font-medium">AI-powered coding interview prep — know WHY you failed, not just what.</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleLogin('google')}
            disabled={loading !== null}
            className="w-full h-14 bg-[var(--bg-surface)] hover:bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border)] rounded-2xl flex items-center justify-center gap-4 transition-all group relative overflow-hidden disabled:opacity-50"
          >
            {loading === 'google' ? (
              <div className="w-5 h-5 border-2 border-[var(--cyan)] border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <div className="bg-white p-1 rounded-full text-gray-800"><Globe size={18} /></div>
                <span className="font-semibold">Continue with Google</span>
              </>
            )}
            <ChevronRight size={18} className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
          </button>

          <button
            onClick={() => handleLogin('github')}
            disabled={loading !== null}
            className="w-full h-14 bg-[#181717] hover:bg-[#252525] text-white rounded-2xl flex items-center justify-center gap-4 transition-all group relative overflow-hidden disabled:opacity-50 shadow-lg shadow-black/20"
          >
            {loading === 'github' ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Code size={22} />
                <span className="font-semibold">Continue with GitHub</span>
              </>
            )}
            <ChevronRight size={18} className="absolute right-4 opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0" />
          </button>
        </div>

        <p className="mt-8 text-[var(--text-muted)] text-xs text-center leading-relaxed">
          By continuing, you agree to Codalyx's <span className="underline cursor-pointer hover:text-[var(--text-secondary)]">Terms of Service</span> and <span className="underline cursor-pointer hover:text-[var(--text-secondary)]">Privacy Policy</span>.
        </p>
      </motion.div>

      {/* Feature Pills */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-12 flex flex-wrap justify-center gap-4 max-w-4xl"
      >
        {features.map((f, i) => (
          <div key={i} className="px-5 py-3 bg-[var(--bg-surface)]/50 backdrop-blur-md border border-[var(--border)] rounded-full flex items-center gap-3 shadow-sm hover:translate-y-[-2px] transition-transform duration-300">
            <div className="text-[var(--cyan)] bg-[var(--cyan)]/10 p-2 rounded-full">{f.icon}</div>
            <div className="flex flex-col text-left">
              <span className="text-[var(--text-primary)] text-xs font-bold leading-none mb-1">{f.title}</span>
              <span className="text-[var(--text-muted)] text-[10px] leading-none whitespace-nowrap">{f.desc}</span>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Legal/Footer */}
      <div className="absolute bottom-8 text-[var(--text-muted)] text-[10px] uppercase tracking-widest font-medium">
        © 2026 CODALYX AGENTIC AI · BUILT FOR MASTERY
      </div>
    </div>
  );
}
