import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../utils/api.js'
import PageWrapper from '../components/shared/PageWrapper.jsx'
import PsychologyRadar from '../components/question/PsychologyRadar.jsx'
import PlatformLogo, { PLATFORM_META } from '../components/shared/PlatformLogo.jsx'
import {
  User, Settings, Shield, Target, Zap, Trophy,
  Code, Layers, Activity, Calendar, ExternalLink,
  AlertCircle, RefreshCw, TrendingUp, ChevronRight,
  Award, BookOpen, Brain, Star, CheckCircle, Clock
} from 'lucide-react'

/* ─── Pure utility functions (no hooks) ─── */

function getMasteryRank(totalSolved) {
  if (totalSolved >= 500) return { rank: 'Diamond', color: 'var(--cyan)' }
  if (totalSolved >= 300) return { rank: 'Platinum', color: '#e2e8f0' }
  if (totalSolved >= 150) return { rank: 'Gold III',  color: 'var(--orange)' }
  if (totalSolved >= 75)  return { rank: 'Silver II', color: '#94a3b8' }
  if (totalSolved >= 30)  return { rank: 'Bronze I',  color: '#b45309' }
  return { rank: 'Novice', color: 'var(--text-muted)' }
}

function computeMasteryScore(profiles) {
  if (!profiles.length) return { score: 0, percentile: 100 }
  const totalSolved = profiles.reduce((s, p) => s + (p.solvedQuestions || 0), 0)
  const avgStreak   = profiles.reduce((s, p) => s + (p.streak || 0), 0) / profiles.length
  const bonus       = profiles.length * 25
  const score       = Math.min(Math.round(totalSolved * 2.5 + avgStreak * 10 + bonus), 2000)
  const percentile  = score > 1500 ? 1.2 : score > 1000 ? 4.2 : score > 500 ? 12.5 : score > 200 ? 28 : 55
  return { score, percentile }
}

function buildCodingDNA(profiles) {
  const topicMap = {}
  profiles.forEach(p => {
    ;[...(p.weakAreas || []), ...(p.strongAreas || [])].forEach(a => {
      if (!topicMap[a.topic]) topicMap[a.topic] = { attempts: 0, isStrong: false }
      topicMap[a.topic].attempts += a.attempts || 0
    })
    ;(p.strongAreas || []).forEach(a => {
      if (topicMap[a.topic]) topicMap[a.topic].isStrong = true
    })
  })

  const TRAITS = [
    'Algorithmic Speed', 'Pattern Recognition', 'Error Resilience',
    'System Design', 'Focus Duration', 'Consistency'
  ]

  const topics = Object.entries(topicMap).sort((a, b) => b[1].attempts - a[1].attempts).slice(0, 6)
  const maxAttempts = Math.max(...topics.map(([, d]) => d.attempts), 1)

  if (!topics.length) return TRAITS.map(trait => ({ trait, score: 50 }))

  return TRAITS.map((trait, i) => {
    const entry = topics[i]
    if (!entry) return { trait, score: 45 }
    const [, data] = entry
    const rel = Math.round((data.attempts / maxAttempts) * 100)
    return { trait: topics[i][0], score: data.isStrong ? Math.min(rel + 15, 95) : Math.max(rel - 15, 10) }
  })
}

function buildSkillProgress(profiles) {
  const COLORS = ['var(--purple)', 'var(--cyan)', 'var(--green)', 'var(--orange)', 'var(--blue)']
  const topicMap = {}
  profiles.forEach(p => {
    ;[...(p.weakAreas || []), ...(p.strongAreas || [])].forEach(a => {
      topicMap[a.topic] = Math.max(topicMap[a.topic] || 0, a.attempts || 0)
    })
  })
  const entries = Object.entries(topicMap).sort((a, b) => b[1] - a[1]).slice(0, 5)
  if (!entries.length) return []
  const max = Math.max(...entries.map(([, v]) => v), 1)
  return entries.map(([label, v], i) => ({
    label, score: Math.max(Math.round((v / max) * 100), 5), color: COLORS[i]
  }))
}

function buildRevisions(profiles) {
  const allSubs = []
  profiles.forEach(p => {
    ;(p.recentSubmissions || []).forEach(sub =>
      allSubs.push({ ...sub, profileId: p._id, platform: p.platform })
    )
  })
  return allSubs
    .filter(s => s.title && (s.status !== 'Accepted' || (s.accuracy || 0) < 70))
    .sort((a, b) => (a.accuracy || 0) - (b.accuracy || 0))
    .slice(0, 4)
    .map((s, i) => ({
      id: s.id, title: s.title,
      topic: s.topic || 'General',
      profileId: s.profileId, platform: s.platform,
      accuracy: s.accuracy || 0,
      priority: i === 0 ? 'High' : i === 1 ? 'Medium' : 'Low'
    }))
}

