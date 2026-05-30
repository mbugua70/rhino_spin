import { motion } from 'framer-motion'
import PlayerCodeForm from '../components/spin/PlayerCodeForm'
import '../styles/spin.css'

export default function SpinLandingPage() {
  return (
    <div className="spin-page">
      {/* Backgrounds */}
      <div className="spin-page__bg" />
      <div className="spin-page__banner" />

      {/* Decorative neon rings */}
      <div className="landing-rings" aria-hidden="true">
        <span className="landing-ring landing-ring--1" />
        <span className="landing-ring landing-ring--2" />
        <span className="landing-ring landing-ring--3" />
      </div>

      <div className="spin-page__content landing-content">

        {/* Safaricom event badge */}
        <motion.div
          className="landing-saf-badge"
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="landing-saf-dot" />
          SAFARICOM × RHINO CHARGE
        </motion.div>

        {/* Main headline */}
        <motion.div
          className="landing-header"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <h1 className="landing-title">
            RHINO
            <span className="landing-title__year">CHARGE 2026</span>
          </h1>
          <p className="landing-tagline">Spin &bull; Win &bull; Celebrate</p>
        </motion.div>

        {/* Glassmorphism card */}
        <motion.div
          className="spin-card landing-card"
          initial={{ opacity: 0, y: 36, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.65, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="spin-divider" />
          <h2 className="landing-card__title">CLAIM YOUR SPIN</h2>
          <p className="landing-card__subtitle">
            Enter the player code from your Safaricom event QR to&nbsp;start&nbsp;spinning
          </p>

          <PlayerCodeForm />
        </motion.div>

        {/* Footer note */}
        <motion.p
          className="landing-footer-note"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55, duration: 0.5 }}
        >
          Each player code is valid for one spin only
        </motion.p>

      </div>
    </div>
  )
}
