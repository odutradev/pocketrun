import { useState, useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { Navbar } from './components/Navbar'
import { Dashboard } from './components/Dashboard'
import { AuthModal } from './components/AuthModal'
import { fetchHealthPing } from './services/api'

export function AppContent() {
  const [apiStatus, setApiStatus] = useState<string>('checking...')
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false)

  const checkHealth = () => {
    fetchHealthPing()
      .then(() => setApiStatus('online'))
      .catch(() => setApiStatus('offline'))
  }

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar apiStatus={apiStatus} onOpenAuth={() => setIsAuthModalOpen(true)} />

      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '0 32px 48px' }}>
        <Dashboard onOpenAuth={() => setIsAuthModalOpen(true)} />
      </main>

      <footer style={{
        borderTop: '1px solid var(--border-color)',
        padding: '24px 32px',
        textAlign: 'center',
        fontSize: '0.85rem',
        color: 'var(--text-muted)'
      }}>
        <span>PocketRun &copy; 2026 — Pluggable Multi-Tenant Key-Value BaaS Platform</span>
      </footer>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}

export function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App
