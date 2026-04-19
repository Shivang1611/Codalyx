import { verifyAccessToken } from '../utils/jwt.js'

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' })
  }
  try {
    const payload = verifyAccessToken(authHeader.split(' ')[1])
    req.userId = payload.sub
    next()
  } catch (err) {
    res.status(401).json({ error: 'Token expired or invalid' })
  }
}
