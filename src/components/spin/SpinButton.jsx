import { motion } from 'framer-motion'
import { RotateCcw, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

const CONFIG = {
  idle:       { label: 'SPIN NOW',         Icon: RotateCcw,   spin: false },
  spinning:   { label: 'SPINNING',         Icon: null,        spin: false },
  submitting: { label: 'Recording...',     Icon: Loader2,     spin: true  },
  completed:  { label: 'CONGRATULATIONS!', Icon: CheckCircle, spin: false },
  error:      { label: 'Error',            Icon: AlertCircle, spin: false },
}

export default function SpinButton({ status, onClick }) {
  const { label, Icon, spin } = CONFIG[status] ?? CONFIG.idle
  const disabled = status !== 'idle'

  return (
    <motion.button
      className={`spin-btn spin-btn--${status}`}
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { scale: 1.025 } : {}}
      whileTap={!disabled  ? { scale: 0.965 } : {}}
    >
      {Icon && <Icon size={22} className={spin ? 'spin-btn__spin-icon' : ''} />}

      {status === 'spinning' && (
        <span className="spin-btn__dots" aria-hidden="true">
          <span /><span /><span />
        </span>
      )}

      {label}
    </motion.button>
  )
}
