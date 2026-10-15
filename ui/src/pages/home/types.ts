import type { Application } from '@projectTypes/application'

export interface HomeDashboardState {
  apps: Application[]
  loading: boolean
  selectedApp: Application | null
  isCreateModalOpen: boolean
}
