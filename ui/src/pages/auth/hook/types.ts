import type { AuthMode } from '../types'

export interface UseAuthPageReturn {
  authMode: AuthMode
  title: string
  subtitle: string
  handleModeChange: (mode: AuthMode) => void
}
