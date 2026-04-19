import { motion } from 'framer-motion'

const variants = {
  initial: { opacity: 0, y: 16 },
  enter:   { opacity: 1, y: 0,
             transition: { duration: 0.35, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -8,
             transition: { duration: 0.2 } },
}

export default function PageWrapper({ children }) {
  return (
    <motion.div
      initial="initial"
      animate="enter"
      exit="exit"
      variants={variants}
      className="max-w-7xl mx-auto px-6 py-8"
    >
      {children}
    </motion.div>
  )
}
