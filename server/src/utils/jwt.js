import jwt from 'jsonwebtoken'

export const signAccessToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_ACCESS_SECRET, { expiresIn: '15m' })

export const signRefreshToken = (userId) =>
  jwt.sign({ sub: userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' })

export const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_ACCESS_SECRET)

export const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET)
