import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import DifficultyBadge from '../shared/DifficultyBadge'
import { ChevronUp, ChevronDown, ExternalLink, BrainCircuit } from 'lucide-react'

export default function QuestionsTable({ questions, profileId }) {
  const navigate = useNavigate()
  const [sortKey, setSortKey] = useState('accuracy')
  const [sortDir, setSortDir] = useState('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  const sorted = [...questions].sort((a, b) => {
    const v1 = a[sortKey]
    const v2 = b[sortKey]
    if (typeof v1 === 'string') return sortDir === 'asc' ? v1.localeCompare(v2) : v2.localeCompare(v1)
    return sortDir === 'asc' ? v1 - v2 : v2 - v1
  })

  const totalPages = Math.ceil(sorted.length / itemsPerPage)
  const paginated = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const SortIcon = ({ colKey }) => {
    if (sortKey !== colKey) return null
    return sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
  }

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[var(--bg-hover)]/50 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] border-b border-[var(--border)]">
              <th className="px-6 py-4 cursor-pointer hover:text-[var(--text-primary)] transition-colors" onClick={() => toggleSort('title')}>
                <div className="flex items-center gap-1">Problem <SortIcon colKey="title" /></div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:text-[var(--text-primary)]" onClick={() => toggleSort('difficulty')}>
                <div className="flex items-center gap-1">Difficulty <SortIcon colKey="difficulty" /></div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:text-[var(--text-primary)]" onClick={() => toggleSort('topic')}>
                <div className="flex items-center gap-1">Topic <SortIcon colKey="topic" /></div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:text-[var(--text-primary)]" onClick={() => toggleSort('accuracy')}>
                <div className="flex items-center gap-1">Accuracy <SortIcon colKey="accuracy" /></div>
              </th>
              <th className="px-6 py-4 cursor-pointer hover:text-[var(--text-primary)]" onClick={() => toggleSort('attempts')}>
                <div className="flex items-center gap-1">Attempts <SortIcon colKey="attempts" /></div>
              </th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {paginated.map((q) => (
              <tr 
                key={q.id} 
                className="group hover:bg-[var(--bg-hover)]/30 transition-all cursor-pointer"
                onClick={() => navigate(`/analysis/${profileId}/question/${q.id}`)}
              >
                <td className="px-6 py-5">
                  <div className="flex flex-col">
                    <span className="font-bold text-[var(--text-primary)] group-hover:text-[var(--cyan)] transition-colors line-clamp-1">{q.title}</span>
                    <span className="text-[10px] text-[var(--text-muted)] font-medium">Last attempted {q.lastAttempted}</span>
                  </div>
                </td>
                <td className="px-6 py-5">
                  <DifficultyBadge difficulty={q.difficulty} />
                </td>
                <td className="px-6 py-5 text-sm font-medium text-[var(--text-secondary)]">
                  {q.topic}
                </td>
                <td className="px-6 py-5">
                  <div className="flex items-center gap-2">
                    <div className="w-12 h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--cyan)]" style={{ width: `${q.accuracy}%` }} />
                    </div>
                    <span className="text-xs font-bold text-[var(--text-primary)]">{q.accuracy}%</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm font-bold text-[var(--text-primary)]">
                  {q.attempts}
                </td>
                <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                     <button 
                      onClick={() => navigate(`/analysis/${profileId}/question/${q.id}`)}
                      className={`p-2 rounded-lg transition-all relative group/btn ${
                        q.accuracy < 50 
                          ? 'text-[var(--purple)] bg-[var(--purple-glow)] hover:scale-110 shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                          : 'text-[var(--text-muted)] hover:text-[var(--purple)] hover:bg-[var(--purple-glow)]'
                      }`}
                      title={q.accuracy < 50 ? "Priority AI Insight Recommended" : "View AI Insight"}
                    >
                      <BrainCircuit size={18} className={q.accuracy < 50 ? "animate-pulse" : ""} />
                      {q.accuracy < 50 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 bg-[var(--purple)] rounded-full border border-[var(--bg-card)] shadow-lg" />
                      )}
                    </button>
                    <button className="p-2 text-[var(--text-muted)] hover:text-[var(--cyan)] hover:bg-[var(--cyan-glow)] rounded-lg transition-all" title="View on Platform">
                      <ExternalLink size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <div className="px-6 py-4 bg-[var(--bg-hover)]/20 border-t border-[var(--border)] flex items-center justify-between">
        <span className="text-xs font-medium text-[var(--text-muted)]">
          Showing {Math.min(questions.length, (currentPage - 1) * itemsPerPage + 1)} - {Math.min(questions.length, currentPage * itemsPerPage)} of {questions.length} problems
        </span>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-[var(--bg-card)] border border-[var(--border)] rounded text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-50"
          >PREV</button>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages || totalPages === 0}
            className="px-3 py-1 bg-[var(--bg-card)] border border-[var(--border)] rounded text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] disabled:opacity-50"
          >NEXT</button>
        </div>
      </div>
    </div>
  )
}
