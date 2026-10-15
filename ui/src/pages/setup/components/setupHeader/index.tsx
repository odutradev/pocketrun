import { Box, Flex, Heading, Text } from '@radix-ui/themes'
import { ShieldCheck } from 'lucide-react'

import { headerContainerStyle, iconContainerStyle } from './styles'

import type { SetupHeaderProps } from './types'

export const SetupHeader = ({ title, subtitle }: SetupHeaderProps) => {
  return (
    <Box style={headerContainerStyle}>
      <Flex justify="center" mb="3">
        <Box style={iconContainerStyle}>
          <ShieldCheck size={24} color="#FFFFFF" />
        </Box>
      </Flex>
      <Heading size="6" weight="bold" mb="2">
        {title}
      </Heading>
      <Text size="2" color="gray">
        {subtitle}
      </Text>
    </Box>
  )
}

export default SetupHeader
