import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import { AlertTriangle, RefreshCcw, LogOut } from 'lucide-react'
import PrizeResultModal from '../components/spin/PrizeResultModal'
import { getSpinResult } from '../api/spinApi'
import '../styles/spin.css'

const CONFETTI_COLORS = [
  '#00A651', '#00FF7F', '#ffffff',
  '#FFD700', '#33CC66', '#007A3D', '#00C060',
]

export default function SpinResultPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const justWon  = location.state?.justWon === true

  const [status,       setStatus]       = useState('loading') // loading | success | error
  const [spin,         setSpin]         = useState(null)
  const [errorMsg,     setErrorMsg]     = useState('')
  const [showConfetti, setShowConfetti] = useState(justWon)

  const handleNewPlayer = () => {
    localStorage.removeItem('spin_player_code')
    localStorage.removeItem('spin_player_name')
    localStorage.removeItem('spin_segments')
    navigate('/', { replace: true })
  }

  const fetchResult = (playerCode) =>
    getSpinResult(playerCode)
      .then((res) => {
        const spinData = res.data?.spin
        if (!spinData?.has_spun) { navigate('/spin'); return }
        setSpin(spinData)
        setStatus('success')
      })
      .catch((err) => {
        setErrorMsg(err.response?.data?.message || 'Failed to load your result.')
        setStatus('error')
      })

  useEffect(() => {
    const playerCode = localStorage.getItem('spin_player_code')
    if (!playerCode) { navigate('/'); return }
    fetchResult(playerCode)
  }, [navigate]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRetry = () => {
    const playerCode = localStorage.getItem('spin_player_code')
    if (!playerCode) { navigate('/'); return }
    setStatus('loading')
    setErrorMsg('')
    fetchResult(playerCode)
  }

  return (
    <div className="spin-page">
      <div className="spin-page__bg" />
      <div className="spin-page__banner" />

      {/* Confetti — only for fresh wins, recycle=false so it fades out */}
      {showConfetti && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={340}
          colors={CONFETTI_COLORS}
          gravity={0.16}
          tweenDuration={7000}
          onConfettiComplete={() => setShowConfetti(false)}
        />
      )}

      <div className="spin-page__content result-content">

        {/* Loading state */}
        {status === 'loading' && (
          <motion.div
            className="result-loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="spin-ring" />
            <p style={{ color: 'var(--text-muted)', marginTop: 18, fontSize: '0.9rem' }}>
              Loading your result&hellip;
            </p>
          </motion.div>
        )}

        {/* Error state */}
        {status === 'error' && (
          <motion.div
            className="result-error spin-card"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <AlertTriangle size={36} color="#f87171" style={{ margin: '0 auto 16px' }} />
            <p style={{ color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
              {errorMsg}
            </p>
            <button className="result-retry-btn" onClick={handleRetry}>
              <RefreshCcw size={15} />
              Try Again
            </button>
          </motion.div>
        )}

        {/* Success state */}
        <AnimatePresence>
          {status === 'success' && spin && (
            <>
              {/* Page header */}
              <motion.div
                className="result-header"
                initial={{ opacity: 0, y: -18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="landing-saf-badge">
                  <span className="landing-saf-dot" />
                  SAFARICOM × RHINO CHARGE
                </div>
                <h1 className="result-headline">
                  {justWon ? 'CONGRATULATIONS!' : 'RHINO CHARGE 2026'}
                </h1>
              </motion.div>

              {/* Prize card */}
              <PrizeResultModal spin={spin} justWon={justWon} />

              {/* Next player */}
              <motion.button
                className="new-player-btn"
                onClick={handleNewPlayer}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                <LogOut size={16} />
                Next Player
              </motion.button>
            </>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
