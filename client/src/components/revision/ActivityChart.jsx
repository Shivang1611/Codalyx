import { BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell } from 'recharts'

export default function ActivityChart({ weeklyActivity }) {
  const avg = Math.round(weeklyActivity.reduce((s, a) => s + a.count, 0) / 7)
  const peak = Math.max(...weeklyActivity.map(a => a.count))

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 shadow-[var(--shadow-card)]">
      <div className="mb-8">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Weekly Intensity</h3>
        <p className="text-xl font-bold font-['Space_Grotesk'] text-[var(--text-primary)] tracking-tight">Activity Heatmap</p>
      </div>

      <div className="h-40">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={weeklyActivity}>
            <XAxis 
              dataKey="day" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: 'var(--text-muted)', fontSize: 10, fontWeight: 700 }} 
            />
            <Tooltip 
              cursor={{ fill: 'var(--bg-hover)' }}
              contentStyle={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '12px' }}
            />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {weeklyActivity.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-8">
        {[
          { label: 'Avg Daily', value: avg },
          { label: 'Peak Day', value: peak },
          { label: 'Best Windows', value: '8-10 PM' }
        ].map((s, i) => (
          <div key={i} className="bg-[var(--bg-hover)]/30 border border-[var(--border-subtle)] rounded-xl py-3 px-2 text-center">
            <p className="text-[8px] font-bold uppercase tracking-tighter text-[var(--text-muted)] mb-1">{s.label}</p>
            <p className="text-xs font-bold text-[var(--text-primary)]">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
