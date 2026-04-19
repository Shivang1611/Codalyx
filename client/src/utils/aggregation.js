/**
 * @param {import('./shapes.js').UserProfile[]} profiles
 * @returns {import('./shapes.js').AggregatedStats}
 */
export function aggregateStats(profiles) {
  if (!profiles || !profiles.length) return {
    totalQuestions: 0, solvedQuestions: 0,
    accuracy: 0, bestStreak: 0, profileCount: 0
  }
  const total = profiles.reduce((s, p) => s + (p.totalQuestions || 0), 0)
  const solved = profiles.reduce((s, p) => s + (p.solvedQuestions || 0), 0)
  const weighted = total > 0
    ? profiles.reduce((s, p) => s + ((p.accuracy || 0) * (p.totalQuestions || 0)), 0) / total
    : 0
  const bestStreak = Math.max(...profiles.map(p => p.bestStreak || 0), 0)
  return {
    totalQuestions: total,
    solvedQuestions: solved,
    accuracy: Math.round(weighted),
    bestStreak,
    profileCount: profiles.length,
  }
}
