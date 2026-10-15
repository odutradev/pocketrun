import { Grid, Flex, Heading, Text } from '@radix-ui/themes'
import { Layers, Key, Shield } from 'lucide-react'

import Badge from '@components/ui/badge'
import Card from '@components/ui/card'

import type { SystemStatusGridProps } from './types'

export const SystemStatusGrid = ({ appsCount, tokensCount }: SystemStatusGridProps) => {
  return (
    <Grid columns={{ initial: '1', sm: '3' }} gap="3" mb="6">
      <Card size="2">
        <Flex justify="between" align="center" mb="2">
          <Text size="2" weight="medium" color="gray">
            Aplicações Ativas
          </Text>
          <Layers size={18} color="var(--iris-9)" />
        </Flex>
        <Heading size="7" weight="bold">
          {appsCount}
        </Heading>
      </Card>

      <Card size="2">
        <Flex justify="between" align="center" mb="2">
          <Text size="2" weight="medium" color="gray">
            Tokens de Acesso
          </Text>
          <Key size={18} color="var(--cyan-9)" />
        </Flex>
        <Heading size="7" weight="bold">
          {tokensCount}
        </Heading>
      </Card>

      <Card size="2">
        <Flex justify="between" align="center" mb="2">
          <Text size="2" weight="medium" color="gray">
            Isolamento por Projeto
          </Text>
          <Shield size={18} color="var(--grass-9)" />
        </Flex>
        <Badge size="2" color="grass" variant="surface" radius="full" mt="1">
          Ativo & Seguro
        </Badge>
      </Card>
    </Grid>
  )
}

export default SystemStatusGrid
