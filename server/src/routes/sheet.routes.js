import { Router } from 'express'
import { z } from 'zod'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { requireAuth } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { Sheet, UserSubscription } from '../models/Sheet.js'
import Profile from '../models/Profile.js'
import { blind75Problems } from '../data/blind75.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = Router()
router.use(requireAuth)

// Dynamic JSON loader for NeetCode 150
function getNeetcode150Problems() {
  try {
    const rawData = fs.readFileSync(path.join(__dirname, '../data/neetcode150.json'), 'utf-8')
    const parsed = JSON.parse(rawData)
    const dataSection = parsed.data || {}
    
    // Filter and map exactly to the standard structure
    return Object.entries(dataSection)
      .filter(([key, val]) => val.tag === 'NeetCode150')
      .map(([key, p]) => ({
        title: key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        difficulty: p.difficulty || 'Medium',
        topic: Array.isArray(p.topics) && p.topics.length > 0 ? p.topics[0] : 'NeetCode 150',
        url: `https://leetcode.com/problems/${key}/`
      }))
  } catch (error) {
    console.error('Error loading NeetCode 150 data:', error)
    return []
  }
}

// Seed standard curated sheets if none exist
async function seedCuratedSheets() {
  const blind75Count = await Sheet.countDocuments({ title: 'Blind 75', type: 'curated' })
  const blind75Data = {
    title: 'Blind 75',
    description: 'The og interview prep list. Tech workers favorite.',
    totalProblems: blind75Problems.length,
    type: 'curated',
    isPublic: true,
    problems: blind75Problems
  }
  
  if (blind75Count === 0) {
    await Sheet.create(blind75Data)
  } else {
    // Force update if it already exists
    await Sheet.updateOne({ title: 'Blind 75', type: 'curated' }, { $set: blind75Data })
  }

  const neetcodeProblems = getNeetcode150Problems()
  const neetcodeCount = await Sheet.countDocuments({ title: 'NeetCode 150', type: 'curated' })
  const neetcodeData = {
    title: 'NeetCode 150',
    description: 'Must-solve interview problems. 78% of users pass interview after completing.',
    totalProblems: neetcodeProblems.length > 0 ? neetcodeProblems.length : 150,
    type: 'curated',
    isPublic: true,
    problems: neetcodeProblems
  }

  if (neetcodeCount === 0 && neetcodeProblems.length > 0) {
    await Sheet.create(neetcodeData)
  } else if (neetcodeProblems.length > 0) {
    // Force update the db
    await Sheet.updateOne({ title: 'NeetCode 150', type: 'curated' }, { $set: neetcodeData })
  }

  const count = await Sheet.countDocuments({ type: 'curated' })
  if (count <= 2) {
    const curated = [
      {
        title: 'Google SDE Interview Kit',
        description: 'Curated from actual Google interviews.',
        totalProblems: 89,
        type: 'curated',
        isPublic: true,
        problems: [
            { title: "Number of Islands", difficulty: "Medium", topic: "Graph" }
        ]
      },
      {
        title: 'Dynamic Programming Essentials',
        description: 'Master DP concept in 4 weeks.',
        totalProblems: 34,
        type: 'curated',
        isPublic: true,
        problems: [
            { title: "Climbing Stairs", difficulty: "Easy", topic: "DP" },
            { title: "Coin Change", difficulty: "Medium", topic: "DP" }
        ]
      }
    ]
    await Sheet.insertMany(curated)
  }
}

// Ensure seeded
seedCuratedSheets().catch(console.error)

