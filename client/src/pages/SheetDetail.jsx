import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Library, CheckCircle2, ChevronLeft, Target, Award, Brain, ExternalLink, Code2 } from 'lucide-react'
import PageWrapper from '../components/shared/PageWrapper.jsx'
import api from '../utils/api.js'

export default function SheetDetail() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSheet()
  }, [id])

  const fetchSheet = async () => {
    try {
      const res = await api.get(`/sheets/${id}`)
      setData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async () => {
    try {
      await api.post(`/sheets/${id}/subscribe`)
      fetchSheet()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading || !data) return null;

  return (
    <PageWrapper>
      <Link to="/sheets" className="inline-flex items-center gap-2 text-sm font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] mb-8 transition-colors">
        <ChevronLeft size={16} /> Back to Sheets
      </Link>

      {/* Header */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-8 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--cyan)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--cyan)]/10 text-[var(--cyan)] flex items-center justify-center shadow-inner">
                <Library size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold font-['Space_Grotesk'] text-[var(--text-primary)] tracking-tight">{data.title}</h1>
                <div className="text-[var(--text-muted)] text-sm mt-1">{data.problems.length} problems • {data.type === 'curated' ? 'Curated Collection' : 'Personal Sheet'}</div>
              </div>
            </div>
            <p className="text-[var(--text-secondary)] max-w-2xl text-sm leading-relaxed">{data.description}</p>
          </div>
          
          <button 
            onClick={handleSubscribe}
            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-sm ${
              data.isSubscribed
                ? 'bg-zinc-800 text-white hover:bg-zinc-700 ring-1 ring-zinc-700'
                : 'bg-[var(--cyan)] text-white hover:brightness-110 shadow-lg shadow-[var(--cyan)]/20'
            }`}
          >
            {data.isSubscribed ? <><CheckCircle2 size={16} /> Subscribed</> : 'Subscribe to Sheet'}
          </button>
        </div>

        {/* Dashboard Stats (if subscribed or always) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t border-[var(--border)] relative z-10">
          <div className="bg-[var(--bg-base)] rounded-2xl p-4 border border-[var(--border)]">
            <div className="text-[var(--text-muted)] text-xs font-bold uppercase mb-2 flex items-center gap-1.5"><Target size={14}/> Sheet Progress</div>
            <div className="flex items-end gap-3">
              <div className="text-3xl font-bold text-[var(--text-primary)] font-['Space_Grotesk']">{data.stats.solvedCount}<span className="text-lg text-[var(--text-muted)]">/{data.problems.length}</span></div>
              <div className="text-sm font-bold text-[var(--cyan)] pb-1">{data.stats.progressPct}%</div>
            </div>
            <div className="w-full bg-[var(--bg-hover)] h-1.5 rounded-full mt-3 overflow-hidden">
              <div className="bg-[var(--cyan)] h-full rounded-full transition-all duration-1000" style={{ width: `${data.stats.progressPct}%` }}></div>
            </div>
          </div>

          <div className="bg-[var(--bg-base)] rounded-2xl p-4 border border-[var(--border)]">
            <div className="text-[var(--text-muted)] text-xs font-bold uppercase mb-2 flex items-center gap-1.5"><Award size={14}/> Average Accuracy</div>
            <div className="text-3xl font-bold text-[var(--green)] font-['Space_Grotesk']">{data.stats.avgAccuracy}%</div>
            <div className="text-xs text-[var(--text-secondary)] mt-3">Calculated from your Codalyx synced profile</div>
          </div>

          <div className="bg-[var(--bg-base)] rounded-2xl p-4 border border-[var(--border)] bg-gradient-to-br from-[var(--bg-base)] to-[var(--cyan)]/5">
            <div className="text-[var(--cyan)] text-xs font-bold uppercase mb-2 flex items-center gap-1.5"><Brain size={14}/> Recommended Next</div>
            {data.stats.nextRecommended ? (
              <>
                <div className="font-bold text-[var(--text-primary)] truncate" title={data.stats.nextRecommended.title}>{data.stats.nextRecommended.title}</div>
                <div className="text-xs text-[var(--text-secondary)] mt-1">{data.stats.nextRecommended.topic}</div>
                <a href={data.stats.nextRecommended.url || `https://leetcode.com/problems/${data.stats.nextRecommended.title.toLowerCase().replace(/ /g, '-')}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-1 text-[var(--cyan)] text-xs font-bold hover:underline">
                  Solve Now <ExternalLink size={12}/>
                </a>
              </>
            ) : (
              <div className="text-sm font-bold text-[var(--text-secondary)] mt-2">All caught up! 🔥</div>
            )}
          </div>
        </div>
      </div>

      {/* Problem List */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-surface)] flex justify-between items-center">
          <h2 className="font-bold text-[var(--text-primary)]">Problem Set</h2>
           <div className="text-xs font-bold text-[var(--text-muted)] px-3 py-1 bg-[var(--bg-base)] rounded-full border border-[var(--border)]">
            {data.problems.length} Total
          </div>
        </div>
        <div className="divide-y divide-[var(--border)]">
          {data.problems.map((p, idx) => (
            <div key={idx} className={`p-4 sm:p-5 flex items-center gap-4 transition-colors hover:bg-[var(--bg-hover)] ${p.isSolved ? 'bg-[var(--cyan)]/5' : ''}`}>
              <div className="flex-shrink-0">
                {p.isSolved ? (
                  <div className="w-8 h-8 rounded-full bg-[var(--cyan)]/20 text-[var(--cyan)] flex items-center justify-center ring-1 ring-[var(--cyan)]/50">
                    <CheckCircle2 size={18} />
                  </div>
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-base)] border border-[var(--border)] text-[var(--text-muted)] flex items-center justify-center font-bold text-xs">
                    {idx + 1}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <a href={p.url || `https://leetcode.com/problems/${p.title.toLowerCase().replace(/ /g, '-')}`} target="_blank" rel="noreferrer" className="text-base font-bold text-[var(--text-primary)] hover:text-[var(--cyan)] transition-colors inline-block truncate max-w-full">
                  {p.title}
                </a>
                <div className="flex flex-wrap items-center gap-2 mt-1">
                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${
                    p.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                    p.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500' :
                    'bg-red-500/10 text-red-500'
                  }`}>
                    {p.difficulty}
                  </span>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] bg-[var(--bg-base)] border border-[var(--border)] px-2 py-0.5 rounded-md">
                    {p.topic || 'General'}
                  </span>
                  {p.accuracy != null && (
                     <span className="text-[10px] font-bold text-[var(--text-muted)] px-1">
                      Score: <span className={p.accuracy >= 70 ? 'text-emerald-400' : 'text-amber-500'}>{p.accuracy}%</span>
                    </span>
                  )}
                </div>
              </div>

              <div>
                <a href={p.url || `https://leetcode.com/problems/${p.title.toLowerCase().replace(/ /g, '-')}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-xl bg-[var(--bg-base)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--cyan)] hover:border-[var(--cyan)]/30 transition-all">
                  <Code2 size={18} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  )
}
