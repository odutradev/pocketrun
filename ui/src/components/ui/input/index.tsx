import { TextField, Box, Text, IconButton } from '@radix-ui/themes'
import { Eye, EyeOff } from 'lucide-react'
import { useState, useId } from 'react'

import { containerStyle, labelStyle, errorTextStyle, toggleButtonStyle } from './styles'

import type { InputProps } from './types'

export const Input = ({
  label,
  error,
  leftIcon,
  type = 'text',
  id,
  size = '2',
  ...props
}: InputProps) => {
  const generatedId = useId()
  const inputId = id || generatedId
  const [showPassword, setShowPassword] = useState(false)
  const isPasswordField = type === 'password'
  const resolvedType = isPasswordField ? (showPassword ? 'text' : 'password') : type

  return (
    <Box style={containerStyle}>
      {label && (
        <Text as="label" size="2" weight="medium" mb="1" htmlFor={inputId} style={labelStyle}>
          {label}
        </Text>
      )}

      <TextField.Root id={inputId} size={size} type={resolvedType} {...props}>
        {leftIcon && <TextField.Slot>{leftIcon}</TextField.Slot>}

        {isPasswordField && (
          <TextField.Slot side="right">
            <IconButton
              size="1"
              variant="ghost"
              color="gray"
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              style={toggleButtonStyle}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </IconButton>
          </TextField.Slot>
        )}
      </TextField.Root>

      {error && (
        <Text size="1" color="red" mt="1" style={errorTextStyle}>
          {error}
        </Text>
      )}
    </Box>
  )
}

export default Input
