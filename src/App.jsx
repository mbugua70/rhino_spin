import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import SpinLandingPage from './pages/SpinLandingPage'
import SpinWheelPage from './pages/SpinWheelPage'
import SpinResultPage from './pages/SpinResultPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#071209',
            border: '1px solid rgba(0,255,127,0.2)',
            color: '#ffffff',
            fontFamily: 'Inter, system-ui, sans-serif',
          },
        }}
      />
      <Routes>
        <Route path="/"       element={<SpinLandingPage />} />
        <Route path="/spin"   element={<SpinWheelPage />} />
        <Route path="/result" element={<SpinResultPage />} />
        <Route path="*"       element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
