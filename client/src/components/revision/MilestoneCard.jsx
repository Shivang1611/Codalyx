import { motion } from 'framer-motion'

export default function MilestoneCard({ milestone }) {
  return (
    <div className={`p-6 rounded-3xl border transition-all duration-500 relative overflow-hidden group ${milestone.unlocked ? 'bg-[var(--green)]/5 border-[var(--green)]/30' : 'bg-[var(--bg-card)] border-[var(--border)]'}`}>
      
      {milestone.unlocked && (
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--green)] opacity-10 blur-3xl rounded-full" />
      )}

      <div className="flex flex-col items-center text-center">
        <div className="text-4xl mb-4 group-hover:scale-125 transition-transform duration-500">{milestone.icon}</div>
        <h4 className="font-bold text-[var(--text-primary)] font-['Space_Grotesk'] leading-none mb-2">{milestone.label}</h4>
        <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] mb-6">{milestone.targetDays} Days Streak</span>
        
        <div className="w-full space-y-2">
          <div className="h-1.5 bg-[var(--bg-hover)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${milestone.progress}%` }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className={`h-full ${milestone.unlocked ? 'bg-[var(--green)]' : 'bg-[var(--cyan)]'}`}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] font-bold">
            <span className={milestone.unlocked ? 'text-[var(--green)]' : 'text-[var(--text-muted)]'}>
              {milestone.unlocked ? '🥇 UNLOCKED' : `${Math.round(milestone.progress)}% COMPLETED`}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
