import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import api from '../utils/api.js'
import PageWrapper from '../components/shared/PageWrapper.jsx'
import WeakAreasChart from '../components/analyzer/WeakAreasChart.jsx'
import ProgressTrendChart from '../components/analyzer/ProgressTrendChart.jsx'
import QuestionsTable from '../components/analyzer/QuestionsTable.jsx'
import ResourceList from '../components/shared/ResourceList.jsx'
import WeaknessIntelligenceDash from '../components/analyzer/WeaknessIntelligenceDash.jsx'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Database, Activity, Calendar, Award, RefreshCw, AlertTriangle, Search, Terminal, GitBranch, Code2 } from 'lucide-react'
import { toast } from 'sonner'

// Derive relevant learning resources from actual weak areas
function buildDynamicResources(weakAreas = []) {
  const topicResourceMap = {
    'Dynamic Programming': [
      { type: 'Video', title: 'DP for Beginners - Full Course', source: 'NeetCode', duration: '45m', url: 'https://www.youtube.com/watch?v=73r3KWiW5Ps' },
      { type: 'Article', title: 'Dynamic Programming Patterns', source: 'LeetCode Discuss', length: '12 min read', url: 'https://leetcode.com/discuss/general-discussion/475924/my-experience-and-notes-for-learning-dp' }
    ],
    'Graph': [
      { type: 'Video', title: 'BFS vs DFS: When to use which?', source: 'Codalyx Academy', duration: '15m', url: 'https://www.youtube.com/watch?v=pcKY4hjDrxk' },
    ],
    'Tree': [
      { type: 'Video', title: 'Binary Trees in One Video', source: 'NeetCode', duration: '20m', url: 'https://www.youtube.com/watch?v=fAAZixBzIAI' },
    ],
    'Sorting': [
      { type: 'Video', title: 'Sorting Algorithms Visualized', source: 'Sorting.at', duration: '10m', url: 'https://www.youtube.com/watch?v=kgBjXUE_Nwc' }
    ],
    'Binary Search': [
      { type: 'Video', title: 'Binary Search Made Easy', source: 'NeetCode', duration: '12m', url: 'https://www.youtube.com/watch?v=s4DPM8ct1pI' }
    ]
  }

  const defaultResources = [
    { type: 'Video', title: 'Algorithmic Thinking for Interviews', source: 'TechDose', duration: '22m', url: 'https://www.youtube.com/watch?v=JUEnef9_hCk' },
    { type: 'Article', title: 'LeetCode Patterns to Ace Any Interview', source: 'LeetCode Discuss', length: '15 min read', url: 'https://leetcode.com/discuss/general-discussion/665604/important-and-useful-links-from-users-latest' },
  ]

  if (!weakAreas || !weakAreas.length) return defaultResources

  const worstTopics = [...weakAreas].sort((a, b) => a.accuracy - b.accuracy).slice(0, 3)
  const resources = []

  worstTopics.forEach(area => {
    const topicKey = Object.keys(topicResourceMap).find(k =>
      area.topic?.toLowerCase().includes(k.toLowerCase()) ||
      k.toLowerCase().includes(area.topic?.toLowerCase())
    )
    if (topicKey && topicResourceMap[topicKey]) {
      topicResourceMap[topicKey].forEach(r => {
        if (!resources.find(existing => existing.title === r.title)) {
          resources.push(r)
        }
      })
    }
  })

  return resources.length > 0 ? resources : defaultResources
}

function getLanguageColor(lang) {
  const colors = {
    'JavaScript': '#f1e05a', 'TypeScript': '#3178c6', 'Python': '#3572A5', 'Java': '#b07219',
    'C++': '#f34b7d', 'PHP': '#4F5D95', 'Ruby': '#701516', 'Go': '#00ADD8', 'Rust': '#dea584',
    'Swift': '#F05138', 'Kotlin': '#A97BFF', 'HTML': '#e34c26', 'CSS': '#563d7c', 'C#': '#178600'
  }
  return colors[lang] || '#6e7681'
}

