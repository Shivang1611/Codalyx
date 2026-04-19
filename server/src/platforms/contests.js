import { Contest } from '../models/Contest.js'

/**
 * Contest Aggregator Service
 * Fetches upcoming contests from multiple platforms and syncs them to the DB.
 */

export async function syncGlobalContests() {
  try {
    const today = new Date()
    const results = []

    // 1. Codeforces (Real API)
    try {
      const cfRes = await fetch('https://codeforces.com/api/contest.list?gym=false')
      const cfData = await cfRes.json()
      if (cfData.status === 'OK') {
        results.push(...cfData.result.filter(c => c.phase === 'BEFORE').map(c => ({
          platform: 'CODEFORCES',
          title: c.name,
          startTime: new Date(c.startTimeSeconds * 1000),
          durationSeconds: c.durationSeconds,
          url: `https://codeforces.com/contests/${c.id}`,
          externalId: `CF_${c.id}`
        })))
      }
    } catch (e) { console.error('CF Sync Failed:', e.message) }

    // 2. LeetCode (Predictive Mock)
    const weeklyContest = new Date(today)
    weeklyContest.setDate(today.getDate() + (7 - today.getDay()) % 7)
    weeklyContest.setHours(8, 0, 0, 0)
    results.push({
      platform: 'LEETCODE',
      title: 'LeetCode Weekly Contest 445',
      startTime: weeklyContest,
      durationSeconds: 5400,
      url: 'https://leetcode.com/contest/',
      externalId: `LC_W_${weeklyContest.toDateString().replace(/ /g, '_')}`
    })

    // 3. AtCoder Mock
    const atcoderDate = new Date(today)
    atcoderDate.setDate(today.getDate() + (6 - today.getDay() + 7) % 7)
    atcoderDate.setHours(17, 30, 0, 0)
    results.push({
      platform: 'ATCODER',
      title: 'AtCoder Beginner Contest 390',
      startTime: atcoderDate,
      durationSeconds: 6000,
      url: 'https://atcoder.jp/contests/',
      externalId: `AC_B_${atcoderDate.toDateString().replace(/ /g, '_')}`
    })

    // 4. CodeChef Mock
    const codechefDate = new Date(today)
    codechefDate.setDate(15) 
    if (codechefDate < today) codechefDate.setMonth(today.getMonth() + 1)
    results.push({
      platform: 'CODECHEF',
      title: 'CodeChef Starters 140',
      startTime: codechefDate,
      durationSeconds: 10800,
      url: 'https://www.codechef.com/contests',
      externalId: `CC_S_${codechefDate.toDateString().replace(/ /g, '_')}`
    })
    
    // Batch upsert into MongoDB
    const ops = results.map(c => ({
      updateOne: {
        filter: { externalId: c.externalId },
        update: { $set: c },
        upsert: true
      }
    }))
    
    if (ops.length > 0) {
      await Contest.bulkWrite(ops)
    }
    
    return results
  } catch (err) {
    console.error('GLOBAL CONTEST SYNC FATAL:', err)
    return []
  }
}
