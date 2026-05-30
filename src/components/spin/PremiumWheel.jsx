import { useEffect, useRef } from 'react'
import gsap from 'gsap'

if (typeof window !== 'undefined') window.TweenMax = gsap

const FALLBACK_COLORS = [
  '#00A651', '#007A3D', '#00C060', '#005c2e',
  '#00FF7F', '#004d26', '#33CC66', '#009944',
  '#006633', '#3ddc84', '#00b359', '#008040',
]

export default function PremiumWheel({ segments, onFinished, isSpinning, onReady, onFrame }) {
  const wheelRef       = useRef(null)
  const onFinishedRef  = useRef(onFinished)
  const onFrameRef     = useRef(onFrame)

  useEffect(() => { onFinishedRef.current = onFinished }, [onFinished])
  useEffect(() => { onFrameRef.current    = onFrame    }, [onFrame])

  useEffect(() => {
    if (!segments?.length) return
    if (!window.Winwheel) {
      console.error('Winwheel not found — check public/Winwheel.js')
      return
    }

    if (wheelRef.current) {
      try { wheelRef.current.stopAnimation(false) } catch {}
      wheelRef.current = null
    }

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
        type:     'spinToStop',
        duration: 10,   // matched to audio length (~10 s)
        spins:    8,
        easing:   'Power4.easeOut',
        // callbackAfter fires every animation frame — first call starts audio,
        // subsequent calls are no-ops (browser ignores play() on already-playing audio)
        callbackAfter:    () => onFrameRef.current?.(),
        callbackFinished: () => onFinishedRef.current?.(),
      },
      lineWidth:       2,
      strokeStyle:     'rgba(0,255,127,0.35)',
      textOrientation: 'horizontal',
      textAlignment:   'center',
    })

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
      <img src="/basic_pointer.png" className="wheel-pointer" alt="Win pointer" draggable={false} />
      <div className={`wheel-outer-ring${isSpinning ? ' wheel-outer-ring--spinning' : ''}`}>
        <div className="wheel-gold-ring">
          <div className="wheel-canvas-container">
            <canvas id="spin-canvas" width={500} height={500} className="wheel-canvas" />
            <div className="wheel-center-hub" />
          </div>
        </div>
      </div>
    </div>
  )
}
