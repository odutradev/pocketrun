import { UserPlus, User, Mail, Lock } from 'lucide-react'
import { Flex } from '@radix-ui/themes'

import { signUpAction } from '@actions/users/auth'
import Button from '@components/ui/button'
import useToastStore from '@stores/toast'
import Input from '@components/ui/input'
import useAuthStore from '@stores/auth'
import useForm from '@hooks/useForm'

import type { RegisterFormProps } from './types'

export const RegisterForm = ({ onSuccess }: RegisterFormProps) => {
  const { register } = useAuthStore()
  const { showToast } = useToastStore()

  const { values, errors, handleChange, handleSubmit, isSubmitting } = useForm({
    initialValues: {
      name: '',
      email: '',
      password: ''
    },
    validationRules: {
      name: (val) => (!val ? 'Nome é obrigatório' : undefined),
      email: (val) => (!val ? 'Email é obrigatório' : undefined),
      password: (val) => {
        if (!val) return 'Senha é obrigatória'
        if (val.length < 6) return 'Senha deve ter no mínimo 6 caracteres'
        return undefined
      }
    },
    onSubmit: async (formValues) => {
      try {
        const response = await signUpAction(formValues)
        register(response.token, response.user)
        showToast('Cadastro realizado com sucesso!', 'success')
        onSuccess?.()
      } catch (err: unknown) {
        const message = (err as { message?: string })?.message || 'Falha ao registrar'
        showToast(message, 'error')
      }
    }
  })

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap="3">
        <Input
          label="Nome completo"
          name="name"
          placeholder="Seu nome"
          value={values.name}
          onChange={handleChange}
          error={errors.name}
          leftIcon={<User size={16} />}
        />

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
          placeholder="No mínimo 6 caracteres"
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
          leftIcon={<UserPlus size={16} />}
          mt="2"
        >
          Criar Conta de Gestor
        </Button>
      </Flex>
    </form>
  )
}

export default RegisterForm
