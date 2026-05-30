import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { User, AlertTriangle } from 'lucide-react'
import PremiumWheel from '../components/spin/PremiumWheel'
import SpinButton from '../components/spin/SpinButton'
import { submitSpinResult } from '../api/spinApi'
import '../styles/spin.css'

function pickWinner(segments) {
  const winnable = segments.filter(
    (s) => s.is_active && s.is_winnable && (s.quantity == null || s.quantity > 0)
  )
  const pool = winnable.length ? winnable : segments.filter((s) => s.is_active)
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function SpinWheelPage() {
  const navigate    = useNavigate()
  const spinFnRef   = useRef(null)   // set by PremiumWheel via onReady
  const winnerRef   = useRef(null)   // winner held across async callback
  const audioRef    = useRef(null)

  const [playerName, setPlayerName] = useState('')
  const [segments,   setSegments]   = useState([])
  const [spinStatus, setSpinStatus] = useState('idle')

  // Read localStorage; redirect if session missing
  useEffect(() => {
    const code    = localStorage.getItem('spin_player_code')
    const name    = localStorage.getItem('spin_player_name')
    const segsRaw = localStorage.getItem('spin_segments')

    if (!code) { navigate('/'); return }

    setPlayerName(name || 'Player')

    try {
      const parsed = JSON.parse(segsRaw || '[]')
      const sorted = [...parsed].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      setSegments(sorted)
    } catch {
      setSegments([])
    }
  }, [navigate])

  // Called by Winwheel when animation fully stops
  const handleSpinFinished = useCallback(async () => {
    // Fade out spin audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      audioRef.current = null
    }

    setSpinStatus('submitting')

    const playerCode = localStorage.getItem('spin_player_code')
    const winner     = winnerRef.current

    if (!winner) {
      toast.error('Could not determine winning segment. Please contact event staff.')
      setSpinStatus('error')
      return
    }

    try {
      await submitSpinResult(playerCode, winner._id)
      setSpinStatus('completed')
      // Brief pause so the CONGRATULATIONS button is visible, then go to result
      setTimeout(() => navigate('/result', { state: { justWon: true } }), 1800)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to record result. Please contact event staff.'
      toast.error(msg, { duration: 8000 })
      setSpinStatus('error')
    }
  }, [navigate])

  const handleSpin = () => {
    if (spinStatus !== 'idle' || !segments.length) return
    if (!spinFnRef.current) {
      toast.error('Wheel not ready yet. Please wait a moment.')
      return
    }

    const winner = pickWinner(segments)
    if (!winner) {
      toast.error('No prizes available at this time. Please contact event staff.')
      return
    }
    winnerRef.current = winner

    // Start spin audio
    try {
      const audio = new Audio('/audio/audio_one.mp3')
      audio.loop  = true
      audio.play().catch(() => {})
      audioRef.current = audio
    } catch {}

    setSpinStatus('spinning')

    const winnerIndex1 = segments.findIndex((s) => s._id === winner._id) + 1
    spinFnRef.current(winnerIndex1)
  }

  const isEmpty = segments.length === 0

  return (
    <div className="spin-page">
      <div className="spin-page__bg" />
      <div className="spin-page__banner" />

      <div className="spin-page__content wheel-content">

        {/* Player badge */}
        <motion.div
          className="wheel-player-badge"
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <User size={14} />
          {playerName}
        </motion.div>

        {/* Page headline */}
        <motion.h1
          className="wheel-page-title"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.08 }}
        >
          SPIN &amp; WIN
        </motion.h1>

        {/* Empty / no-segments state */}
        <AnimatePresence>
          {isEmpty && (
            <motion.div
              className="wheel-empty spin-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
            >
              <AlertTriangle size={32} color="var(--neon)" style={{ margin: '0 auto 16px' }} />
              <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>
                No prizes available right now.
              </p>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                Please contact event staff for assistance.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wheel + spin button */}
        {!isEmpty && (
          <motion.div
            className="wheel-stage"
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.65, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          >
            <PremiumWheel
              segments={segments}
              onFinished={handleSpinFinished}
              isSpinning={spinStatus === 'spinning'}
              onReady={(fn) => { spinFnRef.current = fn }}
            />

            <div className="wheel-btn-wrap">
              <SpinButton status={spinStatus} onClick={handleSpin} />

              <AnimatePresence mode="wait">
                {spinStatus === 'idle' && (
                  <motion.p
                    key="hint-idle"
                    className="wheel-hint"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  >
                    Tap to spin the wheel
                  </motion.p>
                )}
                {spinStatus === 'submitting' && (
                  <motion.p
                    key="hint-sub"
                    className="wheel-hint"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  >
                    Recording your result&hellip;
                  </motion.p>
                )}
                {spinStatus === 'completed' && (
                  <motion.p
                    key="hint-done"
                    className="wheel-hint text-neon"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  >
                    Taking you to your prize&hellip;
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}
