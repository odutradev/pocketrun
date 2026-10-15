import type { BadgeProps as RadixBadgeProps } from '@radix-ui/themes'
import type { ReactNode } from 'react'

export interface BadgeProps extends RadixBadgeProps {
  children?: ReactNode
}
