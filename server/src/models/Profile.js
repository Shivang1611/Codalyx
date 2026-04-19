import mongoose from 'mongoose'

// platform values: 'LEETCODE' | 'CODEFORCES' | 'CODECHEF' | 'GFG' | 'HACKERRANK'

const topicAreaSchema = {
  topic: { type: String },
  attempts: { type: Number, default: 0 },  // real problemsSolved count
  accuracy: { type: Number, default: 0 },  // percentage (0-100)
  priority: { type: String, default: 'medium' }
}

const ProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  platform: { type: String, enum: ['LEETCODE', 'CODEFORCES', 'CODECHEF', 'GFG', 'HACKERRANK', 'GITHUB'], required: true },
  username: { type: String, required: true },
  totalQuestions: { type: Number, default: 0 },
  solvedQuestions: { type: Number, default: 0 },
  easySolved: { type: Number, default: 0 },
  mediumSolved: { type: Number, default: 0 },
  hardSolved: { type: Number, default: 0 },
  easyTotal: { type: Number, default: 0 },
  mediumTotal: { type: Number, default: 0 },
  hardTotal: { type: Number, default: 0 },
  accuracy: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  bestStreak: { type: Number, default: 0 },
  recentSubmissions: [{
    id: String,
    title: String,
    difficulty: String,
    topic: String,
    accuracy: Number,
    attempts: Number,
    timestamp: Date,
    status: String
  }],
  // Bottom-N topics by problems solved (needs more practice)
  weakAreas: [topicAreaSchema],
  // Top-N topics by problems solved (genuine strengths)
  strongAreas: [topicAreaSchema],
  githubData: {
    publicRepos: Number,
    followers: Number,
    following: Number,
    totalStars: Number,
    forksCount: Number,
    avatarUrl: String,
    topLanguages: [{
      name: String,
      percentage: Number,
      color: String
    }],
    recentRepos: [{
      name: String,
      description: String,
      language: String,
      stars: Number,
      forks: Number,
      url: String,
      updatedAt: Date
    }],
    allRepos: [{
      name: String,
      description: String,
      language: String,
      stars: Number,
      forks: Number,
      url: String,
      isFork: Boolean,
      updatedAt: Date
    }],
    activityStats: {
      commits: Number,
      prs: Number,
      reviews: Number,
      issues: Number
    }
  },
  lastSyncedAt: Date,
}, { timestamps: true })

ProfileSchema.index({ userId: 1, platform: 1, username: 1 }, { unique: true })

export default mongoose.model('Profile', ProfileSchema)
