import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as GitHubStrategy } from 'passport-github2'
import User from '../models/User.js'

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  `${process.env.BACKEND_URL}/api/auth/google/callback`,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id })
      if (!user) {
        user = await User.findOneAndUpdate(
          { email: profile.emails?.[0]?.value },
          {
            googleId: profile.id,
            name:     profile.displayName,
            image:    profile.photos?.[0]?.value,
          },
          { upsert: true, new: true }
        )
      }
      return done(null, user)
    } catch (err) {
      return done(err)
    }
  }))
} else {
  console.warn("⚠️ Google OAuth credentials missing in .env. Login via Google will not work.")
}

// GitHub Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(new GitHubStrategy({
    clientID:     process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL:  `${process.env.BACKEND_URL}/api/auth/github/callback`,
  }, async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ githubId: profile.id })
      if (!user) {
        user = await User.findOneAndUpdate(
          { email: profile.emails?.[0]?.value },
          {
            githubId: profile.id,
            name:     profile.displayName || profile.username,
            avatar:   profile.photos?.[0]?.value,
          },
          { upsert: true, new: true }
        )
      }
      return done(null, user)
    } catch (err) {
      return done(err)
    }
  }))
} else {
  console.warn("⚠️ GitHub OAuth credentials missing in .env. Login via GitHub will not work.")
}

export default passport
