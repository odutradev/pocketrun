import { Outlet, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { Box } from '@radix-ui/themes'

import { backgroundStyle, mainContentStyle } from './styles'
import { getSetupStatusAction } from '@api/actions/setup'
import { healthPingAction } from '@api/actions/health'
import Navbar from '@components/layout/navbar'

import type { ApiHealthStatus } from './types'

export const AppLayout = () => {
  const navigate = useNavigate()
  const [apiStatus, setApiStatus] = useState<ApiHealthStatus>('online')
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

      <Box asChild style={mainContentStyle}>
        <main>
          <Outlet />
        </main>
      </Box>
    </Box>
  )
}

export default AppLayout
