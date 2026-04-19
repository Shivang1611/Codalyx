import mongoose from 'mongoose'

const SheetSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  totalProblems: { type: Number, default: 0 },
  type: { type: String, enum: ['curated', 'personal'], default: 'personal' },
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isPublic: { type: Boolean, default: false },
  problems: [{
    title: String,
    difficulty: String,
    topic: String,
    url: String
  }],
  subscribersCount: { type: Number, default: 0 }
}, { timestamps: true })

export const Sheet = mongoose.model('Sheet', SheetSchema)

const UserSubscriptionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sheetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Sheet', required: true },
  subscribedAt: { type: Date, default: Date.now }
})

UserSubscriptionSchema.index({ userId: 1, sheetId: 1 }, { unique: true })

export const UserSubscription = mongoose.model('UserSubscription', UserSubscriptionSchema)
