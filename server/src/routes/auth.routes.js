import { Router } from 'express'
import passport from 'passport'
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt.js'
import User from '../models/User.js'
import { verifyAccessToken } from '../utils/jwt.js'

const router = Router()

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000,
}

// Google OAuth
router.get('/google', (req, res, next) => {
  const origin = req.query.origin || req.headers.referer || process.env.CLIENT_URL
  console.log('--- GOOGLE AUTH START ---')
  console.log('Detected Origin:', origin)
  passport.authenticate('google', { 
    scope: ['profile', 'email'], 
    session: false,
    state: Buffer.from(origin).toString('base64')
  })(req, res, next)
})

router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const stateOrigin = req.query.state ? Buffer.from(req.query.state, 'base64').toString() : null
    const finalOrigin = stateOrigin || process.env.CLIENT_URL
    console.log('--- GOOGLE CALLBACK ---')
    console.log('State Origin:', stateOrigin)
    console.log('Final Redirect:', `${finalOrigin}/auth/callback`)
    
    const access  = signAccessToken(req.user._id.toString())
    const refresh = signRefreshToken(req.user._id.toString())
    res.cookie('refresh_token', refresh, COOKIE_OPTIONS)
    res.redirect(`${finalOrigin}/auth/callback?token=${access}`)
  }
)

// GitHub OAuth
router.get('/github', (req, res, next) => {
  const origin = req.query.origin || req.headers.referer || process.env.CLIENT_URL
  console.log('--- GITHUB AUTH START ---')
  console.log('Detected Origin:', origin)
  passport.authenticate('github', { 
    scope: ['user:email'], 
    session: false,
    state: Buffer.from(origin).toString('base64')
  })(req, res, next)
})

router.get('/github/callback',
  passport.authenticate('github', { session: false }),
  (req, res) => {
    const stateOrigin = req.query.state ? Buffer.from(req.query.state, 'base64').toString() : null
    const finalOrigin = stateOrigin || process.env.CLIENT_URL
    console.log('--- GITHUB CALLBACK ---')
    console.log('State Origin:', stateOrigin)
    
    const access  = signAccessToken(req.user._id.toString())
    const refresh = signRefreshToken(req.user._id.toString())
    res.cookie('refresh_token', refresh, COOKIE_OPTIONS)
    res.redirect(`${finalOrigin}/auth/callback?token=${access}`)
  }
)

// Refresh access token
router.post('/refresh', (req, res) => {
  const token = req.cookies?.refresh_token
  if (!token) return res.status(401).json({ error: 'No refresh token' })
  try {
    const payload = verifyRefreshToken(token)
    const access  = signAccessToken(payload.sub)
    res.json({ accessToken: access })
  } catch {
    res.status(401).json({ error: 'Invalid refresh token' })
  }
})

// Get current user
router.get('/me', async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).end()
  try {
    const payload = verifyAccessToken(authHeader.split(' ')[1])
    const user    = await User.findById(payload.sub).select('-__v')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json(user)
  } catch {
    res.status(401).end()
  }
})

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('refresh_token')
  res.json({ success: true })
})

export default router
