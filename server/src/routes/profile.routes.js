import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import Profile from '../models/Profile.js'
import WeakArea from '../models/WeakArea.js'
import { fetchLeetCodeStats } from '../platforms/leetcode.js'
import { fetchCodeforcesStats } from '../platforms/codeforces.js'
import { fetchCodechefStats } from '../platforms/codechef.js'
import { fetchGFGStats } from '../platforms/gfg.js'
import { fetchHackerrankStats } from '../platforms/hackerrank.js'
import { fetchGitHubStats } from '../platforms/github.js'

const router = Router()

// DEV TOOL: GET /api/profiles/v1/force-sync
router.get('/v1/force-sync', async (req, res) => {
  try {
    const profiles = await Profile.find({});
    const results = [];
    for (const p of profiles) {
      try {
        const s = await syncProfileStats(p);
        results.push({ user: p.username, status: 'ok', data: s });
      } catch (err) {
        results.push({ user: p.username, status: 'error', error: err.message });
      }
    }
    res.json({ message: 'All processed', count: results.length, data: results });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.use(requireAuth)
const createProfileSchema = z.object({
  platform: z.enum(['LEETCODE', 'CODEFORCES', 'CODECHEF', 'GFG', 'HACKERRANK', 'GITHUB']),
  username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/)
})

async function syncProfileStats(profile) {
  console.log(`[FATAL_DEBUG] STARTING SYNC FOR: ${profile.username} on [${profile.platform}]`);
  let stats
  if (profile.platform === 'LEETCODE')
    stats = await fetchLeetCodeStats(profile.username)
  else if (profile.platform === 'CODEFORCES')
    stats = await fetchCodeforcesStats(profile.username)
  else if (profile.platform === 'GFG')
    stats = await fetchGFGStats(profile.username)
  else if (profile.platform === 'HACKERRANK')
    stats = await fetchHackerrankStats(profile.username)
  else if (profile.platform === 'GITHUB')
    stats = await fetchGitHubStats(profile.username)
  else
    stats = await fetchCodechefStats(profile.username)

  console.log(`[PRODUCTION_AUDIT] Sync Result for ${profile.username}:`, {
    solved: stats.solvedQuestions,
    easy: stats.easySolved,
    med: stats.mediumSolved,
    hard: stats.hardSolved,
    easyTotal: stats.easyTotal
  });

  if (profile.platform === 'LEETCODE' && (stats.easySolved === 0 && stats.solvedQuestions > 0)) {
    console.error(`[CRITICAL_FAILURE] LeetCode Scraper returned ZERO for difficulties even though solvedQuestions is ${stats.solvedQuestions}. Check GraphQL parsing!`);
  }

  Object.assign(profile, {
    totalQuestions: stats.totalQuestions || 0,
    solvedQuestions: stats.solvedQuestions || 0,
    easySolved: stats.easySolved || 0,
    mediumSolved: stats.mediumSolved || 0,
    hardSolved: stats.hardSolved || 0,
    easyTotal: stats.easyTotal || 0,
    mediumTotal: stats.mediumTotal || 0,
    hardTotal: stats.hardTotal || 0,
    accuracy: stats.accuracy || 0,
    streak: stats.streak || 0,
    recentSubmissions: stats.recentSubmissions || [],
    weakAreas: stats.weakAreas || [],
    strongAreas: stats.strongAreas || [],
    githubData: stats.githubData || null,
    lastSyncedAt: new Date(),
  })
  await profile.save()

  // Replace weakAreas
  await WeakArea.deleteMany({ profileId: profile._id })
  if (stats.weakAreas?.length) {
    await WeakArea.insertMany(
      stats.weakAreas.map(w => ({ ...w, profileId: profile._id }))
    )
  }

  // RE-FETCH FRESH from DB to ensure new fields are present in response
  const updatedProfile = await Profile.findById(profile._id).lean()
  const weakAreas = await WeakArea.find({ profileId: profile._id }).lean()
  return { ...updatedProfile, weakAreas }
}

// GET /api/profiles
router.get('/', async (req, res) => {
  try {
    const profiles = await Profile.find({ userId: req.userId }).lean()
    const result = await Promise.all(profiles.map(async p => {
      const weakAreas = await WeakArea.find({ profileId: p._id }).lean()
      return { ...p, weakAreas }
    }))
    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/profiles
router.post('/', validate(createProfileSchema), async (req, res) => {
  try {
    const { platform, username } = req.body

    // Check if exists
    const existing = await Profile.findOne({ userId: req.userId, platform, username })
    if (existing) return res.status(409).json({ error: 'Profile already exists' })

    const profile = await Profile.create({
      userId: req.userId, platform, username
    })

    // Try to sync immediately
    try {
      const synced = await syncProfileStats(profile)
      res.status(201).json(synced)
    } catch (syncErr) {
      // If sync fails (e.g. invalid username), still return the profile but with error info
      res.status(201).json({ ...profile.toObject(), weakAreas: [], syncError: true })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/profiles/:id
router.delete('/:id', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id)
    if (!profile) return res.status(404).end()
    if (profile.userId.toString() !== req.userId)
      return res.status(403).json({ error: 'Forbidden' })
    await Profile.findByIdAndDelete(req.params.id)
    await WeakArea.deleteMany({ profileId: req.params.id })
    res.status(204).end()
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/profiles/:id/refresh
router.put('/:id/refresh', async (req, res) => {
  try {
    const profile = await Profile.findById(req.params.id)
    if (!profile) return res.status(404).end()
    if (profile.userId.toString() !== req.userId)
      return res.status(403).json({ error: 'Forbidden' })

    const synced = await syncProfileStats(profile)
    res.json(synced)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/profiles/extension/log (Manual Quick-Add from Chrome Extension)
router.post('/extension/log', async (req, res) => {
  try {
    const { title, difficulty, tags, timeSpent, approach, url, language, attempts, status } = req.body

    // Find User's LeetCode profile
    const profile = await Profile.findOne({ userId: req.userId, platform: 'LEETCODE' })
    if (!profile) return res.status(404).json({ error: 'LeetCode profile not connected' })

    // Build submission entry
    const submission = {
      id: new Date().getTime().toString(),
      title: title || 'Unknown Problem',
      difficulty: difficulty || 'Medium',
      topic: tags && tags.length > 0 ? tags.join(', ') : 'General',
      accuracy: status === 'Accepted' || !status ? 100 : Math.max(10, 100 - (attempts || 1) * 10),
      attempts: attempts ? parseInt(attempts) : 1,
      timestamp: new Date(),
      status: status || 'Accepted',
      timeSpent: timeSpent ? parseInt(timeSpent) : 0,
      approach: approach || '',
      lang: language || 'Unknown'
    }

    // Push to front of recent submissions
    profile.recentSubmissions.unshift(submission)

    // Keep array size manageable if necessary but for logging it's fine.
    if (profile.recentSubmissions.length > 500) {
      profile.recentSubmissions = profile.recentSubmissions.slice(0, 500)
    }

    // Increment basic counters
    profile.solvedQuestions += 1;
    if (difficulty === 'Easy') profile.easySolved += 1;
    else if (difficulty === 'Hard') profile.hardSolved += 1;
    else profile.mediumSolved += 1;

    await profile.save()
    res.json({ success: true, message: 'Problem logged instantly to Codalyx!' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
