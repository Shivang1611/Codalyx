import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function SlidingPanel({ title, slides, accentColor = 'var(--cyan)', currentSlide, onPrev, onNext }) {
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-[var(--shadow-card)] transition-colors duration-200">
      <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg-surface)]">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-6 rounded-full" style={{ backgroundColor: accentColor }} />
          <h3 className="font-bold text-[var(--text-primary)] font-['Space_Grotesk'] tracking-tight">{title}</h3>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Slide {currentSlide + 1} / {slides.length}</span>
          <div className="flex items-center gap-1">
            <button 
              onClick={onPrev}
              disabled={currentSlide === 0}
              className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            <button 
              onClick={onNext}
              disabled={currentSlide === slides.length - 1}
              className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 min-h-[280px] overflow-y-auto relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="w-full"
          >
            {slides[currentSlide]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
