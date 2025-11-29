import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, useParams, useNavigate } from 'react-router-dom'
import './App.css'

const SHORTENER_API_URL = import.meta.env.VITE_SHORTENER_API_URL || 'https://example.com/shorten';
const REDIRECT_API_URL = import.meta.env.VITE_REDIRECT_API_URL || 'https://example.com';

function Shortener() {
    const [url, setUrl] = useState('')
    const [shortUrl, setShortUrl] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
        try {
            const response = await fetch(SHORTENER_API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            })
            const data = await response.json()
            // Construct the frontend URL for the redirect page
            const frontendUrl = `${window.location.origin}/short/${data.shortCode}`
            setShortUrl(frontendUrl)
        } catch (err) {
            setError('Failed to shorten URL')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="card">
            <h2>Create Short URL</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="url"
                    required
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Enter long URL"
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Shortening...' : 'Shorten'}
                </button>
            </form>
            {error && <p className="error">{error}</p>}
            {shortUrl && (
                <div className="result">
                    <p>Short URL:</p>
                    <a href={shortUrl} target="_blank">{shortUrl}</a>
                    <button onClick={() => navigator.clipboard.writeText(shortUrl)}>Copy</button>
                </div>
            )}
        </div>
    )
}

function Redirect() {
    const { code } = useParams()
    const [countdown, setCountdown] = useState(5)
    const [error, setError] = useState(false)

    useEffect(() => {
        // Here we could verify if the code exists using the Stats API or similar
        // For now, we assume it exists and just countdown

        const timer = setInterval(() => {
            setCountdown((prev) => prev - 1)
        }, 1000)

        if (countdown === 0) {
            clearInterval(timer)
            // Redirect to the backend redirect service which handles the 302
            window.location.href = `${REDIRECT_API_URL}/${code}`
        }

        return () => clearInterval(timer)
    }, [countdown, code])

    if (error) {
        return <div className="error-banner">URL not found</div>
    }

    return (
        <div className="redirect-page">
            <h2>Redirecting in {countdown} seconds...</h2>
            <div className="loader"></div>
            <p>Please wait while we take you to your destination.</p>
        </div>
    )
}

function App() {
    return (
        <Router>
            <div className="container">
                <h1>URL Shortener</h1>
                <Routes>
                    <Route path="/" element={<Shortener />} />
                    <Route path="/short/:code" element={<Redirect />} />
                </Routes>
            </div>
        </Router>
    )
}

export default App
