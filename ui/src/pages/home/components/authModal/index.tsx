import { Dialog, Flex, IconButton } from '@radix-ui/themes'
import { useState } from 'react'
import { X } from 'lucide-react'

import RegisterForm from '@pages/auth/components/registerForm'
import AuthHeader from '@pages/auth/components/authHeader'
import LoginForm from '@pages/auth/components/loginForm'
import AuthTabs from '@pages/auth/components/authTabs'

import type { AuthMode } from '@pages/auth/types'
import type { AuthModalProps } from './types'

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login')

  const title = authMode === 'login' ? 'Entrar no PocketRun' : 'Criar Nova Conta'
  const subtitle =
    authMode === 'login'
      ? 'Acesse o painel administrativo da sua plataforma'
      : 'Cadastre sua conta para gerenciar aplicações e chaves de acesso'

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content maxWidth="460px" style={{ padding: '28px' }}>
        <Flex justify="end" mb="1">
          <Dialog.Close>
            <IconButton variant="ghost" color="gray" size="1" onClick={onClose} style={{ cursor: 'pointer' }}>
              <X size={16} />
            </IconButton>
          </Dialog.Close>
        </Flex>

        <AuthHeader title={title} subtitle={subtitle} />
        <AuthTabs value={authMode} onChange={setAuthMode} />

        {authMode === 'login' ? (
          <LoginForm onSuccess={onClose} />
        ) : (
          <RegisterForm onSuccess={onClose} />
        )}
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default AuthModal
