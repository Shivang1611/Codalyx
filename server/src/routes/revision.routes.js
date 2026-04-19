import { Router } from 'express'
import { z } from 'zod'
import { requireAuth } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import Profile     from '../models/Profile.js'
import RevisionDay from '../models/RevisionDay.js'
import { computeRevisionStats, getOverdueQuestions } from '../utils/streak.js'

const router = Router()
router.use(requireAuth)

// GET /api/revision/:profileId
router.get('/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    
    let days;
    let baseProfile;
    let profilesForOverdue = [];

    if (profileId === 'total') {
      const profiles = await Profile.find({ userId: req.userId });
      profilesForOverdue = profiles;
      if (!profiles.length) return res.json({
        currentStreak: 0, bestStreak: 0, totalRevisions: 0, completionRate: 0,
        calendar: [], weeklyActivity: [], milestones: [], insights: [], recommendations: [], roadmaps: [], overdue: []
      });
      
      const allProfileIds = profiles.map(p => p._id);
      days = await RevisionDay.find({ profileId: { $in: allProfileIds } });
      
      baseProfile = {
        bestStreak: Math.max(...profiles.map(p => p.bestStreak || 0), 0),
        solvedQuestions: profiles.reduce((sum, p) => sum + (p.solvedQuestions || 0), 0),
        createdAt: new Date(Math.min(...profiles.map(p => p.createdAt.getTime()))),
        recentSubmissions: profiles.flatMap(p => p.recentSubmissions || []),
        weakAreas: profiles.flatMap(p => p.weakAreas || []),
        strongAreas: profiles.flatMap(p => p.strongAreas || [])
      };
    } else {
      const profile = await Profile.findById(profileId);
      if (!profile) return res.status(404).json({ error: 'Profile not found' });
      if (profile.userId.toString() !== req.userId)
        return res.status(403).json({ error: 'Forbidden' });
      
      baseProfile = profile;
      profilesForOverdue = [profile];
      days = await RevisionDay.find({ profileId });
    }

    const stats = computeRevisionStats(days, baseProfile);
    stats.overdue = getOverdueQuestions(profilesForOverdue);
    res.json(stats);
  } catch (err) {
    console.error('Revision stats error:', err);
    res.status(500).json({ error: err.message });
  }
})

// POST /api/revision/:profileId/day
const daySchema = z.object({
  date:      z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  completed: z.boolean(),
})

router.post('/:profileId/day', validate(daySchema), async (req, res) => {
  try {
    const { profileId } = req.params;
    const { date, completed } = req.body;

    // We only allow logging results to specific profiles, not 'total'
    if (profileId === 'total') return res.status(400).json({ error: 'Cannot log to aggregate view. Select a specific profile.' });

    const profile = await Profile.findById(profileId);
    if (!profile) return res.status(404).json({ error: 'Profile not found' });
    if (profile.userId.toString() !== req.userId)
      return res.status(403).json({ error: 'Forbidden' });

    const updateQuery = completed 
      ? { $set: { completed: true }, $inc: { questions: 1, durationMin: 15 } }
      : { $set: { completed: false, questions: 0, durationMin: 0 } };

    await RevisionDay.findOneAndUpdate(
      { profileId: profile._id, date: new Date(date) },
      updateQuery,
      { upsert: true, new: true }
    )

    const days  = await RevisionDay.find({ profileId });
    const stats = computeRevisionStats(days, profile);

    // Update bestStreak on profile if beaten
    if (stats.currentStreak > profile.bestStreak) {
      profile.bestStreak = stats.currentStreak;
      await profile.save();
    }

    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
})

export default router
