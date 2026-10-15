import type { Application } from '@projectTypes/application'
import type { ManagerUser } from '@projectTypes/user'

export interface UseHomePageReturn {
  user: ManagerUser | null
  apps: Application[]
  loading: boolean
  selectedApp: Application | null
  isCreateModalOpen: boolean
  isAuthModalOpen: boolean
  totalTokens: number
  loadApps: () => Promise<void>
  setSelectedApp: (app: Application | null) => void
  setIsCreateModalOpen: (open: boolean) => void
  setIsAuthModalOpen: (open: boolean) => void
}
