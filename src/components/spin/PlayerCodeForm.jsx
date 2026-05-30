import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Loader2, AlertCircle, KeyRound } from 'lucide-react'
import { registerSpinPlayer, checkSpinEligibility } from '../../api/spinApi'

export default function PlayerCodeForm() {
  const [playerCode, setPlayerCode] = useState('')
  const [status, setStatus]         = useState('idle')  // idle | loading | error
  const [errorMsg, setErrorMsg]     = useState('')
  const navigate = useNavigate()

  const clearError = () => {
    if (status === 'error') { setStatus('idle'); setErrorMsg('') }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const code = playerCode.trim().toUpperCase()
    if (!code || status === 'loading') return

    setStatus('loading')
    setErrorMsg('')

    try {
      // Step 1: Register the player
      const registerRes = await registerSpinPlayer(code)
      const { player_name } = registerRes.data.spin

      // Step 2: Check eligibility and fetch segments
      const playRes = await checkSpinEligibility(code)
      const { already_spun, segments, player_name: playName } = playRes.data

      localStorage.setItem('spin_player_code',  code)
      localStorage.setItem('spin_player_name',  playName || player_name || '')
      localStorage.setItem('spin_segments',      JSON.stringify(segments || []))

      if (already_spun) {
        navigate('/result')
      } else {
        navigate('/spin')
      }
    } catch (err) {
      const msg =
        err.response?.data?.message ||
        'Could not verify your code. Please check and try again.'
      setErrorMsg(msg)
      setStatus('error')
    }
  }

  const isLoading = status === 'loading'

  return (
    <form className="pcf" onSubmit={handleSubmit} noValidate>
      <div className="pcf__field">
        <label className="pcf__label" htmlFor="player-code">
          <KeyRound size={13} />
          Player Code
        </label>

        <input
          id="player-code"
          className={`pcf__input${status === 'error' ? ' pcf__input--error' : ''}`}
          type="text"
          value={playerCode}
          onChange={(e) => { setPlayerCode(e.target.value.toUpperCase()); clearError() }}
          placeholder="e.g. 753XPG"
          maxLength={12}
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          disabled={isLoading}
          required
        />

        <AnimatePresence>
          {errorMsg && (
            <motion.p
              className="pcf__error"
              initial={{ opacity: 0, y: -6, height: 0 }}
              animate={{ opacity: 1, y: 0, height: 'auto' }}
              exit={{ opacity: 0, y: -6, height: 0 }}
              transition={{ duration: 0.2 }}
            >
              <AlertCircle size={14} />
              {errorMsg}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        type="submit"
        className="pcf__btn"
        disabled={isLoading || !playerCode.trim()}
        whileHover={!isLoading ? { scale: 1.015 } : {}}
        whileTap={!isLoading ? { scale: 0.965 } : {}}
      >
        {isLoading ? (
          <>
            <Loader2 size={20} className="pcf__spinner" />
            Verifying...
          </>
        ) : (
          <>
            SPIN TO WIN
            <ArrowRight size={20} />
          </>
        )}
      </motion.button>
    </form>
  )
}