function getAchievements(profiles, totalSolved, maxStreak) {
  const badges = [
    { id: 'first_solve',   icon: '🏁', label: 'First Blood',       desc: 'Solved your first problem',       earned: totalSolved >= 1  },
    { id: 'thirty',        icon: '🔥', label: 'On Fire',            desc: 'Solved 30+ problems',             earned: totalSolved >= 30 },
    { id: 'century',       icon: '💯', label: 'Century Club',       desc: 'Solved 100+ problems',            earned: totalSolved >= 100 },
    { id: 'two_fifty',     icon: '⚔️', label: 'Warrior',           desc: '250+ problems solved',            earned: totalSolved >= 250 },
    { id: 'multi_plat',   icon: '🌐', label: 'Platform Hopper',    desc: 'Connected 2+ platforms',          earned: profiles.length >= 2 },
    { id: 'full_house',   icon: '🏆', label: 'Full House',          desc: 'Connected 4+ platforms',          earned: profiles.length >= 4 },
    { id: 'streak_7',     icon: '📅', label: 'Week Warrior',        desc: '7-day solving streak',            earned: maxStreak >= 7    },
    { id: 'streak_30',    icon: '🗓️', label: 'Month Strong',       desc: '30-day solving streak',           earned: maxStreak >= 30   },
  ]
  return badges
}

/* ─── Sub-components ─── */

