import StatCard from '../shared/StatCard'
import { CheckCircle2, Target, Zap, Globe } from 'lucide-react'
import { motion } from 'framer-motion'

export default function StatsHeader({ stats }) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const items = [
    { label: 'Total Solved', value: stats.solvedQuestions, subValue: `${stats.totalQuestions} submissions`, icon: <CheckCircle2 />, color: 'var(--green)' },
    { label: 'Global Accuracy', value: `${stats.accuracy}%`, subValue: 'Weighted average', icon: <Target />, color: 'var(--cyan)' },
    { label: 'Best Streak', value: stats.bestStreak, subValue: 'Continuous days', icon: <Zap />, color: 'var(--orange)' },
    { label: 'Managed Profiles', value: stats.profileCount, subValue: 'Connected accounts', icon: <Globe />, color: 'var(--purple)' },
  ]

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12"
    >
      {items.map((item, i) => (
        <StatCard key={i} {...item} />
      ))}
    </motion.div>
  )
}
