import '../styles/spin.css'

export default function SpinLandingPage() {
  return (
    <div className="spin-page">
      <div className="spin-page__bg" />
      <div className="spin-page__banner" />
      <div className="spin-page__content" style={{ textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 'clamp(1.5rem,5vw,2.8rem)', color: 'var(--neon)', letterSpacing: '0.05em', marginBottom: 8 }}>
          RHINO CHARGE 2026
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Spin &amp; Win — Player Registration</p>
        <div className="spin-divider" />
        <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Step 2 — Player code form coming next</p>
      </div>
    </div>
  )
}