function PlatformCard({ profile, onNavigate }) {
  const pctSolved = Math.min(Math.round((profile.solvedQuestions / (profile.totalQuestions || 3300)) * 100), 100)
  const lastSync  = profile.lastSyncedAt
    ? new Date(profile.lastSyncedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
    : 'Never'
  const color = PLATFORM_META[profile.platform]?.color || 'var(--cyan)'

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 hover:border-[var(--cyan)]/40 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Real platform logo in a colored pill */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center border shrink-0"
            style={{ backgroundColor: `${color}18`, borderColor: `${color}30` }}
          >
            <PlatformLogo platform={profile.platform} size="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-[10px] font-black uppercase tracking-widest" style={{ color }}>
                {PLATFORM_META[profile.platform]?.label || profile.platform}
              </span>
            </div>
            <h4 className="text-base font-bold text-[var(--text-primary)] font-['Space_Grotesk']">{profile.username}</h4>
          </div>
        </div>
        <button
          onClick={() => onNavigate(profile._id)}
          className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--cyan)] hover:bg-[var(--cyan)]/10 transition-all"
          title="Open Analyzer"
        >
          <ExternalLink size={16} />
        </button>
      </div>

      {/* Progress ring simulation via bar */}
      <div className="mb-4">
        <div className="flex justify-between text-[10px] font-bold text-[var(--text-muted)] mb-1.5">
          <span>Progress</span>
          <span style={{ color }}>{profile.solvedQuestions} / {profile.totalQuestions || 3300}</span>
        </div>
        <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden mb-3">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pctSolved}%` }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
        
        {/* Difficulty Breakdown */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-black uppercase text-[#10b981]">Easy</span>
            <span className="text-[10px] font-bold text-[var(--text-primary)]">{profile.easySolved || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-black uppercase text-[#f59e0b]">Med</span>
            <span className="text-[10px] font-bold text-[var(--text-primary)]">{profile.mediumSolved || 0}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-[8px] font-black uppercase text-[#ef4444]">Hard</span>
            <span className="text-[10px] font-bold text-[var(--text-primary)]">{profile.hardSolved || 0}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-[var(--bg-hover)] rounded-xl">
          <div className="text-[10px] text-[var(--text-muted)] mb-1">Streak</div>
          <div className="text-sm font-bold text-[var(--text-primary)]">{profile.streak || 0} <span className="text-[10px] font-normal text-[var(--text-muted)]">days</span></div>
        </div>
        <div className="p-3 bg-[var(--bg-hover)] rounded-xl">
          <div className="text-[10px] text-[var(--text-muted)] mb-1">Last Sync</div>
          <div className="text-sm font-bold text-[var(--text-primary)]">{lastSync}</div>
        </div>
      </div>
    </div>
  )
}

function AchievementBadge({ badge }) {
  return (
    <div className={`flex flex-col items-center gap-2 p-4 rounded-2xl border transition-all ${
      badge.earned
        ? 'bg-[var(--bg-card)] border-[var(--cyan)]/30 shadow-[0_0_12px_rgba(34,211,238,0.08)]'
        : 'bg-[var(--bg-hover)]/30 border-[var(--border)] opacity-40 grayscale'
    }`}>
      <span className="text-2xl">{badge.icon}</span>
      <div className="text-center">
        <div className="text-[10px] font-bold text-[var(--text-primary)]">{badge.label}</div>
        <div className="text-[8px] text-[var(--text-muted)] mt-0.5">{badge.desc}</div>
      </div>
      {badge.earned && (
        <div className="flex items-center gap-1">
          <CheckCircle size={10} className="text-[var(--green)]" />
          <span className="text-[8px] font-bold text-[var(--green)]">Earned</span>
        </div>
      )}
    </div>
  )
}

/* ─── Main Page ─── */

export default function Profile() {
  const { user } = useAuth()
  const navigate  = useNavigate()
  const [profiles, setProfiles]     = useState([])
  const [isLoading, setIsLoading]   = useState(true)
  const [isSyncing, setIsSyncing]   = useState(false)

  useEffect(() => { fetchData() }, [])

  const fetchData = async () => {
    try {
      const res = await api.get('/profiles')
      setProfiles(res.data)
    } catch (e) { console.error(e) }
    finally     { setIsLoading(false) }
  }

  const handleSyncAll = async () => {
    setIsSyncing(true)
    try {
      await Promise.all(profiles.map(p => api.put(`/profiles/${p._id}/refresh`)))
      await fetchData()
    } catch (e) { console.error(e) }
    finally     { setIsSyncing(false) }
  }

  /* ── Derived stats ── */
  const totalSolved   = useMemo(() => profiles.reduce((s, p) => s + (p.solvedQuestions || 0), 0), [profiles])
  const analyzedDNA   = useMemo(() => profiles.reduce((s, p) => s + (p.recentSubmissions?.length || 0), 0), [profiles])
  const maxStreak     = useMemo(() => Math.max(...profiles.map(p => p.streak || 0), 0), [profiles])
  const { rank, color: rankColor } = useMemo(() => getMasteryRank(totalSolved), [totalSolved])
  const { score: masteryScore, percentile } = useMemo(() => computeMasteryScore(profiles), [profiles])
  const codingDNA     = useMemo(() => buildCodingDNA(profiles), [profiles])
  const skillProgress = useMemo(() => buildSkillProgress(profiles), [profiles])
  const revisions     = useMemo(() => buildRevisions(profiles), [profiles])
  const achievements  = useMemo(() => getAchievements(profiles, totalSolved, maxStreak), [profiles, totalSolved, maxStreak])

  const aiInsight = useMemo(() => {
    const allWeak = profiles.flatMap(p => p.weakAreas || [])
    if (!allWeak.length) return 'Sync your platforms to generate personalized AI coaching insights.'
    const worst = [...allWeak].sort((a, b) => (a.attempts || 0) - (b.attempts || 0))[0]
    const allStrong = profiles.flatMap(p => p.strongAreas || [])
    const best = allStrong.sort((a, b) => (b.attempts || 0) - (a.attempts || 0))[0]
    return `💡 You excel in ${best?.topic || 'core algorithms'} but ${worst.topic} (${worst.attempts || 0} problems) is your biggest gap. Bridging this will unlock your next mastery tier.`
  }, [profiles])

  const statCards = [
    { label: 'Total Solved',  value: totalSolved, icon: <Code size={20} />,   color: 'var(--cyan)' },
    { label: 'Tracked Subs',  value: analyzedDNA,  icon: <Layers size={20} />, color: 'var(--purple)' },
    { label: 'Mastery Rank',  value: rank,         icon: <Trophy size={20} />, color: rankColor },
    { label: 'Best Streak',   value: `${maxStreak}d`, icon: <Zap size={20} />, color: 'var(--orange)' },
  ]

  if (isLoading) return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-[var(--cyan)] border-t-transparent animate-spin" />
    </div>
  )

  return (
    <PageWrapper>
      <div className="max-w-6xl mx-auto space-y-10">

        {/* ── HERO ── */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--purple-dark)] via-[var(--bg-card)] to-[var(--cyan-dark)] rounded-3xl opacity-40 blur-2xl -z-10" />
          <div className="flex flex-col md:flex-row items-center gap-8 p-8 bg-[var(--bg-card)]/50 backdrop-blur-xl border border-[var(--border)] rounded-3xl">
            
            <div className="relative group shrink-0">
              <div className="w-28 h-28 rounded-3xl bg-gradient-to-br from-[var(--purple)] to-[var(--cyan)] p-1 transition-transform duration-500 group-hover:rotate-3">
                <div className="w-full h-full bg-zinc-950 rounded-[calc(1.5rem-4px)] flex items-center justify-center overflow-hidden">
                  {user?.image
                    ? <img src={user.image} className="w-full h-full object-cover" alt="avatar" />
                    : <User size={44} className="text-zinc-600" />
                  }
                </div>
              </div>
              <div className="absolute -bottom-2 -right-2 p-2 rounded-xl shadow-lg" style={{ backgroundColor: rankColor }}>
                <Shield size={14} className="text-white" />
              </div>
            </div>

            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-[var(--text-primary)] font-['Space_Grotesk']">{user?.name}</h1>
                <span className="self-start px-3 py-1 text-[10px] font-bold rounded-full border uppercase tracking-widest"
                  style={{ color: rankColor, borderColor: `${rankColor}40`, background: `${rankColor}15` }}>
                  {rank} Rank
                </span>
              </div>
              <p className="text-[var(--text-secondary)] text-sm mb-5 leading-relaxed max-w-lg">
                {totalSolved > 0
                  ? aiInsight
                  : 'Connect your first coding platform via the Dashboard to unlock AI-powered insights.'}
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <div className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-hover)] rounded-xl border border-[var(--border)]">
                  <div className="w-2 h-2 bg-[var(--green)] rounded-full animate-pulse" />
                  <span className="text-xs font-bold text-[var(--text-secondary)]">{profiles.length} Platform{profiles.length !== 1 ? 's' : ''} Connected</span>
                </div>
                <button
                  onClick={handleSyncAll}
                  disabled={isSyncing || profiles.length === 0}
                  className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-hover)] hover:bg-[var(--bg-card)] rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] transition-all disabled:opacity-50"
                >
                  <RefreshCw size={12} className={isSyncing ? 'animate-spin' : ''} />
                  {isSyncing ? 'Syncing...' : 'Sync All Platforms'}
                </button>
                <Link to="/dashboard" className="flex items-center gap-2 px-4 py-2 bg-[var(--bg-hover)] hover:bg-[var(--bg-card)] rounded-xl border border-[var(--border)] text-xs font-bold text-[var(--text-secondary)] transition-all">
                  <Settings size={12} /> Manage Platforms
                </Link>
              </div>
            </div>

            {/* Mastery Score */}
            <div className="shrink-0 flex flex-col items-center justify-center p-6 bg-gradient-to-br from-[var(--cyan)]/10 to-[var(--purple)]/10 border border-[var(--cyan)]/20 rounded-2xl min-w-[140px]">
              <span className="text-[9px] font-bold text-[var(--cyan)] uppercase tracking-[0.2em] mb-1">Unified Mastery</span>
              <span className="text-5xl font-black text-[var(--text-primary)] font-['Space_Grotesk']">{masteryScore}</span>
              <div className="flex items-center gap-1 text-[10px] font-bold text-[var(--green)] mt-1">
                <Activity size={10} /> Top {percentile}%
              </div>
              <div className="mt-2 text-[9px] text-[var(--text-muted)] text-center">{totalSolved} total problems</div>
            </div>
          </div>
        </div>

        {/* ── STAT CARDS + SKILL PROGRESSION ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statCards.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-2xl flex flex-col items-center text-center group hover:border-[var(--cyan)]/40 transition-all"
            >
              <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform"
                style={{ backgroundColor: `${s.color}18`, color: s.color }}>
                {s.icon}
              </div>
              <div className="text-xl font-bold text-[var(--text-primary)] mb-0.5 font-['Space_Grotesk']">{s.value}</div>
              <div className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{s.label}</div>
            </motion.div>
          ))}
        </div>

        {/* ── SKILL PROGRESSION + DNA RADAR ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <Target size={100} className="text-[var(--cyan)]" />
            </div>
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-6 font-['Space_Grotesk'] flex items-center gap-2">
              <TrendingUp size={18} className="text-[var(--cyan)]" />
              Focused Skill Progression
              <span className="px-2 py-0.5 bg-[var(--cyan)] text-white text-[8px] rounded font-bold ml-1">LIVE</span>
            </h3>
            {skillProgress.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-10 text-center">
                <AlertCircle size={28} className="text-[var(--text-muted)] opacity-40" />
                <p className="text-sm text-[var(--text-muted)]">Sync your platforms to populate skill data.</p>
              </div>
            ) : (
              <div className="space-y-5">
                {skillProgress.map((skill, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-[var(--text-secondary)]">{skill.label}</span>
                      <span className="text-xs font-bold" style={{ color: skill.color }}>{skill.score}%</span>
                    </div>
                    <div className="h-2.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }} animate={{ width: `${skill.score}%` }}
                        transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: skill.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-3xl flex flex-col">
            <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-widest mb-6 flex items-center gap-2">
              <Brain size={16} className="text-[var(--orange)]" /> Coding DNA
            </h3>
            <div className="flex-1 flex items-center justify-center min-h-[220px]">
              <PsychologyRadar data={codingDNA} hideTitle />
            </div>
          </div>
        </div>

        {/* ── CONNECTED PLATFORM CARDS ── */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-[var(--text-primary)] font-['Space_Grotesk'] flex items-center gap-2">
              <Code size={20} className="text-[var(--cyan)]" /> Platform Performance
            </h2>
            <Link to="/dashboard" className="flex items-center gap-1 text-xs font-bold text-[var(--cyan)] hover:underline">
              Add Platform <ChevronRight size={14} />
            </Link>
          </div>
          {profiles.length === 0 ? (
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-16 flex flex-col items-center gap-4 text-center">
              <Code size={40} className="text-[var(--text-muted)] opacity-30" />
              <h3 className="font-bold text-[var(--text-primary)]">No platforms connected</h3>
              <p className="text-sm text-[var(--text-muted)]">Go to Dashboard and click CONNECT_ACCOUNT to add your first profile.</p>
              <Link to="/dashboard" className="px-6 py-2 bg-[var(--cyan)] text-white rounded-xl font-bold text-sm hover:bg-[var(--cyan-dark)] transition-all">
                Go to Dashboard
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profiles.map((p, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
                  <PlatformCard profile={p} onNavigate={(id) => navigate(`/analysis/${id}`)} />
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* ── ACHIEVEMENTS + REVISION ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Achievements */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-3xl">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-6 font-['Space_Grotesk'] flex items-center gap-2">
              <Award size={18} className="text-[var(--orange)]" /> Achievements
              <span className="ml-auto text-[10px] font-bold text-[var(--text-muted)]">
                {achievements.filter(a => a.earned).length}/{achievements.length} earned
              </span>
            </h3>
            <div className="grid grid-cols-4 gap-3">
              {achievements.map(badge => <AchievementBadge key={badge.id} badge={badge} />)}
            </div>
          </div>

          {/* Needs Revision */}
          <div className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-3xl">
            <h3 className="text-base font-bold text-[var(--text-primary)] mb-6 font-['Space_Grotesk'] flex items-center gap-2">
              <BookOpen size={18} className="text-[var(--purple)]" /> Needs Revision
            </h3>
            {revisions.length === 0 ? (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <CheckCircle size={28} className="text-[var(--green)] opacity-70" />
                <p className="text-sm font-bold text-[var(--text-primary)]">All caught up!</p>
                <p className="text-xs text-[var(--text-muted)]">No failed problems found. Keep up the great work.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {revisions.map((rev, i) => (
                  <div key={i}
                    onClick={() => navigate(`/analysis/${rev.profileId}/question/${rev.id}`)}
                    className="flex items-center gap-4 p-4 bg-[var(--bg-hover)]/30 border border-[var(--border)] rounded-2xl cursor-pointer hover:border-[var(--cyan)]/30 hover:bg-[var(--bg-hover)]/50 transition-all group"
                  >
                    <div className={`w-2 h-2 rounded-full shrink-0 ${rev.priority === 'High' ? 'bg-[var(--red)]' : rev.priority === 'Medium' ? 'bg-[var(--orange)]' : 'bg-[var(--green)]'}`} />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[var(--text-primary)] group-hover:text-[var(--cyan)] transition-colors truncate">{rev.title}</h4>
                      <p className="text-[10px] text-[var(--text-muted)] uppercase">{rev.topic} · {rev.platform}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[10px] font-bold text-[var(--red)]">{rev.accuracy}% acc</div>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${rev.priority === 'High' ? 'text-[var(--red)] bg-[var(--red)]/10' : rev.priority === 'Medium' ? 'text-[var(--orange)] bg-[var(--orange)]/10' : 'text-[var(--green)] bg-[var(--green)]/10'}`}>
                        {rev.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
    </PageWrapper>
  )
}
