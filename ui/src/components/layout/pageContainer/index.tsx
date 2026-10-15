import { Box, Flex } from '@radix-ui/themes'

import type { PageContainerProps } from './types'
import type { CSSProperties } from 'react'

export const PageContainer = ({
  children,
  center = false,
  maxWidth = 1280,
  style
}: PageContainerProps) => {
  const containerStyle: CSSProperties = {
    flex: 1,
    width: '100%',
    maxWidth,
    margin: '0 auto',
    padding: '24px 24px 48px',
    boxSizing: 'border-box',
    ...style
  }

  if (center) {
    return (
      <Flex align="center" justify="center" style={{ minHeight: 'calc(100vh - 140px)', width: '100%' }}>
        <Box style={containerStyle}>{children}</Box>
      </Flex>
    )
  }

  return <Box style={containerStyle}>{children}</Box>
}

export default PageContainer
