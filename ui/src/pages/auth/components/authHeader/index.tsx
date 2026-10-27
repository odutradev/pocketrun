import { Box, Heading, Text, Flex } from '@radix-ui/themes'
import { Database } from 'lucide-react'

import type { AuthHeaderProps } from './types'

export const AuthHeader = ({ title, subtitle }: AuthHeaderProps) => {
  return (
    <Box mb="4" style={{ textAlign: 'center' }}>
      <Flex justify="center" mb="3">
        <Box
          style={{
            width: 48,
            height: 48,
            borderRadius: 'var(--radius-3)',
            background: 'linear-gradient(135deg, var(--mint-9) 0%, var(--mint-6) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 6px 20px var(--mint-a5)'
          }}
        >
          <Database size={24} color="var(--mint-contrast)" />
        </Box>
      </Flex>
      <Heading size="6" weight="bold" mb="1">
        {title}
      </Heading>
      <Text size="2" color="gray">
        {subtitle}
      </Text>
    </Box>
  )
}

export default AuthHeader
