import { useState, useEffect } from 'react'
import { Box, Flex, Text } from '@radix-ui/themes'

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
    <Flex direction="column" style={{ minHeight: '100vh' }}>
      <Navbar
        apiStatus={apiStatus}
        setupRequired={setupRequired === true}
        onOpenAuth={() => setIsAuthModalOpen(true)}
      />

      <Box asChild style={{ flex: 1, maxWidth: '1280px', width: '100%', margin: '0 auto', padding: '0 24px 48px' }}>
        <main>
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
      </Box>

      <Box
        asChild
        style={{
          borderTop: '1px solid var(--gray-a4)',
          padding: '24px',
          textAlign: 'center',
          backgroundColor: 'rgba(11, 13, 19, 0.5)',
        }}
      >
        <footer>
          <Text size="1" color="gray">
            PocketRun &copy; 2026 — Pluggable Multi-Tenant Key-Value BaaS Platform
          </Text>
        </footer>
      </Box>

      {!setupRequired && (
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      )}
    </Flex>
  )
}

export const App = () => (
  <AuthProvider>
    <AppContent />
  </AuthProvider>
)

export default App
