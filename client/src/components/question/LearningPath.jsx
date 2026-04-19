import { ExternalLink } from 'lucide-react'

// Converts a problem title to a LeetCode search URL
function toLeetCodeUrl(problemTitle) {
  const slug = problemTitle
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  return `https://leetcode.com/problems/${slug}/`
}

export default function LearningPath({ paths }) {
  return (
    <div className="space-y-4 h-full">
      {paths.map((path, i) => (
        <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-4 flex flex-col gap-3 group hover:border-[var(--cyan)] transition-all">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="w-6 h-6 rounded-full bg-[var(--cyan)] text-white text-[10px] font-bold flex items-center justify-center">
                {path.priority}
              </span>
              <h4 className="text-sm font-bold text-[var(--text-primary)]">{path.title}</h4>
            </div>
            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">{path.estimatedHours} EST.</span>
          </div>

          {/* Clickable Problem Chips */}
          <div className="flex flex-wrap gap-2">
            {path.problems.map((p, j) => (
              <a
                key={j}
                href={toLeetCodeUrl(p)}
                target="_blank"
                rel="noopener noreferrer"
                title={`Open "${p}" on LeetCode`}
                className="flex items-center gap-1 text-[10px] bg-[var(--bg-hover)] text-[var(--cyan)] px-2.5 py-1 rounded-md border border-[var(--cyan)]/30 hover:bg-[var(--cyan)]/15 hover:border-[var(--cyan)] hover:shadow-[0_0_8px_rgba(34,211,238,0.2)] transition-all cursor-pointer font-semibold"
              >
                {p}
                <ExternalLink size={9} className="opacity-60" />
              </a>
            ))}
          </div>

          <div className="space-y-1">
            <div className="flex justify-between text-[8px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
              <span>Target Accuracy</span>
              <span>{path.targetAccuracy}%</span>
            </div>
            <div className="h-1 bg-[var(--bg-hover)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--cyan)] transition-all duration-700" style={{ width: `${path.targetAccuracy}%` }} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
