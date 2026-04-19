import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Check } from 'lucide-react'
import { z } from 'zod'
import PlatformLogo, { PLATFORM_META } from '../shared/PlatformLogo.jsx'

export default function AddProfileModal({ isOpen, onClose, onSubmit }) {
  const [platform, setPlatform] = useState('LEETCODE')
  const [username, setUsername] = useState('')
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const schema = z.object({
    username: z.string()
      .min(3, 'Username must be at least 3 chars')
      .max(30, 'Username too long')
      .regex(/^[a-zA-Z0-9_.-]+$/, 'Alphanumeric, underscores & hyphens only')
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrors({})
    const result = schema.safeParse({ username })
    if (!result.success) { setErrors(result.error.flatten().fieldErrors); return }
    setIsSubmitting(true)
    try {
      await onSubmit({ platform, username })
      setUsername('')
      onClose()
    } catch (err) {
      setErrors({ global: err.message })
    } finally {
      setIsSubmitting(false)
    }
  }

  const platforms = [
    { id: 'LEETCODE' },
    { id: 'CODEFORCES' },
    { id: 'CODECHEF' },
    { id: 'GFG' },
    { id: 'HACKERRANK' },
    { id: 'GITHUB' },
  ]

  const activeColor = PLATFORM_META[platform]?.color || '#22d3ee'

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="bg-[var(--bg-surface)] w-full max-w-md rounded-3xl p-8 relative z-10 border border-[var(--border)] shadow-2xl"
          >
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold font-['Space_Grotesk'] text-[var(--text-primary)]">Add Coding Profile</h2>
              <button onClick={onClose} className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors">
                <X size={20} className="text-[var(--text-secondary)]" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-3">Select Platform</label>
                <div className="grid grid-cols-3 gap-3">
                  {platforms.map(p => {
                    const isActive = platform === p.id
                    const color = PLATFORM_META[p.id]?.color || '#22d3ee'
                    const label = PLATFORM_META[p.id]?.label || p.id
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setPlatform(p.id)}
                        className="py-4 px-2 rounded-2xl text-[10px] font-bold border transition-all flex flex-col items-center gap-2.5 relative overflow-hidden"
                        style={{
                          borderColor: isActive ? color : 'var(--border)',
                          backgroundColor: isActive ? `${color}18` : 'var(--bg-card)',
                          color: isActive ? color : 'var(--text-muted)',
                          boxShadow: isActive ? `0 0 18px ${color}35` : 'none'
                        }}
                      >
                        {/* Subtle inner glow on active */}
                        {isActive && (
                          <div className="absolute inset-0 rounded-2xl pointer-events-none"
                            style={{ boxShadow: `inset 0 0 14px ${color}20` }}
                          />
                        )}
                        {/* Real platform logo */}
                        <div style={{ opacity: isActive ? 1 : 0.45 }}>
                          <PlatformLogo platform={p.id} size="w-7 h-7" />
                        </div>
                        <span className="text-center leading-tight">{label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Platform Username</label>
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder={`Enter your ${PLATFORM_META[platform]?.label} username...`}
                  className={`w-full h-12 bg-[var(--bg-card)] border ${errors.username ? 'border-[var(--red)]' : 'border-[var(--border)]'} rounded-xl px-4 text-[var(--text-primary)] focus:outline-none transition-all placeholder:text-[var(--text-muted)]`}
                  onFocus={e => { e.target.style.borderColor = activeColor }}
                  onBlur={e => { e.target.style.borderColor = errors.username ? 'var(--red)' : 'var(--border)' }}
                />
                {errors.username && <p className="text-[var(--red)] text-[10px] mt-1 font-bold">{errors.username[0]}</p>}
                {errors.global && <p className="text-[var(--red)] text-[10px] mt-1 font-bold">{errors.global}</p>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                style={{
                  backgroundColor: activeColor,
                  boxShadow: `0 4px 20px ${activeColor}45`
                }}
              >
                {isSubmitting
                  ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><Check size={18} /> Sync Profile</>
                }
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
