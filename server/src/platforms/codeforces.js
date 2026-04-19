const CF_BASE = 'https://codeforces.com/api'
const delay = ms => new Promise(r => setTimeout(r, ms))

export async function fetchCodeforcesStats(handle) {
  // TODO: Add Redis caching here
  // const cached = await redis.get(`cf:${handle}`)
  // if (cached) return JSON.parse(cached)

  try {
    await delay(1100) // respect rate limit between calls

    const [userRes, subRes] = await Promise.all([
      fetch(`${CF_BASE}/user.info?handles=${handle}`),
      fetch(`${CF_BASE}/user.status?handle=${handle}`),
    ])

    if (!userRes.ok || !subRes.ok) throw new Error('Codeforces fetch failed')

    const userData = await userRes.json()
    const subData  = await subRes.json()

    if (userData.status !== 'OK') throw new Error('Codeforces user not found')

    const submissions  = subData.result || []
    const accepted     = submissions.filter(s => s.verdict === 'OK')
    const accuracy     = submissions.length > 0
      ? Math.round((accepted.length / submissions.length) * 100) : 0

    // Extract tags for weak areas
    const tagMap = {}
    submissions.forEach(s => {
      s.problem?.tags?.forEach(tag => {
        if (!tagMap[tag]) tagMap[tag] = { total: 0, accepted: 0 }
        tagMap[tag].total++
        if (s.verdict === 'OK') tagMap[tag].accepted++
      })
    })

    const weakAreas = Object.entries(tagMap)
      .map(([topic, v]) => ({
        topic,
        accuracy: Math.round((v.accepted / v.total) * 100),
        attempts: v.total,
        priority: v.accepted / v.total < 0.4 ? 'critical'
                : v.accepted / v.total < 0.6 ? 'high' : 'medium',
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5)

    const problemMap = new Map();
    submissions.forEach(s => {
      if (!s.problem) return;
      const pid = String(s.problem.contestId || '') + (s.problem.index || '');
      if (!problemMap.has(pid)) {
        problemMap.set(pid, {
          id: pid,
          title: s.problem.name || 'Unknown',
          difficulty: s.problem.rating ? (s.problem.rating < 1200 ? 'Easy' : s.problem.rating < 1600 ? 'Medium' : 'Hard') : 'Medium',
          topic: s.problem.tags?.[0] || 'General',
          attempts: 0,
          accepted: 0,
          timestamp: new Date(s.creationTimeSeconds * 1000)
        });
      }
      const p = problemMap.get(pid);
      p.attempts++;
      if (s.verdict === 'OK') p.accepted++;
      p.timestamp = new Date(Math.max(p.timestamp.getTime(), s.creationTimeSeconds * 1000));
    });
    
    // Sort by most recently attempted
    const recentSubmissions = Array.from(problemMap.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .map(p => ({
        ...p,
        accuracy: p.attempts > 0 ? Math.round((p.accepted / p.attempts) * 100) : 0,
        status: p.accepted > 0 ? 'Accepted' : 'Rejected'
      }));

    const result = {
      totalQuestions:  submissions.length,
      solvedQuestions: accepted.length,
      accuracy,
      streak:          0, // CF API doesn't expose streak directly in user info
      weakAreas,
      recentSubmissions,
    }

    // await redis.setex(`cf:${handle}`, 3600, JSON.stringify(result))
    return result
  } catch (err) {
    console.error('Codeforces integration error:', err)
    throw err
  }
}