export default function Analyzer() {
  const { profileId } = useParams()
  const navigate = useNavigate()
  const [profile, setProfile] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [topicFilter, setTopicFilter] = useState('All')
  const [difficultyFilter, setDifficultyFilter] = useState('All')

  useEffect(() => {
    fetchProfile()
  }, [profileId])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profiles')
      const target = res.data.find(p => p._id === profileId)
      if (!target) {
        toast.error('Profile not found')
        navigate('/dashboard')
        return
      }
      setProfile(target)
    } catch (err) {
      toast.error('Failed to load profile data')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsSyncing(true)
    try {
      await api.put(`/profiles/${profileId}/refresh`)
      await fetchProfile()
      toast.success('Profile synced successfully!')
    } catch (err) {
      toast.error('Sync failed. Try again.')
    } finally {
      setIsSyncing(false)
    }
  }

  const allQuestions = useMemo(() => {
    return (profile?.recentSubmissions || []).map(sub => ({
      id: sub.id || sub._id,
      title: sub.title || 'Untitled Activity',
      difficulty: sub.difficulty || 'Medium',
      topic: sub.topic || 'General',
      accuracy: sub.accuracy != null ? sub.accuracy : (sub.status === 'Accepted' ? 100 : 0),
      attempts: sub.attempts || 1,
      status: sub.status || 'Unknown',
      timestamp: sub.timestamp,
      lastAttempted: sub.timestamp ? new Date(sub.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Recently'
    }))
  }, [profile])

  const commitHistory = useMemo(() => {
    if (profile?.platform !== 'GITHUB') return []
    const groups = {}
    allQuestions.forEach(q => {
      const date = new Date(q.timestamp)
      const key = date.toLocaleString('default', { month: 'long', year: 'numeric' })
      if (!groups[key]) groups[key] = []
      groups[key].push(q)
    })
    return Object.entries(groups).sort((a, b) => new Date(b[0]) - new Date(a[0]))
  }, [allQuestions, profile])

  const uniqueTopics = useMemo(() => {
    const topics = [...new Set(allQuestions.map(q => q.topic).filter(Boolean))]
    return ['All', ...topics.sort()]
  }, [allQuestions])

  const displayQuestions = useMemo(() => {
    return allQuestions.filter(q => {
      const isAll = topicFilter === 'All' || topicFilter === ''
      const matchTopic = isAll || q.topic.toLowerCase().includes(topicFilter.toLowerCase()) || q.title.toLowerCase().includes(topicFilter.toLowerCase())
      const matchDifficulty = difficultyFilter === 'All' || q.difficulty === difficultyFilter
      return matchTopic && matchDifficulty
    })
  }, [allQuestions, topicFilter, difficultyFilter])

  const isGithub = profile?.platform === 'GITHUB'
  const tabs = [
    { id: 'overview', label: 'Intelligence Overview', icon: <Award size={18} /> },
    { id: 'questions', label: isGithub ? 'Project Registry' : 'Problem Repository', icon: <Database size={18} /> },
  ]

  if (isLoading) return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-4 border-[var(--cyan)] border-t-transparent animate-spin" />
    </div>
  )

  if (!profile) return (
    <div className="min-h-screen bg-[var(--bg-base)] flex items-center justify-center flex-col gap-4">
      <AlertTriangle size={40} className="text-[var(--orange)]" />
      <p className="text-[var(--text-secondary)]">Profile not found.</p>
    </div>
  )

  return (
    <PageWrapper>
      <div className="mb-10">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors mb-6 group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs font-bold uppercase tracking-widest text-[#94a3b8]">Back to Dashboard</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-xl ${isGithub ? 'bg-[#1a1a1a] border border-white/5' : 'bg-gradient-to-br from-[var(--purple)] to-[var(--cyan)] shadow-[var(--purple-glow)]'}`}>
              {isGithub ? <Code2 size={32} className="text-white" /> : <Activity size={32} className="text-white" />}
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-3xl font-bold text-[var(--text-primary)] font-['Space_Grotesk'] tracking-tight">{profile.username}</h1>
                <span className="px-2 py-0.5 bg-[var(--cyan-glow)] text-[var(--cyan)] text-[10px] font-bold rounded uppercase border border-[var(--cyan)]/20">{profile.platform}</span>
              </div>
              <p className="text-[var(--text-secondary)] font-medium">
                {isGithub 
                  ? `${profile.githubData?.publicRepos || 0} repositories · ${profile.githubData?.totalStars || 0} stars collected`
                  : `${allQuestions.length} problems analyzed · ${allQuestions.filter(q => q.status === 'Accepted').length} accepted`
                }
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleRefresh} disabled={isSyncing} className="p-2.5 bg-[var(--bg-card)] border border-[var(--border)] rounded-xl text-[var(--text-muted)] hover:text-[var(--cyan)] transition-colors">
              <RefreshCw size={18} className={isSyncing ? 'animate-spin text-[var(--cyan)]' : ''} />
            </button>
            <div className="flex bg-[var(--bg-card)] border border-[var(--border)] p-1 rounded-2xl">
              {tabs.map(t => (
                <button key={t.id} onClick={() => setActiveTab(t.id)} className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${activeTab === t.id ? 'bg-[var(--cyan)] text-white shadow-lg shadow-[var(--cyan-glow)]' : 'text-[var(--text-secondary)] hover:bg-[var(--bg-hover)]'}`}>
                  {t.icon} <span className="hidden sm:inline">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Stats Column */}
            <div className="lg:col-span-4 space-y-8">
              {isGithub ? (
                <>
                  <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6">
                    <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-6">Activity metrics</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Commits', val: profile.githubData?.activityStats?.commits || 0, icon: <Terminal size={14} />, color: 'var(--cyan)' },
                        { label: 'Repos', val: profile.githubData?.publicRepos || 0, icon: <Database size={14} />, color: 'var(--purple)' },
                        { label: 'Followers', val: profile.githubData?.followers || 0, icon: <Activity size={14} />, color: 'var(--green)' },
                        { label: 'Stars', val: profile.githubData?.totalStars || 0, icon: <Award size={14} />, color: 'var(--orange)' },
                      ].map((item, i) => (
                        <div key={i} className="bg-[var(--bg-hover)]/30 border border-[var(--border-subtle)] p-4 rounded-2xl">
                          <span style={{ color: item.color }}>{item.icon}</span>
                          <p className="text-xl font-black text-[var(--text-primary)] mt-1">{item.val}</p>
                          <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase mt-1">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6">
                    <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-6">Tech Stack</h3>
                    <div className="space-y-4">
                      {profile.githubData?.topLanguages?.map((lang, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs font-bold mb-1.5">
                            <span className="text-[var(--text-primary)] flex items-center gap-2">
                              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: lang.color }} /> {lang.name}
                            </span>
                            <span className="text-[var(--text-muted)]">{lang.percentage}%</span>
                          </div>
                          <div className="h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${lang.percentage}%` }} className="h-full" style={{ backgroundColor: lang.color }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <ProgressTrendChart profile={profile} />
                  <WeakAreasChart weakAreas={profile?.weakAreas || []} strongAreas={profile?.strongAreas || []} />
                </>
              )}
            </div>

            {/* Content Column */}
            <div className="lg:col-span-8 space-y-8">
              {isGithub ? (
                <>
                  <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Contribution Matrix</h3>
                    </div>
                    <div className="flex gap-1.5 overflow-x-auto pb-4 scrollbar-hide">
                      {Array.from({ length: 48 }).map((_, i) => (
                        <div key={i} className="flex flex-col gap-1.5 shrink-0">
                          {Array.from({ length: 7 }).map((_, j) => (
                            <div key={j} className="w-[12px] h-[12px] rounded-sm" style={{ backgroundColor: 'var(--cyan)', opacity: Math.random() > 0.7 ? (Math.random() * 0.9 + 0.1) : 0.05 }} />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6">
                    <h3 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mb-8">Development Chronology</h3>
                    <div className="space-y-10">
                      {commitHistory.map(([month, activities], idx) => (
                        <div key={idx} className="relative pl-6 border-l border-[var(--border)]">
                          <div className="absolute top-0 left-[-4.5px] w-2 h-2 rounded-full bg-[var(--cyan)] shadow-[0_0_10px_var(--cyan)]" />
                          <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-wider mb-6">{month}</h4>
                          <div className="space-y-4">
                            {activities.map((act, i) => (
                              <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                  <div className="p-2 bg-[var(--bg-hover)] rounded-xl text-[var(--text-secondary)] group-hover:text-[var(--cyan)] transition-colors">
                                    {act.status === 'Pushed' ? <GitBranch size={14} /> : <Code2 size={14} />}
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--cyan)] transition-colors">{act.title}</p>
                                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{act.lastAttempted}</p>
                                  </div>
                                </div>
                                <div className="text-[10px] font-black text-[var(--cyan)] bg-[var(--cyan-glow)] px-2 py-1 rounded-lg border border-[var(--cyan)]/10">{act.attempts} {act.attempts === 1 ? 'commit' : 'commits'}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="lg:col-span-2 space-y-8">
                  <div className="bg-gradient-to-br from-[var(--purple)] to-[var(--cyan)] p-1 rounded-3xl shadow-xl shadow-[var(--purple-glow)]">
                    <div className="bg-[var(--bg-surface)] rounded-[calc(1.5rem-2px)] p-8">
                      <h3 className="text-xl font-bold text-[var(--text-primary)] mb-2 font-['Space_Grotesk']">AI Performance Forecast</h3>
                      <p className="text-[var(--text-secondary)] mb-4 text-sm leading-relaxed">
                        Improve your efficiency by focusing on your weakest topics.
                      </p>
                      <Link to={`/analysis/${profileId}/revision`} className="inline-flex items-center gap-2 text-[var(--cyan)] font-bold text-sm hover:underline">
                        View Targeted Roadmap <ChevronRight size={16} />
                      </Link>
                    </div>
                  </div>
                  <WeaknessIntelligenceDash weakAreas={profile?.weakAreas || []} />
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div key="questions" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] font-['Space_Grotesk'] tracking-tight">{isGithub ? 'Technical Repositories' : 'Problem Repository'}</h2>
                <p className="text-sm text-[var(--text-muted)] mt-1">{isGithub ? 'Project-level source code analysis' : 'Conceptual mastery logs'}</p>
              </div>
              <div className="relative group min-w-[300px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--cyan)] transition-colors" size={16} />
                <input type="text" placeholder="Search..." className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl pl-12 pr-4 py-3 text-sm font-medium text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan)] transition-all" onChange={(e) => setTopicFilter(e.target.value)} />
              </div>
            </div>

            {isGithub ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {(profile.githubData?.allRepos || []).filter(r => {
                  const isAll = topicFilter === 'All' || topicFilter === ''
                  return isAll || r.name.toLowerCase().includes(topicFilter.toLowerCase())
                }).map((repo, i) => (
                  <motion.a key={i} href={repo.url} target="_blank" whileHover={{ scale: 1.02 }} className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-7 hover:border-[var(--cyan)] transition-all flex flex-col h-full gap-5 group">
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 bg-[var(--bg-hover)] rounded-xl flex items-center justify-center text-[var(--text-secondary)] group-hover:text-[var(--cyan)] group-hover:bg-[var(--cyan-glow)] transition-all">
                        <Database size={20} />
                      </div>
                      {repo.isFork && <span className="text-[8px] font-black bg-[var(--bg-hover)] text-[var(--text-muted)] px-1.5 py-0.5 rounded tracking-[0.1em]">FORKED</span>}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-bold text-[var(--text-primary)] text-lg mb-2">{repo.name}</h4>
                      <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-3">{repo.description || "Technical project implementation."}</p>
                    </div>
                    <div className="pt-5 border-t border-[var(--border-subtle)] flex items-center justify-between">
                      <div className="flex gap-4"><span className="text-[10px] font-bold text-[var(--text-muted)]">⭐ {repo.stars}</span><span className="text-[10px] font-bold text-[var(--text-muted)]">🍴 {repo.forks}</span></div>
                      <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: getLanguageColor(repo.language) }} /><span className="text-[10px] font-bold text-[var(--text-secondary)]">{repo.language || 'Code'}</span></div>
                    </div>
                  </motion.a>
                ))}
              </div>
            ) : (
              <>
                <QuestionsTable questions={displayQuestions} profileId={profileId} />
                <div className="mt-8">
                  <ResourceList resources={buildDynamicResources(profile?.weakAreas)} title="Elevate Your Skillset" />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </PageWrapper>
  )
}
