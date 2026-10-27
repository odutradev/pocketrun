import { Box, Flex, Heading, Text } from '@radix-ui/themes'
import { Sparkles, Shield } from 'lucide-react'

import Button from '@components/ui/button'
import Card from '@components/ui/card'

import type { WelcomeBannerProps } from './types'

export const WelcomeBanner = ({ onOpenAuth }: WelcomeBannerProps) => {
  return (
    <Box style={{ maxWidth: 860, margin: '48px auto', padding: '0 16px', textAlign: 'center' }}>
      <Card size="4" style={{ padding: '56px 32px' }}>
        <Flex direction="column" align="center">
          <Box
            mb="4"
            style={{
              width: 64,
              height: 64,
              borderRadius: 'var(--radius-4)',
              background: 'linear-gradient(135deg, var(--mint-9) 0%, var(--mint-6) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 28px var(--mint-a5)'
            }}
          >
            <Sparkles size={32} color="var(--mint-contrast)" />
          </Box>

          <Heading size="7" weight="bold" mb="3" style={{ letterSpacing: '-0.03em' }}>
            PocketRun v2 — O Backend Genérico Multi-Tenant
          </Heading>

          <Text size="3" color="gray" mb="5" style={{ maxWidth: 580, lineHeight: 1.6 }}>
            Crie e gerencie aplicações, configure tokens de acesso com isolamento completo e controle os domínios de origem autorizados (CORS) para todos os seus projetos e microsserviços.
          </Text>

          <Button
            size="3"
            color="mint"
            variant="solid"
            onClick={onOpenAuth}
            leftIcon={<Shield size={18} />}
            style={{ cursor: 'pointer', padding: '0 24px' }}
          >
            Entrar / Cadastrar como Gestor
          </Button>
        </Flex>
      </Card>
    </Box>
  )
}

export default WelcomeBanner
