import type { ButtonProps as RadixButtonProps } from '@radix-ui/themes'
import type { ReactNode } from 'react'

export interface ButtonProps extends Omit<RadixButtonProps, 'children'> {
  children?: ReactNode
  loading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}
