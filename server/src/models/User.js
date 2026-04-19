import mongoose from 'mongoose'

const UserSchema = new mongoose.Schema({
  name:     { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  image:    String,
  googleId: { type: String, sparse: true, unique: true },
  githubId: { type: String, sparse: true, unique: true },
}, { timestamps: true })

export default mongoose.model('User', UserSchema)
