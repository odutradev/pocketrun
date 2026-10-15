import type { Application } from '@projectTypes/application'

export interface AppDetailProps {
  app: Application
  onBack: () => void
  onRefreshApp: () => void
}
