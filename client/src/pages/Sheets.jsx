import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Library, Plus, Search, CheckCircle2, ChevronRight, Globe, Lock, User } from 'lucide-react'
import PageWrapper from '../components/shared/PageWrapper.jsx'
import api from '../utils/api.js'

export default function Sheets() {
  const [data, setData] = useState({ curated: [], personal: [] })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSheets()
  }, [])

  const fetchSheets = async () => {
    try {
      const res = await api.get('/sheets')
      setData(res.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async (id) => {
    try {
      await api.post(`/sheets/${id}/subscribe`)
      fetchSheets()
    } catch (err) {
      console.error(err)
    }
  }

  if (loading) return null;

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-primary)] font-['Space_Grotesk'] tracking-tight flex items-center gap-3">
            <Library className="text-[var(--cyan)]" size={32} />
            Problem Sheets
          </h1>
          <p className="text-[var(--text-secondary)] mt-2 text-sm max-w-2xl">
            Curated battle-tested lists of problems that guarantee interview mastery. Subscribe to a public sheet or create your own custom tracker.
          </p>
        </div>
        
        <button className="flex items-center gap-2 bg-[var(--cyan)] text-white px-5 py-2.5 rounded-xl font-bold hover:brightness-110 transition-all shadow-lg shadow-[var(--cyan-glow)]">
          <Plus size={18} />
          Create Personal Sheet
        </button>
      </div>

      <div className="space-y-12">
        {/* Curated Sheets */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Globe className="text-[var(--text-muted)]" size={20} />
            <h2 className="text-xl font-bold font-['Space_Grotesk'] text-[var(--text-primary)]">Public Curated Sheets</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.curated.map(sheet => (
              <SheetCard key={sheet._id} sheet={sheet} onSubscribe={() => handleSubscribe(sheet._id)} />
            ))}
          </div>
        </section>

        {/* Personal Sheets */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <Lock className="text-[var(--text-muted)]" size={20} />
            <h2 className="text-xl font-bold font-['Space_Grotesk'] text-[var(--text-primary)]">Your Personal Sheets</h2>
          </div>
          
          {data.personal.length === 0 ? (
            <div className="p-8 border border-[var(--border)] border-dashed rounded-2xl flex flex-col items-center justify-center text-center bg-[var(--bg-card)]/30">
              <div className="w-16 h-16 bg-[var(--bg-hover)] rounded-full flex items-center justify-center mb-4">
                <Library size={24} className="text-[var(--text-muted)]" />
              </div>
              <h3 className="text-[var(--text-primary)] font-bold mb-2">No personal sheets yet</h3>
              <p className="text-[var(--text-muted)] text-sm max-w-md">Create a custom list to group problems uniquely for your upcoming interviews or study sessions.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data.personal.map(sheet => (
                <SheetCard key={sheet._id} sheet={sheet} onSubscribe={() => handleSubscribe(sheet._id)} />
              ))}
            </div>
          )}
        </section>
      </div>
    </PageWrapper>
  )
}

function SheetCard({ sheet, onSubscribe }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl flex flex-col hover:border-[var(--cyan)]/30 transition-all group overflow-hidden">
      <div className="p-6 flex-1">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--cyan)] transition-colors line-clamp-1">{sheet.title}</h3>
          <div className="bg-[var(--bg-hover)] text-[var(--text-secondary)] text-xs font-bold px-3 py-1 rounded-full whitespace-nowrap">
            {sheet.totalProblems} Probs
          </div>
        </div>
        <p className="text-[var(--text-secondary)] text-sm line-clamp-3 mb-6">{sheet.description || 'No description provided.'}</p>
        
        <div className="flex items-center gap-4 text-xs font-semibold text-[var(--text-muted)]">
          <div className="flex items-center gap-1.5"><User size={14}/> {sheet.subscribersCount} Subs</div>
        </div>
      </div>
      
      <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-base)]/50 flex items-center gap-3">
        <button 
          onClick={onSubscribe}
          className={`flex-1 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${
            sheet.isSubscribed 
              ? 'bg-[var(--bg-hover)] text-[var(--text-primary)]' 
              : 'bg-[var(--cyan)]/10 text-[var(--cyan)] hover:bg-[var(--cyan)]/20'
          }`}
        >
          {sheet.isSubscribed ? <><CheckCircle2 size={16}/> Subscribed</> : 'Subscribe'}
        </button>
        <Link 
          to={`/sheets/${sheet._id}`}
          className="w-10 h-10 border border-[var(--border)] rounded-xl flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--cyan)] transition-all"
        >
          <ChevronRight size={18} />
        </Link>
      </div>
    </div>
  )
}
