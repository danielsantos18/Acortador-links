import { useState } from 'react'
import './App.css'

function App() {
    const [code, setCode] = useState('')
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const API_URL = import.meta.env.VITE_STATS_API_URL || 'https://example.com/stats'; // Replace with real API

    const fetchStats = async () => {
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(`${API_URL}/${code}`)
            if (!response.ok) {
                throw new Error('Stats not found')
            }
            const data = await response.json()
            setStats(data)
        } catch (err) {
            setError(err.message)
            setStats(null)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container">
            <h1>URL Statistics</h1>
            <div className="card">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter Short Code"
                />
                <button onClick={fetchStats} disabled={loading}>
                    {loading ? 'Loading...' : 'Get Stats'}
                </button>
            </div>

            {error && <p className="error">{error}</p>}

            {stats && (
                <div className="stats-result">
                    <h2>Statistics for {stats.shortCode}</h2>
                    <p><strong>Original URL:</strong> <a href={stats.originalUrl} target="_blank">{stats.originalUrl}</a></p>
                    <p><strong>Total Visits:</strong> {stats.visits}</p>
                    <p><strong>Created At:</strong> {new Date(stats.createdAt).toLocaleString()}</p>

                    <h3>Daily Visits</h3>
                    <ul>
                        {stats.dailyVisits && Object.entries(stats.dailyVisits).map(([date, count]) => (
                            <li key={date}>{date}: {count} visits</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default App
