import { useState, useCallback } from 'react'

import type { UseAuthPageReturn } from './types'
import type { AuthMode } from '../types'

export const useAuthPage = (): UseAuthPageReturn => {
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  const handleModeChange = useCallback((mode: AuthMode) => {
    setAuthMode(mode)
  }, [])

  const title = authMode === 'login' ? 'Entrar no PocketRun' : 'Criar Nova Conta'
  const subtitle =
    authMode === 'login'
      ? 'Acesse o painel administrativo da sua plataforma de microsserviços'
      : 'Cadastre sua conta para gerenciar aplicações e chaves de acesso'

  return {
    authMode,
    title,
    subtitle,
    handleModeChange
  }
}

export default useAuthPage
