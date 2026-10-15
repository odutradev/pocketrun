import type { UseSetupPageReturn } from './types'

export const useSetupPage = (): UseSetupPageReturn => {
  const title = 'Configuração Inicial'
  const subtitle = 'Defina as credenciais do administrador para inicializar o sistema.'

  return {
    title,
    subtitle
  }
}

export default useSetupPage
