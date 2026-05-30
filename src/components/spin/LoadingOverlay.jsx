import { motion } from 'framer-motion'

export default function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <motion.div
      className="loading-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      <div className="spin-ring" />
      <p className="loading-overlay__msg">{message}</p>
    </motion.div>
  )
}
