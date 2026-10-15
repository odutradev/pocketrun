import type { ComponentType } from 'react'

export interface RouteItem {
  path: string
  component: ComponentType
  protected?: boolean
  publicOnly?: boolean
  center?: boolean
}
