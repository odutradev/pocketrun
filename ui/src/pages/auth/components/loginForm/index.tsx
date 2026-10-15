import { LogIn, Mail, Lock } from 'lucide-react'
import { Flex } from '@radix-ui/themes'

import { signInAction } from '@actions/users/auth'
import Button from '@components/ui/button'
import useToastStore from '@stores/toast'
import Input from '@components/ui/input'
import useAuthStore from '@stores/auth'
import useForm from '@hooks/useForm'

import type { LoginFormProps } from './types'

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const { login } = useAuthStore()
  const { showToast } = useToastStore()

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
      try {
        const response = await signInAction(formValues)
        login(response.token, response.user)
        showToast('Login realizado com sucesso!', 'success')
        onSuccess?.()
      } catch (err: unknown) {
        const message = (err as { message?: string })?.message || 'Falha ao autenticar'
        showToast(message, 'error')
      }
    }
  })

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="3">
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
