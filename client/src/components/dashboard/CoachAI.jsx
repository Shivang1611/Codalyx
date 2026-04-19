import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, X, Send, Sparkles, Terminal, Zap, RotateCcw, WifiOff, Clock } from 'lucide-react'
import api from '../../utils/api.js'
import { toast } from 'sonner'

export default function CoachAI() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [response, setResponse] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)   // null | 'rate_limit' | 'network'
  const [countdown, setCountdown] = useState(0)
  const countdownRef = useRef(null)

  // Live countdown timer
  const startCountdown = (seconds) => {
    setCountdown(seconds)
    clearInterval(countdownRef.current)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) { clearInterval(countdownRef.current); return 0; }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => () => clearInterval(countdownRef.current), [])

  const handleAsk = async () => {
    if (!query.trim()) return toast.error('Please enter a coding question first')
    if (countdown > 0) return toast.warning(`Please wait ${countdown}s before retrying`)
    setIsLoading(true)
    setResponse('')
    setError(null)
    try {
      const res = await api.post('/ai/review', { code: '', context: query })
      const text = res.data.review || ''
      if (text.includes('RATE_LIMIT_ERROR')) {
        setError('rate_limit')
        startCountdown(65)
      } else if (text.includes('NETWORK_ERROR')) {
        setError('network')
      } else {
        setResponse(text)
      }
    } catch (err) {
      setError('network')
      toast.error('CoachAI is temporarily unavailable')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleAsk()
  }

  return (
    <>
      {/* Floating Trigger */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-[var(--cyan)] text-white rounded-2xl shadow-xl shadow-[var(--cyan-glow)] flex items-center justify-center z-[100] group"
      >
        <Bot size={26} className="group-hover:scale-110 transition-transform" />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center sm:p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full sm:max-w-2xl bg-[var(--bg-card)] border border-[var(--border)] rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[var(--cyan)]/10 border border-[var(--cyan)]/20 text-[var(--cyan)] rounded-xl flex items-center justify-center">
                    <Zap size={18} strokeWidth={2.5} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--text-primary)]">CoachAI</p>
                    <p className="text-[10px] text-[var(--cyan)] font-bold uppercase tracking-wider">Coding Assistant</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-hover)] transition-all"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6 space-y-5">
                {/* Input */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                    <Terminal size={11} /> Ask anything about code
                  </label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. How does Merge Sort work? / Explain time complexity of BFS... (⌘+Enter to send)"
                    rows={4}
                    className="w-full bg-[var(--bg-hover)] border border-[var(--border)] rounded-2xl px-5 py-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--cyan)] transition-all resize-none leading-relaxed"
                  />
                  <button
                    onClick={handleAsk}
                    disabled={isLoading || countdown > 0}
                    className="w-full bg-[var(--cyan)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-[var(--cyan-glow)]"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : countdown > 0 ? (
                      <><Clock size={14} /> Ready in {countdown}s</>
                    ) : (
                      <><Send size={14} /> Ask CoachAI</>
                    )}
                  </button>
                </div>

                {/* Loading dots */}
                {isLoading && (
                  <div className="flex items-center gap-3 py-1">
                    <div className="flex gap-1">
                      {[0, 0.15, 0.3].map((delay, i) => (
                        <div key={i} className="w-2 h-2 rounded-full bg-[var(--cyan)] animate-bounce" style={{ animationDelay: `${delay}s` }} />
                      ))}
                    </div>
                    <span className="text-xs text-[var(--text-muted)] font-medium">CoachAI is thinking…</span>
                  </div>
                )}

                {/* Error state */}
                {error && !isLoading && (
                  <div className="bg-[var(--bg-hover)] border border-[var(--border)] rounded-2xl p-5 space-y-3">
                    {error === 'rate_limit' ? (
                      <>
                        <div className="flex items-center gap-2 text-amber-500 text-sm font-bold">
                          <Clock size={15} />
                          {countdown > 0
                            ? `AI quota window — ready in ${countdown}s`
                            : 'Ready to retry!'}
                        </div>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                          CoachAI automatically tried 3 different AI models — all are at capacity right now. This is a Gemini free-tier limit. Wait for the timer, then retry.
                        </p>
                        <button
                          onClick={handleAsk}
                          disabled={countdown > 0}
                          className="flex items-center gap-2 text-xs text-[var(--cyan)] font-bold hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <RotateCcw size={12} /> {countdown > 0 ? `Retry in ${countdown}s` : 'Retry now'}
                        </button>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center gap-2 text-red-400 text-sm font-bold">
                          <WifiOff size={15} /> Connection error
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">Check your internet connection and try again.</p>
                        <button onClick={handleAsk} className="flex items-center gap-2 text-xs text-[var(--cyan)] font-bold hover:underline">
                          <RotateCcw size={12} /> Retry
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Response */}
                {response && !isLoading && !error && (
                  <div className="border-t border-[var(--border)] pt-5 space-y-4">
                    <div className="flex items-center gap-2 text-[10px] font-black text-[var(--cyan)] uppercase tracking-widest">
                      <Sparkles size={11} /> AI Response
                    </div>
                    <div
                      className="bg-[var(--bg-hover)] border border-[var(--border)] rounded-2xl p-5 text-sm text-[var(--text-primary)] leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: formatMarkdown(response) }}
                    />
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  )
}

function formatMarkdown(text) {
  if (!text) return ''
  text = text.replace(/^### (.*$)/gim, '<h3 class="text-base font-bold text-[var(--text-primary)] mt-4 mb-2">$1</h3>')
  text = text.replace(/^## (.*$)/gim, '<h2 class="text-lg font-bold text-[var(--text-primary)] mt-5 mb-3">$1</h2>')
  text = text.replace(/^# (.*$)/gim, '<h1 class="text-xl font-bold text-[var(--text-primary)] mb-4">$1</h1>')
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-[var(--cyan)] font-bold">$1</strong>')
  text = text.replace(/`([^`]+)`/g, '<code class="bg-[var(--bg-base)] text-[var(--cyan)] px-1.5 py-0.5 rounded text-[11px] font-mono">$1</code>')
  text = text.replace(/```([\s\S]*?)```/g, '<pre class="bg-[var(--bg-base)] border border-[var(--border)] p-4 rounded-xl font-mono text-[11px] text-[var(--text-secondary)] my-4 overflow-x-auto">$1</pre>')
  text = text.replace(/\n/g, '<br />')
  return text
}
