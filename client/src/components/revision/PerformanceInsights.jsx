export default function PerformanceInsights({ insights }) {
  const accentColors = ['var(--purple)', 'var(--green)', 'var(--cyan)', 'var(--orange)']

  return (
    <div className="space-y-4">
      {insights.map((insight, i) => (
        <div 
          key={i} 
          className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 flex items-center justify-between group hover:border-[var(--text-muted)] transition-all cursor-default relative overflow-hidden"
        >
          <div 
            className="absolute left-0 top-0 bottom-0 w-1" 
            style={{ backgroundColor: accentColors[i % 4] }}
          />
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[var(--bg-hover)] rounded-xl flex items-center justify-center text-xl shadow-sm">
              {insight.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] leading-none mb-1">{insight.label}</p>
              <p className="text-xs text-[var(--text-secondary)] font-medium leading-tight">{insight.description}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-[var(--text-primary)] font-['Space_Grotesk'] leading-none">{insight.value}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
