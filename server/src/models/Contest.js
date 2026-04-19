import mongoose from 'mongoose'

const ContestSchema = new mongoose.Schema({
  platform: { type: String, required: true },
  title: { type: String, required: true },
  startTime: { type: Date, required: true },
  durationSeconds: { type: Number, required: true },
  url: { type: String },
  externalId: { type: String, unique: true },
  status: { type: String, default: 'UPCOMING' }
}, { timestamps: true })

const UserParticipationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  contestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Contest', required: true },
  platform: { type: String, required: true },
  status: { type: String, default: 'REGISTERED' },
  rank: { type: Number },
  solvedCount: { type: Number },
  ratingChange: { type: Number },
  performanceAnalysis: { type: String },
}, { timestamps: true })

UserParticipationSchema.index({ userId: 1, contestId: 1 }, { unique: true })

const Contest = mongoose.models.Contest || mongoose.model('Contest', ContestSchema)
const UserParticipation = mongoose.models.UserParticipation || mongoose.model('UserParticipation', UserParticipationSchema)

export { Contest, UserParticipation }
