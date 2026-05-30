import { useEffect, useRef } from 'react'

const FALLBACK_COLORS = [
  '#00A651', '#007A3D', '#00C060', '#005c2e',
  '#00FF7F', '#004d26', '#33CC66', '#009944',
  '#006633', '#3ddc84', '#00b359', '#008040',
]

export default function PremiumWheel({ segments, onFinished, isSpinning, onReady }) {
  const wheelRef     = useRef(null)
  const onFinishedRef = useRef(onFinished)

  // Keep callback ref current without recreating the wheel
  useEffect(() => { onFinishedRef.current = onFinished }, [onFinished])

  useEffect(() => {
    if (!segments?.length) return
    if (!window.Winwheel) {
      console.error('Winwheel.js not loaded — check CDN scripts in index.html')
      return
    }

    // Destroy previous instance cleanly
    if (wheelRef.current) {
      try { wheelRef.current.stopAnimation(false) } catch {}
      wheelRef.current = null
    }

    const fontSize = Math.max(9, Math.min(14, Math.floor(190 / segments.length)))

    const winSegs = segments.map((s, i) => ({
      fillStyle:     s.fillStyle     || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      text:          s.text          || `Prize ${i + 1}`,
      strokeStyle:   s.strokeStyle   || 'rgba(255,255,255,0.6)',
      textFillStyle: s.textFillStyle || '#ffffff',
      textFontSize:  fontSize,
      textAlignment: 'outer',
    }))

    wheelRef.current = new window.Winwheel({
      canvasId:    'spin-canvas',
      numSegments: segments.length,
      segments:    winSegs,
      animation: {
        type:             'spinToStop',
        duration:         6,
        spins:            8,
        easing:           'Power4.easeOut',
        // Use a ref so stale-closure is never an issue
        callbackFinished: () => onFinishedRef.current?.(),
      },
      lineWidth:       2,
      strokeStyle:     'rgba(0,255,127,0.35)',
      textOrientation: 'curved',
      responsive:      true,
    })

    // Expose spin function to parent without forwardRef
    onReady?.((winnerIndex1Based) => {
      if (!wheelRef.current) return
      const stopAt = wheelRef.current.getRandomForSegment(winnerIndex1Based)
      wheelRef.current.animation.stopAngle = stopAt
      wheelRef.current.startAnimation()
    })

    return () => {
      if (wheelRef.current) {
        try { wheelRef.current.stopAnimation(false) } catch {}
        wheelRef.current = null
      }
    }
  }, [segments]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="wheel-wrap">
      {/* Glow rings behind canvas */}
      <div className={`wheel-glow-ring wheel-glow-ring--outer${isSpinning ? ' wheel-glow-ring--active' : ''}`} />
      <div className={`wheel-glow-ring wheel-glow-ring--inner${isSpinning ? ' wheel-glow-ring--active' : ''}`} />

      {/* Pointer */}
      <img
        src="/basic_pointer.png"
        className="wheel-pointer"
        alt="Win pointer"
        draggable={false}
      />

      {/* Winwheel canvas */}
      <canvas id="spin-canvas" width={500} height={500} className="wheel-canvas" />
    </div>
  )
}
