import { motion } from 'framer-motion'
import { Trophy, Calendar, User, Gift } from 'lucide-react'

function formatDate(dateStr) {
  if (!dateStr) return ''
  try {
    return new Intl.DateTimeFormat('en-KE', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(new Date(dateStr))
  } catch {
    return dateStr
  }
}

function SnapshotRows({ snapshot }) {
  if (!snapshot || typeof snapshot !== 'object') return null
  const entries = Object.entries(snapshot).filter(
    ([, v]) => v !== null && v !== undefined && typeof v !== 'object' && typeof v !== 'boolean'
  )
  if (!entries.length) return null
  return entries.map(([key, value]) => (
    <div key={key} className="prize-snapshot-row">
      <span className="prize-snapshot-key">{key.replace(/_/g, ' ')}</span>
      <span className="prize-snapshot-val">{String(value)}</span>
    </div>
  ))
}

export default function PrizeResultModal({ spin, justWon = false }) {
  const { player_name, prize_name, spun_at, prize_snapshot } = spin

  return (
    <motion.div
      className="prize-modal spin-card"
      initial={{ opacity: 0, y: 44, scale: 0.93 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Trophy icon */}
      <motion.div
        className="prize-trophy"
        initial={{ scale: 0, rotate: -15 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 0.55, delay: 0.28, type: 'spring', stiffness: 200 }}
      >
        <Trophy size={44} color="var(--neon)" strokeWidth={1.5} />
      </motion.div>

      <div className="spin-divider" />

      {/* Card headline */}
      <motion.h2
        className="prize-headline"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {justWon ? 'YOU WON!' : 'YOUR PRIZE'}
      </motion.h2>

      {/* Prize name — the centrepiece */}
      <motion.div
        className="prize-name"
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        {prize_name || 'Prize'}
      </motion.div>

      {/* Player + date meta */}
      <motion.div
        className="prize-meta"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.52 }}
      >
        {player_name && (
          <div className="prize-meta-row">
            <User size={14} />
            <span>{player_name}</span>
          </div>
        )}
        {spun_at && (
          <div className="prize-meta-row">
            <Calendar size={14} />
            <span>{formatDate(spun_at)}</span>
          </div>
        )}
      </motion.div>

      {/* Prize snapshot details */}
      {prize_snapshot && <SnapshotRows snapshot={prize_snapshot} /> && (
        <motion.div
          className="prize-snapshot"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
        >
          <div className="prize-snapshot-header">
            <Gift size={13} />
            Prize Details
          </div>
          <SnapshotRows snapshot={prize_snapshot} />
        </motion.div>
      )}

      {/* Claim instruction */}
      <motion.p
        className="prize-staff-note"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.75 }}
      >
        Present this screen to event staff to claim your prize
      </motion.p>
    </motion.div>
  )
}