// GET /api/sheets
router.get('/', async (req, res) => {
  try {
    const curated = await Sheet.find({ type: 'curated' }).lean()
    const personal = await Sheet.find({ type: 'personal', authorId: req.userId }).lean()
    
    // Find subscriptions
    const subDocs = await UserSubscription.find({ userId: req.userId }).lean()
    const subscribedMap = new Set(subDocs.map(s => s.sheetId.toString()))

    const enrichedCurated = curated.map(s => ({ ...s, isSubscribed: subscribedMap.has(s._id.toString()) }))
    const enrichedPersonal = personal.map(s => ({ ...s, isSubscribed: subscribedMap.has(s._id.toString()) }))

    res.json({ curated: enrichedCurated, personal: enrichedPersonal })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/sheets/:id
router.get('/:id', async (req, res) => {
  try {
    const sheet = await Sheet.findById(req.params.id).lean()
    if (!sheet) return res.status(404).json({ error: 'Not found' })

    const sub = await UserSubscription.findOne({ userId: req.userId, sheetId: req.params.id })
    const isSubscribed = !!sub

    // Fetch user profile to calculate progress dynamically!
    // Progress uses Profile.recentSubmissions
    const profile = await Profile.findOne({ userId: req.userId, platform: 'LEETCODE' }).lean()
    const solvedSet = new Set((profile?.recentSubmissions || []).filter(s => s.status === 'Accepted').map(s => String(s.title).trim().toLowerCase()))

    let solvedCount = 0
    let totalAccuracy = 0
    let evaluatedAccuracyCount = 0

    const enrichedProblems = sheet.problems.map(p => {
      const pTitle = String(p.title).trim().toLowerCase()
      const isSolved = solvedSet.has(pTitle)
      if (isSolved) solvedCount++
      
      const pRecord = (profile?.recentSubmissions || []).find(s => s.title?.trim().toLowerCase() === pTitle)
      if (pRecord && pRecord.accuracy != null) {
         totalAccuracy += pRecord.accuracy
         evaluatedAccuracyCount++
      }

      return {
        ...p,
        isSolved,
        accuracy: pRecord?.accuracy || null
      }
    })

    const progress = sheet.problems.length > 0 ? (solvedCount / sheet.problems.length) * 100 : 0
    const avgAccuracy = evaluatedAccuracyCount > 0 ? (totalAccuracy / evaluatedAccuracyCount) : 0

    // Next recommended
    const unsolved = enrichedProblems.filter(p => !p.isSolved)
    const nextRecommended = unsolved.length > 0 ? unsolved[0] : null

    res.json({
      ...sheet,
      problems: enrichedProblems,
      isSubscribed,
      stats: {
        solvedCount,
        progressPct: Math.round(progress),
        avgAccuracy: Math.round(avgAccuracy),
        nextRecommended
      }
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/sheets/:id/subscribe
router.post('/:id/subscribe', async (req, res) => {
  try {
    const sheetId = req.params.id
    const existing = await UserSubscription.findOne({ userId: req.userId, sheetId })
    if (existing) {
       await UserSubscription.deleteOne({ _id: existing._id })
       await Sheet.findByIdAndUpdate(sheetId, { $inc: { subscribersCount: -1 } })
       return res.json({ message: 'Unsubscribed', isSubscribed: false })
    } else {
       await UserSubscription.create({ userId: req.userId, sheetId })
       await Sheet.findByIdAndUpdate(sheetId, { $inc: { subscribersCount: 1 } })
       return res.json({ message: 'Subscribed', isSubscribed: true })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/sheets (Create Personal)
const createSheetSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().optional(),
  isPublic: z.boolean().default(false),
  problems: z.array(z.object({
    title: z.string(),
    difficulty: z.string(),
    topic: z.string()
  })).default([])
})

router.post('/', validate(createSheetSchema), async (req, res) => {
  try {
    const data = req.body
    data.authorId = req.userId
    data.type = 'personal'
    data.totalProblems = data.problems.length
    
    const sheet = await Sheet.create(data)
    await UserSubscription.create({ userId: req.userId, sheetId: sheet._id })
    await Sheet.findByIdAndUpdate(sheet._id, { $inc: { subscribersCount: 1 } })

    res.status(201).json(sheet)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

export default router
