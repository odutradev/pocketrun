import { ShieldCheck, Lock, Mail, User, CheckCircle2, ArrowRight, AlertCircle } from 'lucide-react'
import { Flex, Box, Grid, Text, Callout } from '@radix-ui/themes'
import { useState } from 'react'

import { setupSuperadminAction } from '@api/actions/setup'
import Button from '@components/ui/button'
import useAuthStore from '@stores/auth'
import Input from '@components/ui/input'
import useForm from '@hooks/useForm'

import type { SetupFormProps } from './types'

export const SetupForm = ({ onSuccess }: SetupFormProps) => {
  const { login } = useAuthStore()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    validationRules: {
      name: (val) => (!val || val.trim().length < 2 ? 'Nome deve ter no mínimo 2 caracteres' : undefined),
      email: (val) => (!val || !val.includes('@') ? 'Informe um email válido' : undefined),
      password: (val) => {
        if (!val || val.length < 8) return 'Mínimo de 8 caracteres'
        if (!/[a-zA-Z]/.test(val)) return 'Deve conter ao menos uma letra'
        if (!/[\d!@#$%^&*(),.?":{}|<>]/.test(val)) return 'Deve conter números ou símbolos'
        return undefined
      },
      confirmPassword: (val, allValues) => (val !== allValues.password ? 'As senhas não coincidem' : undefined)
    },
    onSubmit: async (formValues) => {
      setSubmitError(null)
      try {
        const response = await setupSuperadminAction({
          name: formValues.name.trim(),
          email: formValues.email.trim().toLowerCase(),
          password: formValues.password
        })

        login(response.token, response.user)
        onSuccess?.()
      } catch (err: unknown) {
        const message = (err as { message?: string })?.message || 'Falha ao inicializar o superadmin'
        setSubmitError(message)
      }
    }
  })

  const isMinLength = values.password.length >= 8
  const hasLetter = /[a-zA-Z]/.test(values.password)
  const hasNumberOrSymbol = /[\d!@#$%^&*(),.?":{}|<>]/.test(values.password)
  const passwordsMatch = values.password.length > 0 && values.password === values.confirmPassword

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="3">
        {submitError && (
          <Callout.Root color="ruby" size="1" variant="surface" mb="1">
            <Callout.Icon>
              <AlertCircle size={16} />
            </Callout.Icon>
            <Callout.Text>{submitError}</Callout.Text>
          </Callout.Root>
        )}

        <Callout.Root color="iris" size="1" variant="surface" mb="1">
          <Callout.Icon>
            <ShieldCheck size={16} />
          </Callout.Icon>
          <Callout.Text>
            <strong>Proteção ativa:</strong> Após esta etapa, o modo setup será concluído e o registro público ficará bloqueado.
          </Callout.Text>
        </Callout.Root>

        <Input
          label="Nome do Super Administrador"
          name="name"
          placeholder="Ex: Administrador PocketRun"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
          leftIcon={<User size={16} />}
        />

        <Input
          label="E-mail Principal"
          name="email"
          type="email"
          placeholder="admin@seudominio.com"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          leftIcon={<Mail size={16} />}
        />

        <Input
          label="Senha Mestra"
          name="password"
          type="password"
          placeholder="••••••••••••"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          leftIcon={<Lock size={16} />}
        />

        <Input
          label="Confirmar Senha Mestra"
          name="confirmPassword"
          type="password"
          placeholder="••••••••••••"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          leftIcon={<Lock size={16} />}
        />

        <Box
          p="3"
          style={{
            backgroundColor: 'var(--gray-a3)',
            borderRadius: 'var(--radius-3)',
            border: '1px solid var(--gray-a4)'
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
          variant="solid"
          color="iris"
          size="3"
          loading={isSubmitting}
          rightIcon={<ArrowRight size={16} />}
          mt="2"
        >
          Concluir Configuração e Entrar
        </Button>
      </Flex>
    </form>
  )
}

export default SetupForm
