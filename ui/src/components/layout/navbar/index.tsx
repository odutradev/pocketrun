import { Flex, Box, Badge, Button, Heading, Text, IconButton } from '@radix-ui/themes'
import { User, LogOut, ShieldCheck, Database, Sun, Moon } from 'lucide-react'

import { headerStyle, innerContainerStyle, logoIconStyle, statusBadgeStyle, userBadgeStyle, actionButtonStyle } from './styles'
import useSystemStore from '@stores/system'
import useAuthStore from '@stores/auth'

import type { NavbarProps } from './types'

export const Navbar = ({ apiStatus = 'online', setupRequired = false, onOpenAuth }: NavbarProps) => {
  const { isDarkMode, toggleTheme } = useSystemStore()
  const { user, logout } = useAuthStore()

  const getStatusColor = () => {
    if (apiStatus === 'online') return 'grass'
    if (apiStatus === 'offline') return 'amber'
    return 'mint'
  }

  return (
    <Box style={headerStyle}>
      <Box style={innerContainerStyle}>
        <Flex justify="between" align="center" wrap="wrap" gap="3">
          <Flex align="center" gap="2">
            <Box style={logoIconStyle}>
              <Database size={15} color="var(--mint-11)" />
            </Box>
            <Heading size="3" weight="medium" style={{ letterSpacing: '-0.02em' }}>
              PocketRun
            </Heading>
            <Badge size="1" variant="surface" color="gray" radius="full">
              v2.0
            </Badge>
          </Flex>

          <Flex align="center" gap="3">
            <Badge
              size="1"
              variant="surface"
              color={getStatusColor()}
              radius="full"
              style={statusBadgeStyle}
            >
              <Text size="1" weight="medium">
                API {apiStatus}
              </Text>
            </Badge>

            {setupRequired && (
              <Badge size="1" variant="outline" color="amber" radius="full">
                Setup Inicial
              </Badge>
            )}

            <IconButton
              size="1"
              variant="soft"
              color="gray"
              onClick={toggleTheme}
              title={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
              aria-label={isDarkMode ? 'Ativar modo claro' : 'Ativar modo escuro'}
              style={actionButtonStyle}
            >
              {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
            </IconButton>

            {user ? (
              <Flex align="center" gap="2">
                <Box style={userBadgeStyle}>
                  <Flex align="center" gap="2">
                    <ShieldCheck size={14} color="var(--mint-11)" />
                    <Text size="1" weight="medium">
                      {user.name}
                    </Text>
                    {user.role === 'superadmin' && (
                      <Badge size="1" variant="solid" color="mint">
                        SUPERADMIN
                      </Badge>
                    )}
                  </Flex>
                </Box>

                <Button
                  variant="ghost"
                  color="gray"
                  size="1"
                  onClick={logout}
                  title="Encerrar sessão"
                  style={actionButtonStyle}
                >
                  <LogOut size={14} />
                  Sair
                </Button>
              </Flex>
            ) : !setupRequired && onOpenAuth ? (
              <Button
                variant="soft"
                color="mint"
                size="1"
                onClick={onOpenAuth}
                style={actionButtonStyle}
              >
                <User size={14} />
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
