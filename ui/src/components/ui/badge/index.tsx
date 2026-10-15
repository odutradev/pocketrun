import { Badge as RadixBadge } from '@radix-ui/themes'

import type { BadgeProps } from './types'

export const Badge = ({ children, variant = 'surface', color = 'iris', ...props }: BadgeProps) => {
  return (
    <RadixBadge variant={variant} color={color} {...props}>
      {children}
    </RadixBadge>
  )
}

export default Badge
