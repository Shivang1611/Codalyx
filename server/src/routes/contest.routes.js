import { Router } from 'express'
import { requireAuth } from '../middleware/auth.middleware.js'
import { Contest, UserParticipation } from '../models/Contest.js'
import { syncGlobalContests } from '../platforms/contests.js'

const router = Router()
router.use(requireAuth)

// GET /api/contests/upcoming
router.get('/upcoming', async (req, res) => {
  try {
    await syncGlobalContests().catch(e => console.error('Sync Error:', e))
    
    let contests = await Contest.find({ 
      startTime: { $gte: new Date() } 
    }).sort({ startTime: 1 }).limit(20)
    
    if (contests.length === 0) {
      const mockData = [
        { platform: 'LEETCODE', title: 'Weekly Contest 445', startTime: new Date(Date.now() + 86400000 * 2), durationSeconds: 5400, externalId: 'MOCK_LC_1' },
        { platform: 'CODEFORCES', title: 'Codeforces Round #995', startTime: new Date(Date.now() + 86400000 * 5), durationSeconds: 7200, externalId: 'MOCK_CF_1' },
      ]
      await Contest.insertMany(mockData)
      contests = await Contest.find({ startTime: { $gte: new Date() } }).sort({ startTime: 1 })
    }
    
    const participation = await UserParticipation.find({ 
      userId: req.userId
    }).lean()

    const enriched = contests.map(c => {
      const userStatus = participation.find(p => p.contestId?.toString() === c._id.toString())
      return {
        ...c.toObject(),
        userStatus: userStatus?.status || 'NOT_REGISTERED'
      }
    })

    res.json(enriched)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/contests/history
router.get('/history', async (req, res) => {
  try {
    const history = await UserParticipation.find({ userId: req.userId })
      .populate('contestId')
      .sort({ createdAt: -1 })
    res.json(history)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/contests/:id/register
router.post('/:id/register', async (req, res) => {
  try {
    const contest = await Contest.findById(req.params.id)
    if (!contest) return res.status(404).json({ error: 'Contest not found' })

    const p = await UserParticipation.findOneAndUpdate(
      { userId: req.userId, contestId: contest._id },
      { platform: contest.platform, status: 'REGISTERED' },
      { upsert: true, new: true }
    )
    res.json(p)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
