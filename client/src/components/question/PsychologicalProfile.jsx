import { Brain, Heart, Zap, Shield, Flame, Activity, CloudFog, Target } from 'lucide-react'

const getIcon = (name) => {
  const n = name.toLowerCase()
  if (n.includes('conf'))  return <Flame    size={13} className="text-[var(--cyan)]" />
  if (n.includes('calm'))  return <CloudFog size={13} className="text-[var(--cyan)]" />
  if (n.includes('focus')) return <Target   size={13} className="text-[var(--cyan)]" />
  if (n.includes('anx'))   return <Activity size={13} className="text-[var(--text-muted)]" />
  if (n.includes('nerv'))  return <Activity size={13} className="text-[var(--text-muted)]" />
  if (n.includes('resil')) return <Shield   size={13} className="text-[var(--cyan)]" />
  return <Target size={13} className="text-[var(--cyan)]" />
}

// Map a trait color string to a CSS gradient/bar color using theme vars
const getBarColor = (color) => {
  const map = {
    blue:   'var(--cyan)',
    green:  'var(--cyan)',
    teal:   'var(--cyan)',
    yellow: 'var(--text-muted)',
    red:    'var(--text-muted)',
  }
  return map[color] || 'var(--cyan)'
}

export default function PsychologicalProfile({ profile }) {
  if (!profile || !profile.traits) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-[var(--text-muted)]">
        <Brain size={32} className="opacity-20 mb-3" />
        <p className="text-sm font-medium">Re-audit this question to generate Psychological Profile.</p>
      </div>
    )
  }

  const { traits, emotionalState, mentalEnergy } = profile

  return (
    <div className="flex flex-col gap-5">

      {/* ── MENTAL STATE ANALYSIS BLOCK ── */}
      <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-1">
          <Brain size={15} className="text-[var(--text-secondary)]" />
          <span className="text-sm font-bold text-[var(--text-primary)]">Mental State Analysis</span>
        </div>
        <p className="text-[10px] text-[var(--text-muted)] font-medium leading-relaxed mb-5">
          Real-time psychological metrics derived from coding patterns, error types, and decision-making speed.
        </p>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4">
          {traits.map((trait, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  {getIcon(trait.name)}
                  <span className="text-[11px] font-bold text-[var(--text-primary)]">{trait.name}</span>
                </div>
                <span
                  className="text-[11px] font-bold"
                  style={{ color: trait.lowerIsBetter ? 'var(--text-secondary)' : 'var(--cyan)' }}
                >
                  {trait.score}%
                </span>
              </div>

              {/* Progress bar track */}
              <div className="h-1.5 w-full bg-[var(--border)] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${trait.score}%`,
                    backgroundColor: trait.lowerIsBetter
                      ? 'var(--text-muted)'
                      : 'var(--cyan)',
                    boxShadow: trait.lowerIsBetter
                      ? 'none'
                      : '0 0 6px var(--cyan-glow)',
                  }}
                />
              </div>

              {trait.lowerIsBetter && (
                <span className="text-[9px] text-[var(--text-muted)] font-medium">↓ Lower is better</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── EMOTIONAL STATE + MENTAL ENERGY ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Heart size={13} className="text-[var(--text-muted)]" />
            <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-widest">Emotional State</span>
          </div>
          <h5 className="text-sm font-bold text-[var(--cyan)] leading-tight">
            {emotionalState?.status || '—'}
          </h5>
          <p className="text-[10px] text-[var(--text-secondary)] leading-snug">
            {emotionalState?.description || 'Awaiting signal parameters.'}
          </p>
        </div>

        <div className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center gap-1.5 mb-1">
            <Zap size={13} className="text-[var(--text-muted)]" />
            <span className="text-[9px] uppercase font-bold text-[var(--text-muted)] tracking-widest">Mental Energy</span>
          </div>
          <h5 className="text-sm font-bold text-[var(--cyan)] leading-tight">
            {mentalEnergy?.status || '—'}
          </h5>
          <p className="text-[10px] text-[var(--text-secondary)] leading-snug">
            {mentalEnergy?.description || 'Awaiting cognitive flow metrics.'}
          </p>
        </div>
      </div>

    </div>
  )
}
