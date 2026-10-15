import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react'
import { Flex, Callout } from '@radix-ui/themes'
import { useState } from 'react'

import { signInAction } from '@api/actions/users/auth'
import Button from '@components/ui/button'
import useAuthStore from '@stores/auth'
import Input from '@components/ui/input'
import useForm from '@hooks/useForm'

import type { LoginFormProps } from './types'

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { login } = useAuthStore()
  const [authError, setAuthError] = useState<string | null>(null)

  const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm({
    initialValues: {
      email: '',
      password: ''
    },
    validationRules: {
      email: (val) => (!val ? 'Email é obrigatório' : undefined),
      password: (val) => (!val ? 'Senha é obrigatória' : undefined)
    },
    onSubmit: async (formValues) => {
      setAuthError(null)
      try {
        const response = await signInAction(formValues)
        login(response.token, response.user)
        onSuccess?.()
      } catch (err: unknown) {
        const message = (err as { message?: string })?.message || 'Falha ao autenticar'
        setAuthError(message)
      }
    }
  })

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="3">
        {authError && (
          <Callout.Root color="ruby" size="1" variant="surface">
            <Callout.Icon>
              <AlertCircle size={16} />
            </Callout.Icon>
            <Callout.Text>{authError}</Callout.Text>
          </Callout.Root>
        )}

        <Input
          label="Email"
          name="email"
          type="email"
          placeholder="seu@email.com"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          leftIcon={<Mail size={16} />}
        />

        <Input
          label="Senha"
          name="password"
          type="password"
          placeholder="••••••••"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          leftIcon={<Lock size={16} />}
        />

        <Button
          type="submit"
          variant="solid"
          color="iris"
          size="3"
          loading={isSubmitting}
          leftIcon={<LogIn size={16} />}
          mt="2"
        >
          Entrar na Plataforma
        </Button>
      </Flex>
    </form>
  )
}

export default LoginForm
