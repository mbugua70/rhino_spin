import { useState, useRef, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import { User, AlertTriangle, PhoneCall } from 'lucide-react'
import PremiumWheel from '../components/spin/PremiumWheel'
import SpinButton from '../components/spin/SpinButton'
import { submitSpinResult, getPublicSegments } from '../api/spinApi'
import '../styles/spin.css'

function pickWinner(segments) {
  const winnable = segments.filter(
    (s) => s.is_active && s.is_winnable && s.quantity > 0
  )
  const pool = winnable.length ? winnable : segments.filter((s) => s.is_active && s.quantity > 0)
  if (!pool.length) return null
  return pool[Math.floor(Math.random() * pool.length)]
}

export default function SpinWheelPage() {
  const navigate  = useNavigate()
  const spinFnRef = useRef(null)  // spin function provided by PremiumWheel via onReady
  const winnerRef = useRef(null)  // winner held in ref so async callback always sees it
  const audioRef  = useRef(null)

  const [playerName,    setPlayerName]    = useState('')
  const [segments,      setSegments]      = useState([])
  const [spinStatus,    setSpinStatus]    = useState('idle')
  const [fetchingSegs,  setFetchingSegs]  = useState(true)
  const [fetchError,    setFetchError]    = useState('')

  // Always fetch live segments on mount — never trust localStorage for segments
  useEffect(() => {
    const code = localStorage.getItem('spin_player_code')
    const name = localStorage.getItem('spin_player_name')
    if (!code) { navigate('/'); return }

    setPlayerName(name || 'Player')

    getPublicSegments()
      .then((res) => {
        const raw    = res.data?.segments ?? []
        const sorted = [...raw]
          .filter((s) => s.is_active && s.quantity > 0)
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
        setSegments(sorted)
        setFetchingSegs(false)
      })
      .catch(() => {
        setFetchError('Could not load prizes. Please check your connection and refresh.')
        setFetchingSegs(false)
      })
  }, [navigate])

  // Cleanup audio if user navigates away mid-spin
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  // Called by Winwheel when the animation fully stops
  const handleSpinFinished = useCallback(async () => {
    // Do NOT stop the audio here — the track's ending contains the win reveal
    // sound that should play as the wheel comes to a stop. It will end naturally.

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
      // replace: true so back button cannot return to the wheel after winning
      setTimeout(() => navigate('/result', { state: { justWon: true }, replace: true }), 1800)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to record your result. Please contact event staff.'
      toast.error(msg, { duration: 10000 })
      setSpinStatus('error')
    }
  }, [navigate])

  const handleSpin = () => {
    if (spinStatus !== 'idle' || !segments.length) return
    if (!spinFnRef.current) {
      toast.error('Wheel is not ready yet. Please wait a moment and try again.')
      return
    }

    const winner = pickWinner(segments)
    if (!winner) {
      toast.error('No prizes available at this time. Please contact event staff.')
      return
    }
    winnerRef.current = winner

    try {
      const audio = new Audio('/audio/audio_one.mp3')
      audio.loop = false  // play once — the track ends with the win reveal sound
      audio.play().catch(() => {})
      audioRef.current = audio
      // Clear ref when audio finishes naturally so unmount cleanup knows
      audio.addEventListener('ended', () => { audioRef.current = null }, { once: true })
    } catch {}

    setSpinStatus('spinning')

    const winnerIndex1 = segments.findIndex((s) => s._id === winner._id) + 1
    spinFnRef.current(winnerIndex1)
  }

  const isEmpty = !fetchingSegs && segments.length === 0 && !fetchError

  return (
    <div className="spin-page">
      <div className="spin-page__bg" />
      <div className="spin-page__banner" />

      <div className="spin-page__content wheel-content">

        {/* Player name badge */}
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

        {/* Loading segments */}
        {fetchingSegs && (
          <motion.div className="result-loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="spin-ring" />
            <p style={{ color: 'var(--text-muted)', marginTop: 16, fontSize: '0.9rem' }}>
              Loading prizes&hellip;
            </p>
          </motion.div>
        )}

        {/* Fetch error */}
        {fetchError && (
          <motion.div
            className="wheel-empty spin-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertTriangle size={32} color="#f87171" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-secondary)', marginBottom: 8 }}>{fetchError}</p>
            <button
              className="result-retry-btn"
              style={{ marginTop: 8 }}
              onClick={() => window.location.reload()}
            >
              Refresh
            </button>
          </motion.div>
        )}

        {/* No-segments state */}
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
                No prizes are available right now.
              </p>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                Please contact event staff for assistance.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Wheel + spin controls */}
        {!fetchingSegs && !fetchError && !isEmpty && (
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
                  <motion.p key="idle" className="wheel-hint"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    Tap to spin the wheel
                  </motion.p>
                )}
                {spinStatus === 'submitting' && (
                  <motion.p key="sub" className="wheel-hint"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    Recording your result&hellip;
                  </motion.p>
                )}
                {spinStatus === 'completed' && (
                  <motion.p key="done" className="wheel-hint text-neon"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    Taking you to your prize&hellip;
                  </motion.p>
                )}
                {spinStatus === 'error' && (
                  <motion.div key="err" className="wheel-error-note"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <PhoneCall size={14} />
                    Please show this screen to event staff
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  )
}
