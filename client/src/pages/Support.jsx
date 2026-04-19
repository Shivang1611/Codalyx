import { useState } from 'react'
import { Send, CheckCircle2 } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import PageWrapper from '../components/shared/PageWrapper.jsx'
import api from '../utils/api.js'
import { toast } from 'sonner'
import { useAuth } from '../context/AuthContext.jsx'

export default function Support() {
  const { user } = useAuth()
  const [formData, setFormData] = useState({ subject: '', category: 'Bug Report', message: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setIsSubmitting(true)
      await api.post('/support/ticket', formData)
      setIsSubmitted(true)
      setFormData({ subject: '', category: 'Bug Report', message: '' })
    } catch {
      toast.error('Failed to send. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto py-8">

        <div className="mb-8">
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Contact Support</h1>
          <p className="text-sm text-[var(--text-muted)] mt-1">
            We typically respond within 2–4 hours on business days.
          </p>
        </div>

        <AnimatePresence mode="wait">
          {isSubmitted ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="py-16 flex flex-col items-center text-center gap-4"
            >
              <CheckCircle2 size={40} className="text-[var(--cyan)]" />
              <div>
                <p className="font-bold text-[var(--text-primary)]">Message sent!</p>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  A confirmation was sent to <span className="text-[var(--text-secondary)]">{user?.email}</span>
                </p>
              </div>
              <button
                onClick={() => setIsSubmitted(false)}
                className="mt-2 text-sm text-[var(--cyan)] hover:underline"
              >
                Send another message
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              {/* From email (read only) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">From</label>
                <div className="w-full px-4 py-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border)] text-sm text-[var(--text-muted)]">
                  {user?.email}
                </div>
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border)] text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--cyan)] transition-colors appearance-none cursor-pointer"
                >
                  <option>Bug Report</option>
                  <option>Feature Request</option>
                  <option>General Feedback</option>
                </select>
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Subject</label>
                <input
                  required
                  type="text"
                  placeholder="Brief summary..."
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--cyan)] transition-colors"
                />
              </div>

              {/* Message */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">Message</label>
                <textarea
                  required
                  rows={6}
                  placeholder="Describe your issue in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl bg-[var(--bg-hover)] border border-[var(--border)] text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--cyan)] transition-colors resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-3 bg-[var(--cyan)] hover:brightness-110 disabled:opacity-50 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-[var(--cyan-glow)]"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <Send size={15} />
                )}
                {isSubmitting ? 'Sending...' : 'Send message'}
              </button>
            </motion.form>
          )}
        </AnimatePresence>

      </div>
    </PageWrapper>
  )
}
