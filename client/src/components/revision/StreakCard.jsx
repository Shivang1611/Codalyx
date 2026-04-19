import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function StreakCard({ label, value, unit, icon, variant = 'default' }) {
  const [isBouncing, setIsBouncing] = useState(false)

  useEffect(() => {
    setIsBouncing(true)
    const timeout = setTimeout(() => setIsBouncing(false), 600)
    return () => clearTimeout(timeout)
  }, [value])

  return (
    <div className={`relative group p-0.5 rounded-3xl overflow-hidden ${variant === 'active' ? 'bg-gradient-to-br from-[var(--cyan)] via-[var(--purple)] to-[var(--cyan)] bg-[length:200%_200%] animate-[meshShift_3s_linear_infinite]' : 'bg-[var(--border)]'}`}>
      <div className="bg-[var(--bg-card)] rounded-[calc(1.5rem-2px)] p-6 h-full relative z-10">
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl">{icon}</span>
          <div className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-widest ${variant === 'active' ? 'bg-[var(--cyan-glow)] text-[var(--cyan)]' : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'}`}>
            {variant === 'active' ? 'On Fire' : 'Metric'}
          </div>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-widest leading-none">{label}</p>
          <div className="flex items-baseline gap-2">
            <motion.span 
              animate={isBouncing ? { scale: [1, 1.2, 1] } : {}}
              transition={{ duration: 0.6 }}
              className={`text-4xl font-bold font-['Space_Grotesk'] leading-none ${variant === 'active' ? 'text-[var(--text-primary)]' : 'text-[var(--text-primary)]'}`}
            >
              {value}
            </motion.span>
            <span className="text-sm font-bold text-[var(--text-secondary)]">{unit}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
