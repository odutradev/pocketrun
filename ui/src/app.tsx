import { useState, useEffect } from 'react'

import { AuthProvider, useAuth } from './context/authContext'
import { Dashboard } from './components/dashboard'
import { AuthModal } from './components/authModal'
import { SetupWizard } from './components/setupWizard'
import { fetchHealthPing, fetchSetupStatus } from './services/api'
import { Navbar } from './components/navbar'

export const AppContent = () => {
  const { user } = useAuth()
  const [apiStatus, setApiStatus] = useState<string>('checking...')
  const [setupRequired, setSetupRequired] = useState<boolean | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false)

  const checkStatus = async () => {
    try {
      await fetchHealthPing()
      setApiStatus('online')

      // Check setup status
      const statusRes = await fetchSetupStatus()
      setSetupRequired(statusRes.setup_required)
    } catch {
      setApiStatus('offline')
    }
  }

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        apiStatus={apiStatus}
        setupRequired={setupRequired === true}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <main style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '0 32px 48px' }}>
        {setupRequired === true && !user ? (
          <SetupWizard
            onSuccess={() => {
              setSetupRequired(false)
            }}
          />
        ) : (
          <Dashboard onOpenAuth={() => setIsAuthModalOpen(true)} />
        )}
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

      {!setupRequired && (
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      )}
    </div>
  )
}

export const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
)

export default App
