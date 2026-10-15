import type { Box, Heading, Text, Card as RadixCard } from '@radix-ui/themes'
import type { ComponentProps, CSSProperties, ReactNode } from 'react'

export type CardProps = ComponentProps<typeof RadixCard> & {
  children?: ReactNode
  glass?: boolean
  style?: CSSProperties
}

export type CardHeaderProps = ComponentProps<typeof Box> & {
  children?: ReactNode
}

export type CardTitleProps = ComponentProps<typeof Heading> & {
  children?: ReactNode
}

export type CardDescriptionProps = ComponentProps<typeof Text> & {
  children?: ReactNode
}

export type CardContentProps = ComponentProps<typeof Box> & {
  children?: ReactNode
}

export type CardFooterProps = ComponentProps<typeof Box> & {
  children?: ReactNode
}
