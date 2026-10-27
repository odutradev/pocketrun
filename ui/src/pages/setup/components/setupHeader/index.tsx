import { Box, Flex, Heading, Text } from '@radix-ui/themes'
import { ShieldCheck } from 'lucide-react'

import { headerContainerStyle, iconContainerStyle } from './styles'

import type { SetupHeaderProps } from './types'

export const SetupHeader = ({ title, subtitle }: SetupHeaderProps) => {
  return (
    <Box style={headerContainerStyle}>
      <Flex justify="center" mb="3">
        <Box style={iconContainerStyle}>
          <ShieldCheck size={20} color="var(--mint-11)" />
        </Box>
      </Flex>
      <Heading size="5" weight="bold" mb="1" style={{ letterSpacing: '-0.02em' }}>
        {title}
      </Heading>
      <Text size="2" color="gray" style={{ lineHeight: 1.5 }}>
        {subtitle}
      </Text>
    </Box>
  )
}

export default SetupHeader
