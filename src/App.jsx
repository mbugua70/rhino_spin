import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import SpinLandingPage from './pages/SpinLandingPage'
import SpinWheelPage from './pages/SpinWheelPage'
import SpinResultPage from './pages/SpinResultPage'
import './App.css'

function App() {
  return (
    <BrowserRouter>
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
