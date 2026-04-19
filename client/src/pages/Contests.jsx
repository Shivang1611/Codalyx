import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import PageWrapper from '../components/shared/PageWrapper.jsx'
import api from '../utils/api.js'
import { Calendar, Trophy, Zap, Bell, CheckCircle2, ChevronRight, Clock, Award, History } from 'lucide-react'
import { toast } from 'sonner'
import PlatformLogo from '../components/shared/PlatformLogo.jsx'
import { formatDistanceToNow, format } from 'date-fns'

export default function Contests() {
  const [upcoming, setUpcoming] = useState([])
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('upcoming')

  useEffect(() => {
    fetchData()
  }, [])

  // Automated Reminders: Check for contests starting within 2 hours
  useEffect(() => {
    if (upcoming.length > 0) {
      const soon = upcoming.find(c => {
        const diff = (new Date(c.startTime) - new Date()) / (1000 * 60)
        return diff > 0 && diff <= 120 // Starts in 0-2 hours
      })
      if (soon) {
        toast(`🚀 ${soon.title} in 2 hours!`, {
          description: `Get ready for the ${soon.platform} Arena. Check your local setup.`,
          duration: 10000,
          action: {
            label: 'Open Arena',
            onClick: () => window.open(soon.url, '_blank')
          }
        })
      }
    }
  }, [upcoming])

  const fetchData = async () => {
    try {
      const [uRes, hRes] = await Promise.all([
        api.get('/contests/upcoming'),
        api.get('/contests/history')
      ])
      setUpcoming(uRes.data)
      setHistory(hRes.data)
    } catch (err) {
      toast.error('Failed to load contest stream')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (contestId) => {
    try {
      await api.post(`/contests/${contestId}/register`)
      toast.success('Registration sync completed!')
      fetchData()
    } catch (err) {
      toast.error('Sync failed')
    }
  }

  if (isLoading) return <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-[var(--cyan)] border-t-transparent animate-spin" /></div>

  return (
    <PageWrapper>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* GAMIFICATION HEADER */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 relative overflow-hidden group hover:border-[var(--cyan)]/30 transition-all shadow-[var(--shadow-card)]">
             <div className="absolute -right-4 -top-4 w-24 h-24 bg-[var(--cyan)]/8 rounded-full blur-3xl group-hover:bg-[var(--cyan)]/15 transition-all" />
             <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-[var(--cyan-glow)] rounded-2xl flex items-center justify-center text-[var(--cyan)]">
                 <Zap size={24} />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-[var(--text-primary)] font-['Space_Grotesk']">7 Day Streak</h3>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Weekly Warrior Active</p>
               </div>
             </div>
             <p className="text-xs text-[var(--text-secondary)]">You're in the top 5% of consistent participants this month.</p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 relative overflow-hidden group hover:border-[var(--cyan)]/30 transition-all shadow-[var(--shadow-card)]">
             <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-[var(--cyan-glow)] rounded-2xl flex items-center justify-center text-[var(--cyan)]">
                 <Trophy size={24} />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-[var(--text-primary)] font-['Space_Grotesk']">Ranking +312</h3>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Global Improvement</p>
               </div>
             </div>
             <p className="text-xs text-[var(--text-secondary)]">Your performance in LC Weekly 444 boosted your tier standing.</p>
          </div>

          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 relative overflow-hidden group hover:border-[var(--cyan)]/30 transition-all shadow-[var(--shadow-card)]">
             <div className="flex items-center gap-4 mb-4">
               <div className="w-12 h-12 bg-[var(--cyan-glow)] rounded-2xl flex items-center justify-center text-[var(--cyan)]">
                 <Award size={24} />
               </div>
               <div>
                  <h3 className="text-2xl font-black text-[var(--text-primary)] font-['Space_Grotesk']">12 Badges</h3>
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Achievements unlocked</p>
               </div>
             </div>
             <p className="text-xs text-[var(--text-secondary)]">Next: "Contest Crusader" - complete 3 more Codeforces rounds.</p>
          </div>
        </div>

        {/* NAVIGATION & TABS */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)] font-['Space_Grotesk'] tracking-tight">Arena & Tournaments</h1>
            <p className="text-sm text-[var(--text-muted)] mt-1">Global competitive programming schedule and tracking.</p>
          </div>
          <div className="flex bg-[var(--bg-card)] border border-[var(--border)] p-1 rounded-2xl">
            {[
              { id: 'upcoming', label: 'Upcoming', icon: <Clock size={16} /> },
              { id: 'history', label: 'Your History', icon: <History size={16} /> },
            ].map(t => (
              <button 
                key={t.id} 
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === t.id ? 'bg-[var(--cyan)] text-white shadow-lg shadow-[var(--cyan-glow)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}
              >
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* CONTENT AREA */}
        <AnimatePresence mode="wait">
          {activeTab === 'upcoming' ? (
            <motion.div 
              key="upcoming" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {upcoming.map((c, i) => (
                <div key={i} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 hover:border-[var(--cyan)]/30 transition-all group">
                   <div className="flex items-center justify-between mb-6">
                     <div className="flex items-center gap-3">
                       <PlatformLogo platform={c.platform} size="w-8 h-8" />
                       <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{c.platform}</span>
                     </div>
                     <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[var(--cyan-glow)] rounded-full border border-[var(--cyan)]/20">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--cyan)] animate-pulse" />
                        <span className="text-[9px] font-bold text-[var(--cyan)]">LIVE SOON</span>
                     </div>
                   </div>

                   <h4 className="text-lg font-bold text-[var(--text-primary)] mb-2 group-hover:text-[var(--cyan)] transition-colors">{c.title}</h4>
                   <div className="flex flex-col gap-2 mb-8">
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <Calendar size={14} className="text-[var(--cyan)]" />
                        {format(new Date(c.startTime), 'MMM d, h:mm a')}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
                        <Clock size={14} className="text-[var(--purple)]" />
                        Starts in {formatDistanceToNow(new Date(c.startTime))}
                      </div>
                   </div>

                   <div className="flex items-center gap-3">
                      <button 
                        onClick={() => handleRegister(c._id)}
                        className={`flex-grow py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${c.userStatus === 'REGISTERED' ? 'bg-[var(--bg-hover)] text-[var(--cyan)] border border-[var(--cyan)]/20 shadow-inner' : 'bg-[var(--bg-hover)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--cyan)] hover:text-white hover:border-transparent'}`}
                      >
                         {c.userStatus === 'REGISTERED' ? <><CheckCircle2 size={14} /> Registered</> : 'Sync Registration'}
                      </button>
                      <a href={c.url} target="_blank" rel="noreferrer" className="p-3 bg-[var(--bg-hover)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors">
                        <ChevronRight size={18} />
                      </a>
                   </div>
                </div>
              ))}
            </motion.div>
          ) : (
            <motion.div 
              key="history" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-[var(--border)]">
                      <th className="px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Contest</th>
                      <th className="px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Performance</th>
                      <th className="px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Rating Change</th>
                      <th className="px-6 py-5 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Insights</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-subtle)]">
                    {history.length > 0 ? history.map((h, i) => (
                      <tr key={i} className="hover:bg-[var(--bg-hover)]/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <PlatformLogo platform={h.contestId.platform} size="w-6 h-6" />
                            <div>
                               <p className="text-sm font-bold text-[var(--text-primary)]">{h.contestId.title}</p>
                               <p className="text-[10px] text-[var(--text-muted)]">{format(new Date(h.contestId.startTime), 'MMM d, yyyy')}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                           <div className="flex items-center gap-4">
                              <div>
                                <p className="text-sm font-black text-[var(--text-primary)]">{h.rank || 'N/A'}</p>
                                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Rank</p>
                              </div>
                              <div className="w-px h-6 bg-[var(--border)]" />
                              <div>
                                <p className="text-sm font-black text-[var(--cyan)]">{h.solvedCount || 0}/4</p>
                                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Solved</p>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-5">
                           <span className={`text-xs font-bold ${h.ratingChange >= 0 ? 'text-[var(--green)]' : 'text-[var(--red)]'}`}>
                              {h.ratingChange >= 0 ? '+' : ''}{h.ratingChange || 0}
                           </span>
                        </td>
                        <td className="px-6 py-5">
                           <button className="text-[10px] font-black text-[var(--cyan)] uppercase tracking-widest hover:underline">View AI Breakdown</button>
                        </td>
                      </tr>
                    )) : (
                      <tr>
                        <td colSpan="4" className="px-6 py-20 text-center">
                           <Calendar size={40} className="mx-auto text-[var(--text-muted)] mb-4 opacity-30" />
                           <p className="text-[var(--text-secondary)] font-medium">No participation history found yet.</p>
                           <p className="text-[10px] text-[var(--text-muted)] mt-1">Start entering contests to see your analytic trajectory here.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* AUTOMATED REMINDER SIMULATION */}
        <div className="mt-12 bg-[var(--cyan-glow)]/10 border border-[var(--cyan)]/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
           <div className="flex items-center gap-4">
             <div className="p-3 bg-[var(--cyan)] text-white rounded-xl shadow-lg shadow-[var(--cyan-glow)]">
               <Bell size={20} className="animate-bounce" />
             </div>
             <div>
                <p className="text-sm font-bold text-[var(--text-primary)]">Smart Reminders Active</p>
                <p className="text-xs text-[var(--text-secondary)]">We'll alert you 1 hour before LeetCode Weekly and CF rounds.</p>
             </div>
           </div>
           <button className="px-6 py-2.5 bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-primary)] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[var(--cyan)] hover:text-white hover:border-transparent transition-all">Configure Alerts</button>
        </div>
      </div>
    </PageWrapper>
  )
}
