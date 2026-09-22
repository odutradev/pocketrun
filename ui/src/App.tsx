import { useState, useEffect } from 'react'

import { footerStyle, mainContentStyle, appContainerStyle } from './styles'
import { HealthCheck } from './subcomponentes/HealthCheck'
import { Overview } from './subcomponentes/Overview'
import { Header } from './subcomponentes/Header'
import { fetchHealthPing } from './services/api'

export function App() {
  const [status, setStatus] = useState<string>('unknown')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  const handlePing = () => {
    setLoading(true)
    setError(null)
    fetchHealthPing()
      .then((data) => {
        setStatus(data?.status ?? 'unknown')
      })
      .catch((err) => {
        setStatus('offline')
        setError(err instanceof Error ? err.message : 'Failed to reach API')
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    let isMounted = true
    fetchHealthPing()
      .then((data) => {
        if (isMounted) setStatus(data?.status ?? 'unknown')
      })
      .catch((err) => {
        if (isMounted) {
          setStatus('offline')
          setError(err instanceof Error ? err.message : 'Failed to reach API')
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <div style={appContainerStyle}>
      <Header title="PocketRun" subtitle="Modern Micro-service Platform" />
      <main style={mainContentStyle}>
        <HealthCheck status={status} loading={loading} error={error} onCheck={handlePing} />
        <Overview />
      </main>
      <footer style={footerStyle}>
        <span>PocketRun &copy; 2026</span>
      </footer>
    </div>
  )
}

export default App
