import mongoose from 'mongoose'

const RevisionDaySchema = new mongoose.Schema({
  profileId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Profile', required: true },
  date:        { type: Date, required: true },
  completed:   { type: Boolean, default: false },
  questions:   { type: Number, default: 0 },
  durationMin: { type: Number, default: 0 },
})

RevisionDaySchema.index({ profileId: 1, date: 1 }, { unique: true })

export default mongoose.model('RevisionDay', RevisionDaySchema)
