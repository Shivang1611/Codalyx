import mongoose from 'mongoose'

// priority values: 'critical' | 'high' | 'medium' | 'low'

const WeakAreaSchema = new mongoose.Schema({
  profileId: { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  topic:     { type: String, required: true },
  accuracy:  { type: Number, required: true },
  attempts:  { type: Number, default: 0 },
  priority:  { type: String, enum: ['critical','high','medium','low'], default: 'medium' },
})

export default mongoose.model('WeakArea', WeakAreaSchema)
