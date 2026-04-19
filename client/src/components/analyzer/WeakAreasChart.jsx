import { useMemo } from 'react'
import { AlertCircle, TrendingDown, TrendingUp } from 'lucide-react'

// Custom horizontal bar — no recharts needed, cleaner and fully correct
// mode='weak': scale against fixed mastery benchmark (50 problems = 100%) → short bar = needs practice
// mode='strong': scale relatively against the top performer in the section
function TopicBar({ topic, value, maxValue, color, label, mode = 'relative' }) {
  let pct
  if (mode === 'weak') {
    // Scale against a benchmark of 50 problems per topic = "solid foundation"
    // 1 solved → 2% bar width (visually short = needs practice)
    const MASTERY_BENCHMARK = Math.max(maxValue * 2, 50)
    pct = Math.max((value / MASTERY_BENCHMARK) * 100, 2)
  } else {
    // Relative scaling — strongest topic gets 100%, others scale down
    pct = maxValue > 0 ? Math.max((value / maxValue) * 100, 3) : 3
  }

  return (
    <div className="flex items-center gap-3 group">
      <div className="w-32 text-right shrink-0">
        <span className="text-xs font-bold text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors leading-tight">{topic}</span>
      </div>
      <div className="flex-1 h-5 bg-[var(--bg-hover)] rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <div className="w-16 shrink-0">
        <span className="text-xs font-bold" style={{ color }}>{value} {label}</span>
      </div>
    </div>
  )
}

export default function WeakAreasChart({ weakAreas, strongAreas }) {
  const { weakest, strongest } = useMemo(() => {
    const w = (weakAreas || []).filter(a => a.topic)
    const s = (strongAreas || []).filter(a => a.topic)
    return { weakest: w, strongest: s }
  }, [weakAreas, strongAreas])

  // Max values for scaling the bars correctly
  const maxWeak = Math.max(...weakest.map(w => w.attempts || 0), 1)
  const maxStrong = Math.max(...strongest.map(s => s.attempts || 0), 1)

  // Color based on actual attempts count
  const getWeakColor = (attempts) => {
    if (attempts <= 2) return 'var(--red)'
    if (attempts <= 10) return 'var(--orange)'
    return '#f59e0b'
  }

  const getStrongColor = (attempts) => {
    if (attempts >= 30) return '#10b981'   // emerald
    if (attempts >= 15) return 'var(--green)'
    return '#34d399'
  }

  if (weakAreas.length === 0) {
    return (
      <div className="space-y-8">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 flex flex-col items-center gap-3 py-12 text-center">
          <AlertCircle size={32} className="text-[var(--text-muted)] opacity-40" />
          <p className="font-bold text-[var(--text-primary)]">No topic data yet</p>
          <p className="text-xs text-[var(--text-muted)] max-w-xs">
            Sync your LeetCode profile to analyze which topics need the most focus.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      
      {/* Critical Focus Areas */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
            <TrendingDown size={14} className="text-[var(--red)]" />
            Critical Focus Areas
            <div className="w-2 h-2 rounded-full bg-[var(--red)] animate-pulse" />
          </h3>
          <span className="text-[10px] text-[var(--text-muted)] font-medium">By problems solved</span>
        </div>

        {weakest.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-8">No weak areas detected</p>
        ) : (
          <div className="space-y-4">
            {weakest.map((area, i) => (
              <TopicBar
                key={i}
                topic={area.topic}
                value={area.attempts || 0}
                maxValue={maxWeak}
                color={getWeakColor(area.attempts || 0)}
                label="solved"
                mode="weak"
              />
            ))}
          </div>
        )}

        <p className="text-[10px] text-[var(--text-muted)] mt-5 leading-relaxed border-t border-[var(--border)] pt-4">
          Topics where you need the most practice. A short bar means you are far from a solid foundation (50 problems benchmark). Prioritize these to unlock the biggest ranking jump.
        </p>
      </div>

      {/* Strong Proficiency */}
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
            <TrendingUp size={14} className="text-[var(--green)]" />
            Strong Proficiency
            <div className="w-2 h-2 rounded-full bg-[var(--green)]" />
          </h3>
          <span className="text-[10px] text-[var(--text-muted)] font-medium">By problems solved</span>
        </div>

        {strongest.length === 0 ? (
          <p className="text-sm text-[var(--text-muted)] text-center py-8">No proficiency data yet</p>
        ) : (
          <div className="space-y-4">
            {strongest.map((area, i) => (
              <TopicBar
                key={i}
                topic={area.topic}
                value={area.attempts || 0}
                maxValue={maxStrong}
                color={getStrongColor(area.attempts || 0)}
                label="solved"
              />
            ))}
          </div>
        )}

        <p className="text-[10px] text-[var(--text-muted)] mt-5 leading-relaxed border-t border-[var(--border)] pt-4">
          Topics where you have the most practice. Keep these sharp while working on your weak areas.
        </p>
      </div>

    </div>
  )
}
