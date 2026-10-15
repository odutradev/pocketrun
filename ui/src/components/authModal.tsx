import { Dialog, Button, TextField, Callout, Flex, Box, Text, Badge, IconButton } from '@radix-ui/themes'
import { Lock, Mail, AlertCircle, Shield, X } from 'lucide-react'
import { useState } from 'react'

import { loginManager } from '../services/api'
import { useAuth } from '../context/authContext'

import type { FormEvent } from 'react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AuthModal = ({ isOpen, onClose }: AuthModalProps) => {
  const { login } = useAuth()
  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await loginManager(email, password)
      login(res.token, res.user)
      onClose()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Credenciais inválidas')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Content maxWidth="440px" style={{ padding: '28px' }}>
        <Flex justify="between" align="start" mb="3">
          <Badge size="1" variant="surface" color="iris" radius="full">
            <Flex align="center" gap="1">
              <Shield size={13} />
              Acesso Administrativo
            </Flex>
          </Badge>
          <Dialog.Close>
            <IconButton variant="ghost" color="gray" size="1" style={{ cursor: 'pointer' }}>
              <X size={16} />
            </IconButton>
          </Dialog.Close>
        </Flex>

        <Dialog.Title size="5" weight="bold" mb="1">
          Acessar Painel
        </Dialog.Title>
        <Dialog.Description size="2" color="gray" mb="4">
          Entre com suas credenciais de gestor ou superadministrador.
        </Dialog.Description>

        {error && (
          <Box mb="4">
            <Callout.Root color="ruby" size="1" variant="surface">
              <Callout.Icon>
                <AlertCircle size={16} />
              </Callout.Icon>
              <Callout.Text>{error}</Callout.Text>
            </Callout.Root>
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="3">
            <Box>
              <Text as="label" size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                E-mail do Gestor
              </Text>
              <TextField.Root
                size="3"
                type="email"
                placeholder="admin@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              >
                <TextField.Slot>
                  <Mail size={16} color="var(--gray-9)" />
                </TextField.Slot>
              </TextField.Root>
            </Box>

            <Box>
              <Text as="label" size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                Senha
              </Text>
              <TextField.Root
                size="3"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              >
                <TextField.Slot>
                  <Lock size={16} color="var(--gray-9)" />
                </TextField.Slot>
              </TextField.Root>
            </Box>

            <Button
              type="submit"
              size="3"
              color="iris"
              variant="solid"
              disabled={loading}
              mt="2"
              style={{ width: '100%', cursor: 'pointer' }}
            >
              {loading ? 'Autenticando...' : 'Entrar no Painel'}
            </Button>
          </Flex>
        </form>
      </Dialog.Content>
    </Dialog.Root>
  )
}

