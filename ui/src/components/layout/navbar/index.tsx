import { Server, User, LogOut, ShieldCheck, Database } from 'lucide-react'
import { Flex, Box, Badge, Button, Heading, Text } from '@radix-ui/themes'

import useAuthStore from '@stores/auth'

import type { NavbarProps } from './types'

export const Navbar = ({ apiStatus = 'online', setupRequired = false, onOpenAuth }: NavbarProps) => {
  const { user, logout } = useAuthStore()

  const getStatusColor = () => {
    if (apiStatus === 'online') return 'grass'
    if (apiStatus === 'offline') return 'amber'
    return 'iris'
  }

  return (
    <Box
      style={{
        borderBottom: '1px solid var(--gray-a4)',
        backgroundColor: 'rgba(11, 13, 19, 0.75)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        marginBottom: '28px'
      }}
    >
      <Box style={{ maxWidth: '1280px', margin: '0 auto', padding: '14px 24px' }}>
        <Flex justify="between" align="center" wrap="wrap" gap="3">
          <Flex align="center" gap="3">
            <Box
              style={{
                width: 36,
                height: 36,
                borderRadius: 'var(--radius-3)',
                background: 'linear-gradient(135deg, var(--iris-9) 0%, var(--cyan-9) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px var(--iris-a5)'
              }}
            >
              <Database size={18} color="#FFFFFF" />
            </Box>
            <Box>
              <Flex align="center" gap="2">
                <Heading size="3" weight="bold" style={{ letterSpacing: '-0.02em' }}>
                  PocketRun
                </Heading>
                <Badge size="1" variant="surface" color="iris" radius="full">
                  v2.0
                </Badge>
              </Flex>
              <Text size="1" color="gray">
                Pluggable Multi-Tenant Key-Value BaaS
              </Text>
            </Box>
          </Flex>

          <Flex align="center" gap="3">
            <Badge
              size="2"
              variant="surface"
              color={getStatusColor()}
              radius="full"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px' }}
            >
              <Server size={12} />
              <Text size="1" weight="medium">
                API {apiStatus}
              </Text>
            </Badge>

            {setupRequired && (
              <Badge size="2" variant="solid" color="amber" radius="full">
                Setup Inicial
              </Badge>
            )}

            {user ? (
              <Flex align="center" gap="2">
                <Box
                  style={{
                    backgroundColor: 'var(--gray-a3)',
                    border: '1px solid var(--gray-a5)',
                    padding: '4px 12px',
                    borderRadius: 'var(--radius-full)'
                  }}
                >
                  <Flex align="center" gap="2">
                    <ShieldCheck size={15} color="var(--iris-9)" />
                    <Text size="2" weight="medium">
                      {user.name}
                    </Text>
                    {user.role === 'superadmin' && (
                      <Badge size="1" variant="solid" color="iris">
                        SUPERADMIN
                      </Badge>
                    )}
                  </Flex>
                </Box>

                <Button
                  variant="soft"
                  color="gray"
                  size="2"
                  onClick={logout}
                  title="Encerrar sessão"
                  style={{ cursor: 'pointer' }}
                >
                  <LogOut size={15} />
                  Sair
                </Button>
              </Flex>
            ) : !setupRequired && onOpenAuth ? (
              <Button
                variant="solid"
                color="iris"
                size="2"
                onClick={onOpenAuth}
                style={{ cursor: 'pointer' }}
              >
                <User size={15} />
                Entrar como Gestor
              </Button>
            ) : null}
          </Flex>
        </Flex>
      </Box>
    </Box>
  )
}

export default Navbar
