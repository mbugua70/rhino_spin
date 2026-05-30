import { useEffect, useRef } from 'react'
import gsap from 'gsap'

// Winwheel.js (loaded via public/Winwheel.js) calls window.TweenMax internally.
// GSAP 3 is API-compatible with TweenMax for the subset Winwheel uses.
if (typeof window !== 'undefined') window.TweenMax = gsap

const FALLBACK_COLORS = [
  '#00A651', '#007A3D', '#00C060', '#005c2e',
  '#00FF7F', '#004d26', '#33CC66', '#009944',
  '#006633', '#3ddc84', '#00b359', '#008040',
]

export default function PremiumWheel({ segments, onFinished, isSpinning, onReady }) {
  const wheelRef      = useRef(null)
  const onFinishedRef = useRef(onFinished)

  // Keep the callback current without recreating the wheel
  useEffect(() => { onFinishedRef.current = onFinished }, [onFinished])

  useEffect(() => {
    if (!segments?.length) return
    if (!window.Winwheel) {
      console.error('Winwheel not found on window — check public/Winwheel.js is loading')
      return
    }

    // Destroy previous instance cleanly
    if (wheelRef.current) {
      try { wheelRef.current.stopAnimation(false) } catch {}
      wheelRef.current = null
    }

    // Center alignment keeps text in the middle of each segment's radius
    // so long labels can't overflow the outer rim or the center hub
    const fontSize = Math.max(10, Math.min(15, Math.floor(220 / segments.length)))

    const winSegs = segments.map((s, i) => ({
      fillStyle:     s.fillStyle     || FALLBACK_COLORS[i % FALLBACK_COLORS.length],
      text:          s.text          || `Prize ${i + 1}`,
      strokeStyle:   s.strokeStyle   || 'rgba(255,255,255,0.6)',
      textFillStyle: s.textFillStyle || '#ffffff',
      textFontSize:  fontSize,
      textAlignment: 'center',
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
        callbackFinished: () => onFinishedRef.current?.(),
      },
      lineWidth:       2,
      strokeStyle:     'rgba(0,255,127,0.35)',
      textOrientation: 'vertical',
      textAlignment:   'center',
    })

    // Hand a spin function to the parent — avoids forwardRef complexity
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
      {/* Pointer sits at 12 o'clock, tip pointing into the wheel */}
      <img
        src="/basic_pointer.png"
        className="wheel-pointer"
        alt="Win pointer"
        draggable={false}
      />

      {/* Dark outer ring */}
      <div className={`wheel-outer-ring${isSpinning ? ' wheel-outer-ring--spinning' : ''}`}>
        {/* Gold accent ring */}
        <div className="wheel-gold-ring">
          {/* Canvas container */}
          <div className="wheel-canvas-container">
            <canvas id="spin-canvas" width={500} height={500} className="wheel-canvas" />
            {/* Center hub */}
            <div className="wheel-center-hub" />
          </div>
        </div>
      </div>
    </div>
  )
}
