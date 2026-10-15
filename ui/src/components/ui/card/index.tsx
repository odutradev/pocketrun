import { Card as RadixCard, Box, Heading, Text } from '@radix-ui/themes'

import type { CardProps, CardHeaderProps, CardTitleProps, CardDescriptionProps, CardContentProps, CardFooterProps } from './types'
import type { CSSProperties } from 'react'

const glassStyle: CSSProperties = {
  backdropFilter: 'blur(16px)',
  backgroundColor: 'var(--gray-a2)',
  borderColor: 'var(--gray-a4)'
}

export const CardHeader = ({ children, mb = '3', ...props }: CardHeaderProps) => (
  <Box mb={mb} {...props}>
    {children}
  </Box>
)

export const CardTitle = ({ children, size = '4', weight = 'bold', mb = '1', ...props }: CardTitleProps) => (
  <Heading size={size} weight={weight} mb={mb} {...props}>
    {children}
  </Heading>
)

export const CardDescription = ({ children, size = '2', color = 'gray', ...props }: CardDescriptionProps) => (
  <Text size={size} color={color} {...props}>
    {children}
  </Text>
)

export const CardContent = ({ children, ...props }: CardContentProps) => (
  <Box {...props}>{children}</Box>
)

export const CardFooter = ({ children, mt = '3', ...props }: CardFooterProps) => (
  <Box mt={mt} {...props}>
    {children}
  </Box>
)

export const Card = ({ children, glass = true, style, ...props }: CardProps) => {
  const resolvedStyle: CSSProperties = glass ? { ...glassStyle, ...style } : { ...style }

  return (
    <RadixCard style={resolvedStyle} {...props}>
      {children}
    </RadixCard>
  )
}

Card.Header = CardHeader
Card.Title = CardTitle
Card.Description = CardDescription
Card.Content = CardContent
Card.Footer = CardFooter

export default Card
