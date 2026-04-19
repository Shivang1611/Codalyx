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
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'], session: false })
)
router.get('/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const access  = signAccessToken(req.user._id.toString())
    const refresh = signRefreshToken(req.user._id.toString())
    res.cookie('refresh_token', refresh, COOKIE_OPTIONS)
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${access}`)
  }
)

// GitHub OAuth
router.get('/github',
  passport.authenticate('github', { scope: ['user:email'], session: false })
)
router.get('/github/callback',
  passport.authenticate('github', { session: false }),
  (req, res) => {
    const access  = signAccessToken(req.user._id.toString())
    const refresh = signRefreshToken(req.user._id.toString())
    res.cookie('refresh_token', refresh, COOKIE_OPTIONS)
    res.redirect(`${process.env.CLIENT_URL}/auth/callback?token=${access}`)
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
