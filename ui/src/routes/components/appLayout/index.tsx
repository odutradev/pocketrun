import { useState, useEffect } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { Box, Text } from '@radix-ui/themes'

import { getSetupStatusAction } from '@actions/setup'
import { healthPingAction } from '@actions/health'
import Navbar from '@components/layout/navbar'

import type { CSSProperties } from 'react'

const backgroundStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#0c101c',
  backgroundImage:
    'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.15), rgba(255, 255, 255, 0))'
}

const footerStyle: CSSProperties = {
  borderTop: '1px solid var(--gray-a4)',
  padding: '24px',
  textAlign: 'center',
  backgroundColor: 'rgba(11, 13, 19, 0.5)'
}

export const AppLayout = () => {
  const navigate = useNavigate()
  const [apiStatus, setApiStatus] = useState<string>('online')
  const [setupRequired, setSetupRequired] = useState<boolean>(false)

  useEffect(() => {
    let isSubscribed = true

    const verify = async () => {
      try {
        await healthPingAction()
        if (!isSubscribed) return
        setApiStatus('online')

        const setupRes = await getSetupStatusAction()
        if (!isSubscribed) return
        setSetupRequired(setupRes.setup_required)

        if (setupRes.setup_required && window.location.pathname !== '/setup') {
          navigate('/setup')
        }
      } catch {
        if (isSubscribed) setApiStatus('offline')
      }
    }

    verify()
    const interval = setInterval(verify, 20000)
    return () => {
      isSubscribed = false
      clearInterval(interval)
    }
  }, [navigate])

  return (
    <Box style={backgroundStyle}>
      <Navbar
        apiStatus={apiStatus}
        setupRequired={setupRequired}
        onOpenAuth={() => navigate('/auth')}
      />

      <Box asChild style={{ flex: 1 }}>
        <main>
          <Outlet />
        </main>
      </Box>

      <Box asChild style={footerStyle}>
        <footer>
          <Text size="1" color="gray">
            PocketRun &copy; 2026 — Pluggable Multi-Tenant Key-Value BaaS Platform
          </Text>
        </footer>
      </Box>
    </Box>
  )
}

export default AppLayout
