import { ArrowRight, AlertCircle, User, Mail, Lock } from 'lucide-react'
import { Flex, Callout } from '@radix-ui/themes'
import { useState } from 'react'

import { setupSuperadminAction } from '@api/actions/setup'
import { submitButtonStyle } from './styles'
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
      password: (val) => (!val || val.length < 8 ? 'A senha deve ter no mínimo 8 caracteres' : undefined),
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

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="3">
        {submitError && (
          <Callout.Root color="ruby" size="1" variant="surface">
            <Callout.Icon>
              <AlertCircle size={16} />
            </Callout.Icon>
            <Callout.Text>{submitError}</Callout.Text>
          </Callout.Root>
        )}

        <Input
          label="Nome"
          name="name"
          placeholder="Ex: Administrador PocketRun"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
          leftIcon={<User size={16} />}
        />

        <Input
          label="E-mail"
          name="email"
          type="email"
          placeholder="admin@seudominio.com"
          value={values.email}
          onChange={handleChange}
          error={errors.email}
          leftIcon={<Mail size={16} />}
        />

        <Input
          label="Senha"
          name="password"
          type="password"
          placeholder="Mínimo de 8 caracteres"
          value={values.password}
          onChange={handleChange}
          error={errors.password}
          leftIcon={<Lock size={16} />}
        />

        <Input
          label="Confirmar senha"
          name="confirmPassword"
          type="password"
          placeholder="Repita a senha digitada"
          value={values.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
          leftIcon={<Lock size={16} />}
        />

        <Button
          type="submit"
          variant="solid"
          color="mint"
          size="3"
          loading={isSubmitting}
          rightIcon={<ArrowRight size={16} />}
          mt="2"
          style={submitButtonStyle}
        >
          Concluir Configuração e Entrar
        </Button>
      </Flex>
    </form>
  )
}

export default SetupForm
