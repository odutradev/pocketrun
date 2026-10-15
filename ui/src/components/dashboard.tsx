import { Box, Flex, Grid, Card, Heading, Text, Badge, Button, Spinner } from '@radix-ui/themes'
import { Plus, Database, Key, Shield, Layers, ArrowRight, RefreshCw, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'

import { fetchApplications } from '../services/api'
import { CreateAppModal } from './createAppModal'
import { useAuth } from '../context/authContext'
import { AppDetail } from './appDetail'

import type { Application } from '../services/api'

interface DashboardProps {
  onOpenAuth: () => void
}

export const Dashboard = ({ onOpenAuth }: DashboardProps) => {
  const { user } = useAuth()
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)

  const loadApps = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await fetchApplications()
      setApps(data)
      if (selectedApp) {
        const updated = data.find((a) => a.id === selectedApp.id)
        if (updated) setSelectedApp(updated)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApps()
  }, [user])

  if (!user) {
    return (
      <Box style={{ maxWidth: 860, margin: '48px auto', padding: '0 16px', textAlign: 'center' }}>
        <Card size="4" style={{ padding: '56px 32px', border: '1px solid var(--gray-a4)', backgroundColor: 'var(--gray-a2)' }}>
          <Flex direction="column" align="center">
            <Box
              mb="4"
              style={{
                width: 64,
                height: 64,
                borderRadius: 'var(--radius-4)',
                background: 'linear-gradient(135deg, var(--iris-9) 0%, var(--cyan-9) 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 28px var(--iris-a6)',
              }}
            >
              <Sparkles size={32} color="#FFF" />
            </Box>

            <Heading size="7" weight="bold" mb="3" style={{ letterSpacing: '-0.03em' }}>
              PocketRun v2 — O Backend Genérico Multi-Tenant
            </Heading>

            <Text size="3" color="gray" mb="5" style={{ maxWidth: 580, lineHeight: 1.6 }}>
              Crie e gerencie aplicações, configure tokens de acesso com isolamento completo e controle os domínios de origem autorizados (CORS) para todos os seus projetos pessoais e protótipos.
            </Text>

            <Button
              size="3"
              color="iris"
              variant="solid"
              onClick={onOpenAuth}
              style={{ cursor: 'pointer', padding: '0 24px' }}
            >
              <Shield size={18} />
              Entrar / Cadastrar como Gestor
            </Button>
          </Flex>
        </Card>
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

  const totalTokens = apps.reduce((acc, app) => acc + (app.tokens?.length || 0), 0)

  return (
    <Box>
      {/* Header section */}
      <Flex justify="between" align={{ initial: 'start', sm: 'center' }} direction={{ initial: 'column', sm: 'row' }} gap="3" mb="5">
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
            style={{ cursor: 'pointer' }}
          >
            <RefreshCw size={15} />
            Atualizar
          </Button>
          <Button
            variant="solid"
            color="iris"
            size="2"
            onClick={() => setIsCreateModalOpen(true)}
            style={{ cursor: 'pointer' }}
          >
            <Plus size={16} />
            Nova Aplicação
          </Button>
        </Flex>
      </Flex>

      {/* Metrics Cards */}
      <Grid columns={{ initial: '1', sm: '3' }} gap="3" mb="6">
        <Card size="2" style={{ border: '1px solid var(--gray-a4)', backgroundColor: 'var(--gray-a2)' }}>
          <Flex justify="between" align="center" mb="2">
            <Text size="2" weight="medium" color="gray">
              Aplicações Ativas
            </Text>
            <Layers size={18} color="var(--iris-9)" />
          </Flex>
          <Heading size="7" weight="bold">
            {apps.length}
          </Heading>
        </Card>

        <Card size="2" style={{ border: '1px solid var(--gray-a4)', backgroundColor: 'var(--gray-a2)' }}>
          <Flex justify="between" align="center" mb="2">
            <Text size="2" weight="medium" color="gray">
              Tokens de Acesso
            </Text>
            <Key size={18} color="var(--cyan-9)" />
          </Flex>
          <Heading size="7" weight="bold">
            {totalTokens}
          </Heading>
        </Card>

        <Card size="2" style={{ border: '1px solid var(--gray-a4)', backgroundColor: 'var(--gray-a2)' }}>
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

      {/* Applications Section */}
      <Box mb="3">
        <Heading size="4" weight="bold">
          Suas Aplicações ({apps.length})
        </Heading>
      </Box>

      {loading ? (
        <Flex justify="center" align="center" gap="2" py="8">
          <Spinner size="3" />
          <Text size="2" color="gray">Carregando aplicações...</Text>
        </Flex>
      ) : apps.length === 0 ? (
        <Card size="3" style={{ textAlign: 'center', padding: '48px 20px', border: '1px dashed var(--gray-a5)', backgroundColor: 'var(--gray-a2)' }}>
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
              style={{ cursor: 'pointer' }}
            >
              <Plus size={16} />
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
                justifyContent: 'space-between',
                border: '1px solid var(--gray-a4)',
                backgroundColor: 'var(--gray-a2)',
                transition: 'border-color 0.15s ease, transform 0.15s ease',
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
                    overflow: 'hidden',
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
                  <Button variant="ghost" color="iris" size="1" style={{ cursor: 'pointer' }}>
                    <span>Gerenciar</span>
                    <ArrowRight size={13} />
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

