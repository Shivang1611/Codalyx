import { motion } from 'framer-motion'

export default function StatCard({ label, value, subValue, icon, color = 'var(--cyan)' }) {
  return (
    <motion.div 
      whileHover={{ translateY: -4 }}
      className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 shadow-[var(--shadow-card)] relative overflow-hidden group"
    >
      <div 
        className="absolute top-0 left-0 w-1 h-full" 
        style={{ backgroundColor: color }}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[var(--text-secondary)] text-sm font-medium mb-1 uppercase tracking-wider">{label}</p>
          <p className="text-3xl font-bold text-[var(--text-primary)] font-['Space_Grotesk']">{value}</p>
          {subValue && (
            <p className="text-xs text-[var(--text-muted)] mt-1 font-medium">{subValue}</p>
          )}
        </div>
        <div 
          className="p-3 rounded-xl transition-colors duration-300"
          style={{ backgroundColor: `${color}15`, color: color }}
        >
          {icon}
        </div>
      </div>
    </motion.div>
  )
}
