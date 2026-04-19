import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../utils/api.js'
import RevisionCalendar from '../components/revision/RevisionCalendar.jsx'
import StreakCard from '../components/revision/StreakCard.jsx'
import MilestoneCard from '../components/revision/MilestoneCard.jsx'
import ActivityChart from '../components/revision/ActivityChart.jsx'
import PerformanceInsights from '../components/revision/PerformanceInsights.jsx'
import PageWrapper from '../components/shared/PageWrapper.jsx'
import PlatformLogo from '../components/shared/PlatformLogo.jsx'
import { 
  ChevronLeft, Sparkles, Brain, Clock, Zap, BookOpen, 
  Target, GraduationCap, ArrowRight, Star, AlertCircle,
  ExternalLink, CheckCircle2, RefreshCw, Play
} from 'lucide-react'
import { motion } from 'framer-motion'
import { toast } from 'sonner'

export default function RevisionTracker() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [profileId])

  const fetchStats = async () => {
    try {
      const res = await api.get(`/revision/${profileId}`)
      setStats(res.data)
    } catch (err) {
      toast.error('Failed to load revision statistics')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDayToggle = async (date, completed, targetProfileId = null, questionId = null) => {
    try {
      const finalProfileId = targetProfileId || profileId
      
      if (!finalProfileId || finalProfileId === 'total') {
        toast.error('Context Error: Revision must be linked to a specific platform profile.')
        return
      }

      // Optimistic UI Update: 
      // 1. Update calendar array
      // 2. Remove the completed task from the queue locally to give a "checklist" experience
      setStats(prev => {
        const existing = prev.calendar.find(d => d.date === date);
        const newCalendar = existing 
          ? prev.calendar.map(d => d.date === date ? { ...d, completed, questions: completed ? (d.questions || 0) + 1 : 0 } : d)
          : [...prev.calendar, { date, completed, questions: completed ? 1 : 0 }];

        return {
          ...prev,
          calendar: newCalendar,
          overdue: questionId && prev.overdue ? prev.overdue.filter(q => q.id !== questionId) : prev.overdue
        }
      })

      // We ONLY post to backend. We do NOT run `setStats(res.data)` 
      // because `res.data` returns profile-specific stats, which would break 
      // the UI if the user is currently viewing the 'Global / Total' dashboard.
      await api.post(`/revision/${finalProfileId}/day`, { date, completed })
      
      if (completed) toast.success('Task marked as completed!')
    } catch (err) {
      console.error('Revision Log Error:', err.response?.data)
      toast.error('Failed to update revision status')
      fetchStats() // Revert to source of truth if network fails
    }
  }

  if (isLoading) return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[var(--cyan)] border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!stats) return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col items-center justify-center p-6 text-center">
      <Brain size={48} className="text-[var(--text-muted)] mb-4 opacity-20" />
      <h2 className="text-xl font-bold text-[var(--text-primary)]">Data Unavailable</h2>
      <button onClick={() => navigate('/dashboard')} className="mt-6 px-6 py-2 bg-[var(--cyan)] text-white font-bold rounded-xl">Go back to Dashboard</button>
    </div>
  )

  const metrics = [
    { label: 'Platform Streak', value: stats.currentStreak, unit: 'DAYS', icon: '🔥', variant: 'active' },
    { label: 'Longest Sprint', value: stats.bestStreak, unit: 'MAX', icon: '🏆' },
    { label: 'Global Rank', value: stats.totalRevisions > 50 ? 'Elite' : 'Rookie', unit: 'EXP', icon: '👑' },
    { label: 'Daily Accuracy', value: `${stats.completionRate}%`, unit: 'CONSISTENCY', icon: '🎯' },
  ]

  // Extract platform specific quick stats
  const platforms = profileId === 'total' 
    ? Array.from(new Set(stats.overdue?.map(q => q.platform) || [])) 
    : [stats.platform]

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto pb-20">
        <header className="mb-12 relative">
          <button 
            onClick={() => navigate(profileId === 'total' ? '/' : `/analysis/${profileId}`)}
            className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors mb-6 group"
          >
            <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="text-xs font-black uppercase tracking-widest">Back to Engine</span>
          </button>
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[var(--cyan)] to-[var(--purple)] p-0.5 shadow-2xl shadow-[var(--cyan)]/20 overflow-hidden shrink-0">
                <div className="w-full h-full bg-[var(--bg-base)] rounded-[22px] flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--cyan)]/10 to-[var(--purple)]/10" />
                  <Brain size={40} className="text-[var(--text-primary)] relative z-10" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-4xl font-black text-[var(--text-primary)] font-['Space_Grotesk'] tracking-tight">
                    {profileId === 'total' ? 'Global Intelligence' : 'Platform Review'}
                  </h1>
                  <span className="px-2 py-1 rounded bg-[var(--cyan)]/10 text-[var(--cyan)] text-[10px] font-black uppercase tracking-widest border border-[var(--cyan)]/20">v2.0</span>
                </div>
                <div className="flex items-center gap-4">
                  <p className="text-[var(--text-secondary)] font-bold text-sm">Codalyx Precision Revision Engine</p>
                  <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[var(--bg-surface)] border border-[var(--border)] rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--green)] animate-pulse" />
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-tight">Syncing Live Data</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {['LeetCode', 'Codeforces', 'GeeksforGeeks'].map(p => (
                <div key={p} className="w-10 h-10 rounded-xl bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-help opacity-40 hover:opacity-100">
                  <PlatformLogo platform={p} size="w-5 h-5" />
                </div>
              ))}
              <div className="w-px h-10 bg-[var(--border)] mx-2" />
              <button className="h-12 px-6 bg-[var(--cyan)] text-white font-black uppercase tracking-widest text-xs rounded-2xl shadow-lg shadow-[var(--cyan)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
          </div>
        </header>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {metrics.map((m, i) => (
            <StreakCard key={i} {...m} />
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <div className="lg:col-span-8 space-y-12">
            
            {/* Heatmap Section */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-[40px] shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                <Clock size={120} />
              </div>
              <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                  <h3 className="text-xl font-bold text-[var(--text-primary)] font-['Space_Grotesk']">Activity Pipeline</h3>
                  <p className="text-xs text-[var(--text-muted)] font-medium">Historical review and submission density across all platforms.</p>
                </div>
                 <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[var(--bg-hover)]" /> Low</div>
                  <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-[var(--cyan)]" /> High</div>
                </div>
              </div>
              <RevisionCalendar 
                calendar={stats.calendar} 
                profileId={profileId} 
                onUpdate={handleDayToggle} 
              />
            </div>

            {/* Revision Queue */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--cyan)]/10 text-[var(--cyan)] flex items-center justify-center border border-[var(--cyan)]/20 shadow-sm">
                    <Target size={24} className="stroke-[2]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-[var(--text-primary)] font-['Space_Grotesk']">Daily Focus</h2>
                    <p className="text-xs text-[var(--text-muted)] font-medium">Strategic problem solving roadmap.</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[var(--cyan)] uppercase tracking-widest bg-[var(--cyan)]/10 px-3 py-1.5 rounded-full border border-[var(--cyan)]/20">
                  {stats.overdue?.length || 0} Daily Targets
                </span>
              </div>

              <div className="grid grid-cols-1 gap-3">
                {(!stats.overdue || stats.overdue.length === 0) ? (
                  <div className="bg-[var(--bg-card)] border border-dashed border-[var(--border)] p-12 rounded-[32px] flex flex-col items-center text-center">
                    <CheckCircle2 size={40} className="text-[var(--green)] mb-3 opacity-40" />
                    <h3 className="text-sm font-bold text-[var(--text-primary)]">System Optimized</h3>
                    <p className="text-xs text-[var(--text-muted)] mt-1">No critical failures detected in recent activity.</p>
                  </div>
                ) : (
                  stats.overdue.map((q, idx) => (
                    <motion.div 
                      key={`${q.platform}-${q.id || q.title || idx}`}
                      className="group bg-[var(--bg-card)] border border-[var(--border)] p-5 rounded-3xl flex flex-col md:flex-row md:items-center gap-5 hover:border-[var(--cyan)]/40 hover:shadow-xl transition-all relative overflow-hidden"
                    >
                      <div 
                        onClick={() => navigate(`/analysis/${q.profileId}/question/${q.id}`)}
                        className="w-14 h-14 rounded-2xl bg-[var(--bg-surface)] flex items-center justify-center border border-[var(--border)] group-hover:border-[var(--cyan)]/40 hover:scale-105 transition-all cursor-pointer shrink-0"
                      >
                        <PlatformLogo platform={q.platform} size="w-7 h-7" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div 
                          onClick={() => {
                            if (q.platform?.toUpperCase() === 'LEETCODE' && q.id) {
                              window.open(`https://leetcode.com/problems/${q.id}/`, '_blank');
                            } else {
                              navigate(`/analysis/${q.profileId}/question/${q.id}`);
                            }
                          }}
                          className="flex items-center gap-2 cursor-pointer group/link w-fit"
                        >
                          <h4 className="text-base font-bold text-[var(--text-primary)] truncate group-hover/link:text-[var(--cyan)] transition-colors">{q.title}</h4>
                          <ArrowRight size={14} className="text-[var(--text-muted)] group-hover/link:text-[var(--cyan)] transition-colors opacity-0 group-hover/link:opacity-100 -translate-x-2 group-hover/link:translate-x-0" />
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="px-2 py-0.5 rounded-md bg-[var(--bg-hover)] text-[9px] font-black uppercase text-[var(--text-muted)] tracking-wider border border-[var(--border)]">{q.topic}</span>
                          <div className={`flex items-center gap-1 text-[10px] font-bold ${q.difficulty === 'Hard' ? 'text-[var(--red)]' : q.difficulty === 'Medium' ? 'text-[var(--orange)]' : 'text-[var(--green)]'}`}>
                            <Target size={10} /> {q.difficulty}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between md:justify-end gap-5 pt-4 md:pt-0 border-t md:border-t-0 border-[var(--border)] pr-2">
                        <div className="text-right shrink-0">
                          <div className="text-lg font-black text-[var(--red)]">{q.accuracy}%</div>
                          <div className="text-[9px] font-black uppercase text-[var(--text-muted)] tracking-tighter">Precision</div>
                        </div>
                        
                        <button 
                          onClick={() => handleDayToggle(new Date().toISOString().slice(0, 10), true, q.profileId, q.id)}
                          className="w-10 h-10 rounded-full border-2 border-[var(--border)] group-hover:border-[var(--green)]/50 flex items-center justify-center text-[var(--border)] group-hover:text-[var(--green)] hover:bg-[var(--green)] hover:!text-white hover:!border-[var(--green)] transition-all shadow-sm active:scale-90"
                          title="Mark as Complete"
                        >
                          <CheckCircle2 size={20} className="stroke-[2.5]" />
                        </button>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>

            {/* New: Skill Proficiency Radar (Simulated with rich bars) */}
             <div className="space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[var(--purple)]/10 flex items-center justify-center text-[var(--purple)]">
                  <GraduationCap size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[var(--text-primary)] font-['Space_Grotesk']">Mastery Path</h2>
                  <p className="text-xs text-[var(--text-muted)] font-medium">Topic-wise accuracy and roadmap alignment.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {(stats.roadmaps || []).map((roadmap) => (
                  <motion.div 
                    key={roadmap.id} 
                    whileHover={{ scale: 1.02 }}
                    onClick={() => navigate(`/roadmap/${roadmap.id}`)}
                    className="bg-[var(--bg-card)] border border-[var(--border)] p-6 rounded-[32px] hover:border-[var(--purple)]/40 transition-all cursor-pointer group relative overflow-hidden"
                  >
                    <div className="flex justify-between items-start mb-6">
                       <span className="px-3 py-1 rounded-full bg-[var(--purple)]/10 text-[var(--purple)] text-[9px] font-black uppercase tracking-widest border border-[var(--purple)]/20">Roadmap</span>
                       <div className="w-8 h-8 rounded-full bg-[var(--bg-surface)] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                        <Play size={14} className="text-[var(--purple)] translate-x-0.5" />
                       </div>
                    </div>
                    <h3 className="text-xl font-bold text-[var(--text-primary)] font-['Space_Grotesk'] mb-2">{roadmap.title}</h3>
                    <p className="text-[11px] text-[var(--text-secondary)] mb-6 font-medium line-clamp-2">{roadmap.description}</p>
                    <div className="space-y-3">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
                        <span>Overall Progress</span>
                        <span className="text-[var(--text-primary)]">{roadmap.progress}%</span>
                      </div>
                      <div className="h-2 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${roadmap.progress}%` }}
                          className="h-full bg-gradient-to-r from-[var(--purple)] to-[var(--cyan)]"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>

          <div className="lg:col-span-4 space-y-8">
            
            {/* Intensity Card */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-[40px] shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Target size={16} className="text-[var(--cyan)]" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Intensity Map</h3>
              </div>
              <ActivityChart weeklyActivity={stats.weeklyActivity} />
            </div>

             {/* AI Insights Card */}
            <div className="bg-gradient-to-br from-[var(--bg-base)] to-[var(--bg-surface)] border border-[var(--border)] rounded-[40px] p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-5">
                <Sparkles size={80} className="text-[var(--purple)]" />
              </div>
              <div className="flex items-center gap-2 mb-8 relative z-10">
                <Brain size={18} className="text-[var(--purple)]" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Intelligence Log</h3>
              </div>
              <PerformanceInsights insights={stats.insights} />

              <div className="mt-8 pt-8 border-t border-[var(--border)]">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-[var(--cyan)] mb-4">Strategic Directive</h4>
                <div className="space-y-4">
                  {(stats.recommendations || []).map((rec, i) => (
                    <div key={i} className="flex gap-3 group/rec">
                      <div className="w-5 h-5 rounded bg-[var(--cyan)]/10 flex items-center justify-center shrink-0 group-hover/rec:bg-[var(--cyan)] transition-all">
                        <span className="text-[9px] font-black text-[var(--cyan)] group-hover/rec:text-white">{i+1}</span>
                      </div>
                      <p className="text-[11px] font-medium text-[var(--text-secondary)] leading-relaxed group-hover/rec:text-[var(--text-primary)]">
                        {rec}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Milestones Panel */}
            <div className="bg-[var(--bg-card)] border border-[var(--border)] p-8 rounded-[40px] shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-2">
                  <Zap size={16} className="text-[var(--orange)]" />
                  <h3 className="text-xs font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Career Badges</h3>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {stats.milestones.map(m => (
                  <MilestoneCard key={m.id} milestone={m} />
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>
    </PageWrapper>
  )
}
