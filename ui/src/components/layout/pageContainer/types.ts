import type { CSSProperties, ReactNode } from 'react'

export interface PageContainerProps {
  children?: ReactNode
  center?: boolean
  maxWidth?: number | string
  style?: CSSProperties
}
