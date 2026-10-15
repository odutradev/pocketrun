import { createRoot } from 'react-dom/client'
import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import { useEffect } from 'react'

import { themeConfig } from '@styles/theme'
import useAuthStore from '@stores/auth'
import AppRouter from '@routes'

export const RootApp = () => {
  const { initializeAuth } = useAuthStore()

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  return (
    <Theme
      appearance={themeConfig.appearance}
      accentColor={themeConfig.accentColor}
      grayColor={themeConfig.grayColor}
      radius={themeConfig.radius}
      scaling={themeConfig.scaling}
    >
      <AppRouter />
    </Theme>
  )
}

createRoot(document.getElementById('root')!).render(<RootApp />)
