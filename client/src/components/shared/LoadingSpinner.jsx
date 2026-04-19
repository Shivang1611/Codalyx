import { motion } from 'framer-motion'

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--bg-base)]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        className="w-12 h-12 border-4 border-[var(--border)] border-t-[var(--cyan)] rounded-full"
      />
    </div>
  )
}
