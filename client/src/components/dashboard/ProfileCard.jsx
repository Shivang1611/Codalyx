import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { RefreshCw, Trash2, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import PlatformLogo, { PLATFORM_META } from '../shared/PlatformLogo.jsx'

export default function ProfileCard({ profile, onDelete, onRefresh }) {
  const navigate = useNavigate()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async (e) => {
    e.stopPropagation()
    setIsRefreshing(true)
    await onRefresh(profile._id)
    setIsRefreshing(false)
  }

  return (
    <motion.div
      layout
      whileHover={{ translateY: -4 }}
      className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-[var(--shadow-card)] group relative transition-all duration-300 hover:shadow-[var(--shadow-glow)]"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border"
            style={{
              backgroundColor: `${PLATFORM_META[profile.platform]?.color || '#22d3ee'}18`,
              borderColor: `${PLATFORM_META[profile.platform]?.color || '#22d3ee'}30`
            }}
          >
            <PlatformLogo platform={profile.platform} size="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text-primary)] font-['Space_Grotesk'] leading-none mb-1">{profile.username}</h3>
            <span
              className="text-[10px] font-bold uppercase tracking-widest"
              style={{ color: PLATFORM_META[profile.platform]?.color || 'var(--text-muted)' }}
            >{profile.platform}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleRefresh}
            className={`p-2 text-[var(--text-muted)] hover:text-[var(--cyan)] hover:bg-[var(--cyan-glow)] rounded-lg transition-all ${isRefreshing ? 'animate-spin text-[var(--cyan)]' : ''}`}
            aria-label="Refresh stats"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={() => onDelete(profile._id)}
            className="p-2 text-[var(--text-muted)] hover:text-[var(--red)] hover:bg-[var(--red)]/10 rounded-lg transition-all"
            aria-label={`Delete ${profile.username} profile`}
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-xs font-bold uppercase tracking-wider mb-2">
            <span className="text-[var(--text-secondary)]">Solved Questions</span>
            <span className="text-[var(--text-primary)]">{profile.solvedQuestions} / {profile.totalQuestions}</span>
          </div>
          <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(profile.solvedQuestions / Math.max(profile.totalQuestions, 1)) * 100}%` }}
              className="h-full bg-gradient-to-r from-[var(--cyan)] to-[var(--purple)]"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 py-4 border-y border-[var(--border-subtle)] bg-[var(--bg-hover)]/30 -mx-6 px-6">
          <div className="text-center">
            <p className="text-[9px] font-black text-[#10b981] uppercase tracking-tighter mb-1">Easy</p>
            <p className="text-xs font-black text-[var(--text-primary)] leading-none">
              {profile.easySolved || 0} <span className="text-[10px] text-[var(--text-muted)] font-medium">/ {profile.easyTotal || 0}</span>
            </p>
          </div>
          <div className="text-center border-x border-[var(--border-subtle)]">
            <p className="text-[9px] font-black text-[#f59e0b] uppercase tracking-tighter mb-1">Medium</p>
            <p className="text-xs font-black text-[var(--text-primary)] leading-none">
              {profile.mediumSolved || 0} <span className="text-[10px] text-[var(--text-muted)] font-medium">/ {profile.mediumTotal || 0}</span>
            </p>
          </div>
          <div className="text-center">
            <p className="text-[9px] font-black text-[#ef4444] uppercase tracking-tighter mb-1">Hard</p>
            <p className="text-xs font-black text-[var(--text-primary)] leading-none">
              {profile.hardSolved || 0} <span className="text-[10px] text-[var(--text-muted)] font-medium">/ {profile.hardTotal || 0}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 pt-2">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3">
            <p className="text-[10px] font-bold uppercase tracking-tight text-[var(--text-muted)] mb-1">Accuracy</p>
            <p className="text-xl font-bold text-[var(--cyan)] leading-none">{profile.accuracy}%</p>
          </div>
          <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-3 text-right">
            <p className="text-[10px] font-bold uppercase tracking-tight text-[var(--text-muted)] mb-1">Curr. Streak</p>
            <p className="text-xl font-bold text-[var(--orange)] leading-none">{profile.streak} d</p>
          </div>
        </div>

        <button
          onClick={() => navigate(`/analysis/${profile._id}`)}
          className="w-full mt-2 py-3 bg-[var(--bg-hover)] hover:bg-[var(--cyan)] text-[var(--text-primary)] hover:text-white border border-[var(--border)] rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          View Full Analysis
          <ChevronRight size={16} />
        </button>
      </div>
    </motion.div>
  )
}
