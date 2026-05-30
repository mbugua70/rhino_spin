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

const HIDDEN_KEYS = new Set([
  'fillStyle', 'strokeStyle', 'textFillStyle', 'textFontSize',
  'gift_number', 'sort_order', 'is_active', 'is_winnable',
  'createdAt', 'updatedAt', '_id', '__v',
])

function getSnapshotEntries(snapshot) {
  if (!snapshot || typeof snapshot !== 'object') return []
  return Object.entries(snapshot).filter(
    ([k, v]) =>
      !HIDDEN_KEYS.has(k) &&
      v !== null && v !== undefined &&
      typeof v !== 'object' && typeof v !== 'boolean'
  )
}

export default function PrizeResultModal({ spin, justWon = false }) {
  const { player_name, prize_name, spun_at, prize_snapshot } = spin
  const snapshotEntries = getSnapshotEntries(prize_snapshot)

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

      {/* Prize name — centrepiece */}
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

      {/* Prize snapshot — only rendered when there are valid flat entries */}
      {snapshotEntries.length > 0 && (
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
          {snapshotEntries.map(([key, value]) => (
            <div key={key} className="prize-snapshot-row">
              <span className="prize-snapshot-key">{key.replace(/_/g, ' ')}</span>
              <span className="prize-snapshot-val">{String(value)}</span>
            </div>
          ))}
        </motion.div>
      )}

    </motion.div>
  )
}
