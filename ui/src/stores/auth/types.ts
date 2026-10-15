import type { ManagerUser } from '@projectTypes/user'

export interface AuthState {
  user: ManagerUser | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: ManagerUser) => void
  register: (token: string, user: ManagerUser) => void
  logout: () => void
  initializeAuth: () => Promise<void>
  refreshUser: () => Promise<void>
}
