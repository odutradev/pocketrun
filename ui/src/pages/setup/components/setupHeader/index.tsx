import { Flex, Box, Badge, Heading, Text } from '@radix-ui/themes'
import { ShieldCheck, Sparkles } from 'lucide-react'

import type { SetupHeaderProps } from './types'

export const SetupHeader = ({ title, subtitle }: SetupHeaderProps) => {
  return (
    <Box mb="4">
      <Flex align="center" gap="3" mb="3">
        <Box
          style={{
            width: 44,
            height: 44,
            borderRadius: 'var(--radius-3)',
            background: 'linear-gradient(135deg, var(--iris-9) 0%, var(--cyan-9) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px var(--iris-a6)'
          }}
        >
          <ShieldCheck size={24} color="#FFF" />
        </Box>
        <Box>
          <Badge size="1" variant="surface" color="cyan" radius="full" mb="1">
            <Flex align="center" gap="1">
              <Sparkles size={11} />
              Primeiro Acesso • Modo Setup
            </Flex>
          </Badge>
          <Heading size="5" weight="bold" style={{ letterSpacing: '-0.02em' }}>
            {title}
          </Heading>
        </Box>
      </Flex>

      <Text size="2" color="gray" style={{ lineHeight: 1.6 }}>
        {subtitle}
      </Text>
    </Box>
  )
}

export default SetupHeader
