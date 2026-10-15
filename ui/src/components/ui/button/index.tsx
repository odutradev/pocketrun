import { Button as RadixButton, Spinner } from '@radix-ui/themes'

import type { ButtonProps } from './types'

export const Button = ({
  children,
  loading = false,
  disabled,
  leftIcon,
  rightIcon,
  ...props
}: ButtonProps) => {
  return (
    <RadixButton disabled={disabled || loading} {...props}>
      {loading ? <Spinner size="1" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </RadixButton>
  )
}

export default Button
