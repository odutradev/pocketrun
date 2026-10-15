import { useState, useId } from 'react'
import { Card, Heading, Text, Badge, Callout, TextField, Button, Flex, Box, Grid } from '@radix-ui/themes'
import { ShieldCheck, Lock, Mail, User as UserIcon, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react'

import { setupSuperadmin } from '../services/api'
import { useAuth } from '../context/authContext'

import type { FormEvent } from 'react'

interface SetupWizardProps {
  onSuccess: () => void
}

export const SetupWizard = ({ onSuccess }: SetupWizardProps) => {
  const nameId = useId()
  const emailId = useId()
  const passwordId = useId()
  const confirmPasswordId = useId()

  const { login } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isMinLength = password.length >= 8
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumberOrSymbol = /[\d!@#$%^&*(),.?":{}|<>]/.test(password)
  const passwordsMatch = password.length > 0 && password === confirmPassword

  const isFormValid = name.trim().length >= 2 && email.includes('@') && isMinLength && hasLetter && hasNumberOrSymbol && passwordsMatch

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!passwordsMatch) {
      setError('As senhas digitadas não coincidem.')
      return
    }

    if (!isMinLength || !hasLetter || !hasNumberOrSymbol) {
      setError('A senha não cumpre os requisitos de segurança.')
      return
    }

    setLoading(true)
    try {
      const res = await setupSuperadmin({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      })

      login(res.token, res.user)
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao inicializar o superadmin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px' }}>
      <Card size="4" style={{ width: '100%', maxWidth: '560px', padding: '36px', border: '1px solid var(--iris-a5)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px var(--iris-a3)' }}>
        <Flex align="center" gap="3" mb="3">
          <Box
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-3)',
              background: 'linear-gradient(135deg, var(--iris-9) 0%, var(--cyan-9) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px var(--iris-a6)',
            }}
          >
            <ShieldCheck size={24} color="#FFF" />
          </Box>
          <Box>
            <Badge size="1" variant="surface" color="cyan" radius="full" mb="1">
              <Flex align="center" gap="1">
                <Sparkles size={11} />
                Primeiro Acesso • Modo Setup
              </Flex>
            </Badge>
            <Heading size="5" weight="bold" style={{ letterSpacing: '-0.02em' }}>
              Configuração Inicial do PocketRun
            </Heading>
          </Box>
        </Flex>

        <Text size="2" color="gray" mb="4" as="p" style={{ lineHeight: 1.6 }}>
          Nenhum administrador detectado no banco de dados. Defina as credenciais do <strong>Super Administrador</strong> para ativar a segurança do sistema.
        </Text>

        <Box mb="4">
          <Callout.Root color="iris" size="1" variant="surface">
            <Callout.Icon>
              <ShieldCheck size={16} />
            </Callout.Icon>
            <Callout.Text>
              <strong>Proteção ativa:</strong> Após esta etapa, o modo de configuração será permanentemente desativado e o registro público ficará bloqueado.
            </Callout.Text>
          </Callout.Root>
        </Box>

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
              <Text as="label" htmlFor={nameId} size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                Nome do Super Administrador
              </Text>
              <TextField.Root
                id={nameId}
                size="3"
                type="text"
                placeholder="Ex: Administrador PocketRun"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              >
                <TextField.Slot>
                  <UserIcon size={16} color="var(--gray-9)" />
                </TextField.Slot>
              </TextField.Root>
            </Box>

            <Box>
              <Text as="label" htmlFor={emailId} size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                E-mail Principal
              </Text>
              <TextField.Root
                id={emailId}
                size="3"
                type="email"
                placeholder="admin@seudominio.com"
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
              <Text as="label" htmlFor={passwordId} size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                Senha Mestra (Mínimo 8 caracteres)
              </Text>
              <TextField.Root
                id={passwordId}
                size="3"
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              >
                <TextField.Slot>
                  <Lock size={16} color="var(--gray-9)" />
                </TextField.Slot>
              </TextField.Root>
            </Box>

            <Box>
              <Text as="label" htmlFor={confirmPasswordId} size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                Confirmar Senha Mestra
              </Text>
              <TextField.Root
                id={confirmPasswordId}
                size="3"
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              >
                <TextField.Slot>
                  <Lock size={16} color="var(--gray-9)" />
                </TextField.Slot>
              </TextField.Root>
            </Box>

            {/* Checklist de requisitos de senha */}
            <Box
              p="3"
              style={{
                backgroundColor: 'var(--gray-a3)',
                borderRadius: 'var(--radius-3)',
                border: '1px solid var(--gray-a4)',
              }}
            >
              <Grid columns="2" gap="2">
                <Flex align="center" gap="2">
                  <CheckCircle2 size={14} color={isMinLength ? 'var(--grass-9)' : 'var(--gray-8)'} />
                  <Text size="1" color={isMinLength ? 'grass' : 'gray'}>
                    8+ caracteres
                  </Text>
                </Flex>
                <Flex align="center" gap="2">
                  <CheckCircle2 size={14} color={hasLetter ? 'var(--grass-9)' : 'var(--gray-8)'} />
                  <Text size="1" color={hasLetter ? 'grass' : 'gray'}>
                    Contém letras
                  </Text>
                </Flex>
                <Flex align="center" gap="2">
                  <CheckCircle2 size={14} color={hasNumberOrSymbol ? 'var(--grass-9)' : 'var(--gray-8)'} />
                  <Text size="1" color={hasNumberOrSymbol ? 'grass' : 'gray'}>
                    Número ou símbolo
                  </Text>
                </Flex>
                <Flex align="center" gap="2">
                  <CheckCircle2 size={14} color={passwordsMatch ? 'var(--grass-9)' : 'var(--gray-8)'} />
                  <Text size="1" color={passwordsMatch ? 'grass' : 'gray'}>
                    Senhas conferem
                  </Text>
                </Flex>
              </Grid>
            </Box>

            <Button
              type="submit"
              size="3"
              color="iris"
              variant="solid"
              disabled={loading || !isFormValid}
              mt="2"
              style={{ width: '100%', cursor: !isFormValid ? 'not-allowed' : 'pointer' }}
            >
              {loading ? (
                'Inicializando Superadmin...'
              ) : (
                <Flex align="center" justify="center" gap="2">
                  <span>Concluir Configuração e Entrar</span>
                  <ArrowRight size={16} />
                </Flex>
              )}
            </Button>
          </Flex>
        </form>
      </Card>
    </Box>
  )
}

