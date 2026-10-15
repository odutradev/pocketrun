import type { TextField } from '@radix-ui/themes'
import type { ComponentProps, ReactNode } from 'react'

export interface InputProps extends Omit<ComponentProps<typeof TextField.Root>, 'size'> {
  label?: string
  error?: string
  leftIcon?: ReactNode
  size?: '1' | '2' | '3'
}
