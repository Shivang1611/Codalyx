import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useMemo } from 'react'
import { AlertCircle } from 'lucide-react'

// Group real submissions into calendar months
function buildMonthlyChartData(submissions) {
  if (!submissions || submissions.length === 0) return []

  // Sort oldest → newest
  const sorted = [...submissions].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))

  // Determine date range
  const now = new Date()
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

  // Build month buckets for last 6 months
  const buckets = {}
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    const key = d.toLocaleString('en-US', { month: 'short', year: '2-digit' })
    buckets[key] = { label: key, solved: 0, accepted: 0, total: 0 }
  }

  // Fill buckets with REAL submission data
  sorted.forEach(sub => {
    const subDate = new Date(sub.timestamp)
    if (subDate < sixMonthsAgo) return // ignore older than 6 months
    const key = subDate.toLocaleString('en-US', { month: 'short', year: '2-digit' })
    if (buckets[key]) {
      buckets[key].total++
      if (sub.status === 'Accepted' || sub.accuracy >= 80) {
        buckets[key].accepted++
      }
      buckets[key].solved++
    }
  })

  return Object.values(buckets).map(b => ({
    label: b.label,
    solved: b.solved,
    accuracy: b.total > 0 ? Math.round((b.accepted / b.total) * 100) : null // null = no data, don't draw line
  }))
}

export default function ProgressTrendChart({ profile }) {
  const submissions = profile?.recentSubmissions || []

  const chartData = useMemo(() => buildMonthlyChartData(submissions), [submissions])

  // Check if ANY recent activity exists in the last 6 months
  const hasRecentActivity = chartData.some(d => d.solved > 0)

  // Stats from real data
  const totalSolved = profile?.solvedQuestions || 0
  const currentStreak = profile?.streak || 0

  // Compute improvement from first → last month that has data
  const nonZero = chartData.filter(d => d.accuracy !== null && d.solved > 0)
  const firstAcc = nonZero[0]?.accuracy ?? 0
  const lastAcc = nonZero[nonZero.length - 1]?.accuracy ?? 0
  const improvement = lastAcc - firstAcc
  const improvementColor = improvement >= 0 ? 'var(--green)' : 'var(--red)'

  // Velocity: problems solved in last 2 months
  const last2Months = chartData.slice(-2)
  const recentSolves = last2Months.reduce((s, d) => s + d.solved, 0)
  const velocity = recentSolves >= 10 ? 'High 🔥' : recentSolves >= 4 ? 'Medium 📈' : recentSolves > 0 ? 'Low ⚠️' : 'Inactive ⛔'

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold uppercase tracking-widest text-[var(--text-muted)] mb-1">Performance Trend</h3>
          <p className="text-2xl font-bold font-['Space_Grotesk'] text-[var(--text-primary)]">Last 6 Months</p>
        </div>
        {hasRecentActivity ? (
          <div
            className="px-3 py-1 rounded-full text-xs font-bold border"
            style={{
              backgroundColor: `color-mix(in srgb, ${improvementColor} 12%, transparent)`,
              color: improvementColor,
              borderColor: `color-mix(in srgb, ${improvementColor} 25%, transparent)`
            }}
          >
            {improvement >= 0 ? '+' : ''}{improvement}% accuracy
          </div>
        ) : (
          <div className="px-3 py-1 rounded-full text-xs font-bold border border-[var(--orange)]/30 bg-[var(--orange)]/10 text-[var(--orange)]">
            No recent activity
          </div>
        )}
      </div>

      {/* Chart or empty state */}
      <div className="h-64">
        {!hasRecentActivity ? (
          <div className="h-full flex flex-col items-center justify-center gap-3 text-center border border-dashed border-[var(--border)] rounded-xl">
            <AlertCircle size={32} className="text-[var(--text-muted)] opacity-40" />
            <p className="text-sm font-bold text-[var(--text-primary)]">No submissions in the last 6 months</p>
            <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed">
              This chart shows your actual LeetCode activity timeline. Start solving problems to see your progress appear here!
            </p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--bg-surface)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                }}
                formatter={(val, name) => [
                  val === null ? 'No data' : `${val}${name === 'accuracy' ? '%' : ''}`,
                  name === 'accuracy' ? 'Accuracy' : 'Problems Solved'
                ]}
              />
              {/* Accuracy line — only draws where there's real data (connectNulls=false) */}
              <Line
                type="monotone"
                dataKey="accuracy"
                stroke="var(--cyan)"
                strokeWidth={3}
                dot={{ fill: 'var(--purple)', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: 'var(--cyan)', strokeWidth: 0 }}
                animationDuration={1500}
                connectNulls={false}
              />
              {/* Problems solved per month as dashed secondary line */}
              <Line
                type="monotone"
                dataKey="solved"
                stroke="var(--orange)"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={false}
                animationDuration={1800}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Real stats from profile */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl flex flex-col justify-center">
          <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1">Total Solved</p>
          <div className="flex items-baseline gap-2 mb-2">
            <p className="text-xl font-bold text-[var(--text-primary)] leading-none">
              {totalSolved}
            </p>
            <span className="text-xs font-normal text-[var(--text-muted)]">problems</span>
          </div>
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--border-subtle)]">
            <div className="text-center">
               <span className="text-[8px] font-black uppercase text-[#10b981] block mb-0.5">Easy</span>
               <span className="text-[10px] font-bold text-[var(--text-primary)]">{profile?.easySolved || 0}</span>
            </div>
            <div className="text-center border-x border-[var(--border-subtle)] px-2">
               <span className="text-[8px] font-black uppercase text-[#f59e0b] block mb-0.5">Medium</span>
               <span className="text-[10px] font-bold text-[var(--text-primary)]">{profile?.mediumSolved || 0}</span>
            </div>
            <div className="text-center">
               <span className="text-[8px] font-black uppercase text-[#ef4444] block mb-0.5">Hard</span>
               <span className="text-[10px] font-bold text-[var(--text-primary)]">{profile?.hardSolved || 0}</span>
            </div>
          </div>
        </div>
        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl">
          <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1">Current Streak</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">
            {currentStreak} <span className="text-xs font-normal text-[var(--text-muted)]">days</span>
          </p>
        </div>
        <div className="p-4 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl">
          <p className="text-[10px] uppercase font-bold text-[var(--text-muted)] tracking-wider mb-1">Recent Velocity</p>
          <p className="text-xl font-bold text-[var(--text-primary)]">{velocity}</p>
        </div>
      </div>
    </div>
  )
}
