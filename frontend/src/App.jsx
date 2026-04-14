import { useState, useEffect } from "react"
import axios from "axios"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]

export default function App() {
  const [form, setForm] = useState({
    temperature_max: 35,
    temperature_min: 26,
    precipitation: 0,
    windspeed_max: 15,
    month: new Date().getMonth() + 1,
    note: "",
  })
  const [result, setResult] = useState(null)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => { fetchHistory() }, [])

  async function fetchHistory() {
    try {
      const res = await axios.get(`${API}/history?limit=10`)
      setHistory(res.data)
    } catch {}
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      const res = await axios.post(`${API}/predict`, {
        ...form,
        temperature_max: Number(form.temperature_max),
        temperature_min: Number(form.temperature_min),
        precipitation: Number(form.precipitation),
        windspeed_max: Number(form.windspeed_max),
        month: Number(form.month),
      })
      setResult(res.data)
      fetchHistory()
    } catch (err) {
      setError(err.response?.data?.detail || "Connection error — is the backend running?")
    }
    setLoading(false)
  }

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-sky-100 p-6">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center pt-4">
          <h1 className="text-3xl font-bold text-blue-800">🌤 Weather Predictor</h1>
          <p className="text-blue-500 text-sm mt-1">ML-powered tomorrow forecast • Bangkok</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md p-6 space-y-4">
          <h2 className="font-semibold text-gray-700 text-base">Today's Weather Data</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max Temp (°C)</label>
              <input type="number" step="0.1" className={inp}
                value={form.temperature_max}
                onChange={e => setForm({...form, temperature_max: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Min Temp (°C)</label>
              <input type="number" step="0.1" className={inp}
                value={form.temperature_min}
                onChange={e => setForm({...form, temperature_min: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Precipitation (mm)</label>
              <input type="number" step="0.1" min="0" className={inp}
                value={form.precipitation}
                onChange={e => setForm({...form, precipitation: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Max Wind Speed (km/h)</label>
              <input type="number" step="0.1" min="0" className={inp}
                value={form.windspeed_max}
                onChange={e => setForm({...form, windspeed_max: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Month</label>
              <select className={inp} value={form.month}
                onChange={e => setForm({...form, month: Number(e.target.value)})}>
                {MONTHS.map((m, i) => (
                  <option key={i} value={i+1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Note (optional)</label>
              <input type="text" className={inp} placeholder="e.g. Bangkok"
                value={form.note}
                onChange={e => setForm({...form, note: e.target.value})} />
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-2">
              <p className="text-red-600 text-sm">⚠ {error}</p>
            </div>
          )}

          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50 text-sm">
            {loading ? "Predicting..." : "Predict Tomorrow →"}
          </button>
        </form>

        {/* Result */}
        {result && (
          <div className={`rounded-2xl shadow-md p-6 text-white transition-all ${result.will_rain ? "bg-gradient-to-r from-blue-500 to-blue-700" : "bg-gradient-to-r from-orange-400 to-amber-500"}`}>
            <h2 className="font-bold text-lg mb-4">Tomorrow's Forecast</h2>
            <div className="flex justify-around text-center">
              <div>
                <div className="text-5xl font-bold">{result.predicted_temp_max}°</div>
                <div className="text-sm opacity-80 mt-1">Max Temperature (°C)</div>
              </div>
              <div className="w-px bg-white opacity-30"></div>
              <div>
                <div className="text-5xl">{result.will_rain ? "🌧" : "☀️"}</div>
                <div className="text-sm opacity-80 mt-1 font-medium">
                  {result.will_rain ? "Rain Expected" : "No Rain"}
                </div>
                <div className="text-xs opacity-70 mt-0.5">
                  {(result.rain_probability * 100).toFixed(0)}% probability
                </div>
              </div>
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="font-semibold text-gray-700 mb-4">Recent Predictions</h2>
            <div className="space-y-3">
              {history.map(h => (
                <div key={h.id} className="flex items-center justify-between text-sm py-2 border-b border-gray-100 last:border-0">
                  <div>
                    <div className="text-gray-800 font-medium">
                      {h.will_rain ? "🌧" : "☀️"} {h.predicted_temp_max}°C
                      {h.note && <span className="text-blue-500 ml-2">• {h.note}</span>}
                    </div>
                    <div className="text-gray-400 text-xs mt-0.5">
                      {new Date(h.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${h.will_rain ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                    {(h.rain_probability * 100).toFixed(0)}% rain
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
