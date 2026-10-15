import type { UseSetupPageReturn } from './types'

export const useSetupPage = (): UseSetupPageReturn => {
  const title = 'Configuração Inicial do PocketRun'
  const subtitle =
    'Nenhum administrador detectado no banco de dados. Defina as credenciais do Super Administrador para ativar a segurança do sistema.'

  return {
    title,
    subtitle
  }
}

export default useSetupPage
