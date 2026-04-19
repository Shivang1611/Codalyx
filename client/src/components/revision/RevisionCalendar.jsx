import { useState } from 'react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isAfter } from 'date-fns'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function RevisionCalendar({ calendar, profileId, onUpdate }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(monthStart)
  const startDate = startOfWeek(monthStart)
  const endDate = endOfWeek(monthEnd)

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate })
  const today = new Date()

  const handleToggle = (date) => {
    if (isAfter(date, today)) return
    const dateStr = format(date, 'yyyy-MM-dd')
    const found = calendar.find(d => d.date === dateStr)
    onUpdate(dateStr, !found?.completed)
  }

  return (
    <div className="bg-[var(--bg-card)]/30 backdrop-blur-sm border border-[var(--border)] rounded-[32px] p-8">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-2xl font-black font-['Space_Grotesk'] text-[var(--text-primary)] tracking-tight">
            {format(currentMonth, 'MMMM')}
          </h3>
          <p className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] mt-1">{format(currentMonth, 'yyyy')} Performance Record</p>
        </div>
        <div className="flex items-center gap-1 bg-[var(--bg-hover)] p-1 rounded-xl border border-[var(--border)]">
          <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 hover:bg-[var(--bg-card)] rounded-lg transition-all text-[var(--text-secondary)]">
            <ChevronLeft size={18} />
          </button>
          <div className="w-px h-4 bg-[var(--border)] mx-1" />
          <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 hover:bg-[var(--bg-card)] rounded-lg transition-all text-[var(--text-secondary)]">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
          <div key={day} className="text-center text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((day, i) => {
          const dateStr = format(day, 'yyyy-MM-dd')
          const activity = calendar.find(d => d.date === dateStr)
          const isToday = isSameDay(day, today)
          const isFuture = isAfter(day, today)
          const isCurrentMonth = isSameMonth(day, monthStart)

          // Intensity logic
          const intensity = activity?.questions || (activity?.completed ? 1 : 0)
          
          return (
            <motion.div
              key={dateStr}
              onClick={() => handleToggle(day)}
              whileHover={!isFuture ? { y: -2, scale: 1.05 } : {}}
              className={`
                aspect-square rounded-xl flex items-center justify-center text-[11px] font-bold cursor-pointer relative group transition-all duration-300
                ${!isCurrentMonth ? 'opacity-10 pointer-events-none' : ''}
                ${isFuture ? 'text-[var(--text-muted)] opacity-20 cursor-not-allowed border border-dashed border-[var(--border)]' : ''}
                ${intensity > 0 
                  ? 'bg-[var(--cyan)] text-white shadow-lg shadow-[var(--cyan)]/20' 
                  : 'bg-[var(--bg-hover)] text-[var(--text-secondary)] hover:border-[var(--cyan)]/30 border border-transparent'}
                ${isToday && !activity?.completed ? 'border-2 border-[var(--cyan)]' : ''}
              `}
            >
              <span className="relative z-10 text-[11px] font-bold">{format(day, 'd')}</span>
              {intensity > 0 && (
                <>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl pointer-events-none" />
                  <div className="absolute bottom-1 right-1 lg:bottom-1.5 lg:right-1.5 text-[8px] font-black text-white/90">
                    {intensity} Q
                  </div>
                </>
              )}
              {isToday && (
                <div className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[var(--cyan)] ring-2 ring-[var(--bg-card)] shadow-sm shadow-[var(--cyan)]" />
              )}
            </motion.div>
          )
        })}
      </div>

      <div className="mt-10 pt-8 border-t border-[var(--border)] flex items-center justify-between">
        <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[var(--bg-hover)]" />
            <span>Inactive</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[var(--cyan)]" />
            <span>Active Review</span>
          </div>
        </div>
        <div className="text-[10px] font-bold text-[var(--text-muted)] italic">
          Tip: Click any day to manually toggle revision status.
        </div>
      </div>
    </div>
  )
}
