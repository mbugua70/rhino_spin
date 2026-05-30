import '../styles/spin.css'

export default function SpinWheelPage() {
  return (
    <div className="spin-page">
      <div className="spin-page__bg" />
      <div className="spin-page__content" style={{ textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', color: 'var(--neon)', marginBottom: 8 }}>
          Spin Wheel
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Step 3 — Winwheel canvas coming next</p>
      </div>
    </div>
  )
}
