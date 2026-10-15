import { Box, Flex, Grid, Heading, Text, Spinner } from '@radix-ui/themes'
import { RefreshCw, Plus, Database, ArrowRight } from 'lucide-react'

import SystemStatusGrid from './components/systemStatusGrid'
import CreateAppModal from './components/createAppModal'
import WelcomeBanner from './components/welcomeBanner'
import AuthModal from './components/authModal'
import AppDetail from './components/appDetail'
import Button from '@components/ui/button'
import Badge from '@components/ui/badge'
import Card from '@components/ui/card'
import useHomePage from './hook'

export const HomePage = () => {
  const {
    user,
    apps,
    loading,
    selectedApp,
    isCreateModalOpen,
    isAuthModalOpen,
    totalTokens,
    loadApps,
    setSelectedApp,
    setIsCreateModalOpen,
    setIsAuthModalOpen
  } = useHomePage()

  if (!user) {
    return (
      <Box>
        <WelcomeBanner onOpenAuth={() => setIsAuthModalOpen(true)} />
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
      </Box>
    )
  }

  if (selectedApp) {
    return (
      <AppDetail
        app={selectedApp}
        onBack={() => setSelectedApp(null)}
        onRefreshApp={loadApps}
      />
    )
  }

  return (
    <Box>
      <Flex
        justify="between"
        align={{ initial: 'start', sm: 'center' }}
        direction={{ initial: 'column', sm: 'row' }}
        gap="3"
        mb="5"
      >
        <Box>
          <Heading size="6" weight="bold" style={{ letterSpacing: '-0.02em' }}>
            Painel do Gestor
          </Heading>
          <Text size="2" color="gray">
            Bem-vindo de volta, <strong style={{ color: 'var(--gray-12)' }}>{user.name}</strong> ({user.email})
          </Text>
        </Box>

        <Flex gap="2">
          <Button
            variant="soft"
            color="gray"
            size="2"
            onClick={loadApps}
            leftIcon={<RefreshCw size={15} />}
          >
            Atualizar
          </Button>
          <Button
            variant="solid"
            color="iris"
            size="2"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={<Plus size={16} />}
          >
            Nova Aplicação
          </Button>
        </Flex>
      </Flex>

      <SystemStatusGrid appsCount={apps.length} tokensCount={totalTokens} />

      <Box mb="3">
        <Heading size="4" weight="bold">
          Suas Aplicações ({apps.length})
        </Heading>
      </Box>

      {loading ? (
        <Flex justify="center" align="center" gap="2" py="8">
          <Spinner size="3" />
          <Text size="2" color="gray">
            Carregando aplicações...
          </Text>
        </Flex>
      ) : apps.length === 0 ? (
        <Card size="3" style={{ textAlign: 'center', padding: '48px 20px', border: '1px dashed var(--gray-a5)' }}>
          <Flex direction="column" align="center">
            <Database size={40} color="var(--gray-8)" style={{ marginBottom: 12 }} />
            <Heading size="4" weight="bold" mb="1">
              Nenhuma aplicação criada ainda
            </Heading>
            <Text size="2" color="gray" mb="4" style={{ maxWidth: 420 }}>
              Crie sua primeira aplicação para receber um Project ID e Token de Acesso exclusivo com isolamento no banco de dados.
            </Text>
            <Button
              variant="solid"
              color="iris"
              size="2"
              onClick={() => setIsCreateModalOpen(true)}
              leftIcon={<Plus size={16} />}
            >
              Criar Primeira Aplicação
            </Button>
          </Flex>
        </Card>
      ) : (
        <Grid columns={{ initial: '1', sm: '2', md: '3' }} gap="4">
          {apps.map((app) => (
            <Card
              key={app.id}
              size="2"
              style={{
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}
              onClick={() => setSelectedApp(app)}
            >
              <Box mb="4">
                <Flex justify="between" align="center" mb="2">
                  <Badge size="1" variant="surface" color="iris" radius="full">
                    {app.project_id}
                  </Badge>
                  <Text size="1" color="gray">
                    {new Date(app.created_at).toLocaleDateString()}
                  </Text>
                </Flex>

                <Heading size="3" weight="bold" mb="1">
                  {app.name}
                </Heading>

                <Text
                  size="2"
                  color="gray"
                  as="p"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}
                >
                  {app.description || 'Sem descrição.'}
                </Text>
              </Box>

              <Box style={{ borderTop: '1px solid var(--gray-a4)', paddingTop: '12px' }}>
                <Flex justify="between" align="center">
                  <Flex gap="3">
                    <Text size="1" color="gray">
                      🔑 {app.tokens?.length || 0} Tokens
                    </Text>
                    <Text size="1" color="gray">
                      🌐 {app.allowed_origins.includes('*') ? 'Qualquer Origem' : `${app.allowed_origins.length} Origens`}
                    </Text>
                  </Flex>
                  <Button variant="ghost" color="iris" size="1" rightIcon={<ArrowRight size={13} />}>
                    Gerenciar
                  </Button>
                </Flex>
              </Box>
            </Card>
          ))}
        </Grid>
      )}

      <CreateAppModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          loadApps()
        }}
      />
    </Box>
  )
}

export default HomePage
