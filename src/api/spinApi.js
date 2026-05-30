import axios from 'axios'

const api = axios.create({
  baseURL: 'https://safaricomqrgame.igurukenya.app',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

export const registerSpinPlayer = (player_code) =>
  api.post('/api/spin/register', { player_code })

export const checkSpinEligibility = (player_code) =>
  api.post('/api/spin/play', { player_code })

export const submitSpinResult = (player_code, segment_id) =>
  api.post('/api/spin/result', { player_code, segment_id })

export const getSpinResult = (player_code) =>
  api.get(`/api/spin/player/${player_code}/result`)

// Always-live segment list — no auth required, fetched fresh on every wheel load
export const getPublicSegments = () =>
  api.get('/api/spin/segments/public')

export default api
