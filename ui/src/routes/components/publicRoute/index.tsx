import { Navigate } from 'react-router-dom'

import useAuthStore from '@stores/auth'

import type { ReactNode } from 'react'

export const PublicRoute = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useAuthStore()

  if (isAuthenticated) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default PublicRoute
