import {
  Box,
  Flex,
  Grid,
  Card,
  Heading,
  Text,
  Badge,
  Button,
  Tabs,
  TextArea,
  Checkbox,
  AlertDialog,
  Callout,
  TextField,
} from '@radix-ui/themes'
import {
  ArrowLeft,
  Globe,
  Key,
  Database,
  Trash2,
  Plus,
  Shield,
  Save,
  Check,
  Code as CodeIcon,
  Copy,
  AlertTriangle,
} from 'lucide-react'
import { useState } from 'react'

import { API_BASE_URL, updateApplication, deleteApplication, deleteAPIToken } from '../services/api'
import { CreateTokenModal } from './createTokenModal'
import { DataExplorer } from './dataExplorer'

import type { Application } from '../services/api'
import type { FormEvent } from 'react'

interface AppDetailProps {
  app: Application
  onBack: () => void
  onRefreshApp: () => void
}

export const AppDetail = ({ app, onBack, onRefreshApp }: AppDetailProps) => {
  const [activeTab, setActiveTab] = useState<string>('security')
  const [originsInput, setOriginsInput] = useState<string>(app.allowed_origins.join(', '))
  const [allowNonBrowser, setAllowNonBrowser] = useState<boolean>(app.allow_non_browser_requests)
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean>(false)
  const [savingSettings, setSavingSettings] = useState<boolean>(false)
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('')
  const [deletingApp, setDeletingApp] = useState<boolean>(false)
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)
  const [tokenToRevoke, setTokenToRevoke] = useState<string | null>(null)

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault()
    setSavingSettings(true)
    setSaveSuccess(false)

    try {
      const originsList = originsInput
        .split(',')
        .map((o) => o.trim())
        .filter((o) => o.length > 0)

      await updateApplication(app.id, {
        name: app.name,
        description: app.description,
        allowed_origins: originsList.length ? originsList : ['*'],
        allow_non_browser_requests: allowNonBrowser,
      })

      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      onRefreshApp()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao salvar configurações')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleConfirmRevokeToken = async () => {
    if (!tokenToRevoke) return
    try {
      await deleteAPIToken(app.id, tokenToRevoke)
      setTokenToRevoke(null)
      onRefreshApp()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao revogar token')
    }
  }

  const handleDeleteApplication = async () => {
    if (deleteConfirmText !== app.project_id) {
      alert(`Por favor digite exatamente "${app.project_id}" para confirmar a exclusão.`)
      return
    }

    setDeletingApp(true)
    try {
      await deleteApplication(app.id)
      onBack()
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao excluir aplicação')
      setDeletingApp(false)
    }
  }

  const copyCodeSnippet = (snippet: string, name: string) => {
    navigator.clipboard.writeText(snippet)
    setCopiedSnippet(name)
    setTimeout(() => setCopiedSnippet(null), 2000)
  }

  const sampleFetchCode = `const API_URL = "${API_BASE_URL || window.location.origin}"
const TOKEN = "seu-token-aqui"

fetch(\`\${API_URL}/kv/tarefas/create\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'controlAccess': TOKEN
  },
  body: JSON.stringify({
    data: { titulo: "Comprar Leite", concluida: false, prioridade: "alta" },
    expiresInDays: 30
  })
})

fetch(\`\${API_URL}/kv/tarefas/get-all?concluida=false\`, {
  headers: { 'controlAccess': TOKEN }
})`

  return (
    <Box>
      {/* Top action bar */}
      <Flex justify="between" align="center" mb="4">
        <Button variant="soft" color="gray" size="2" onClick={onBack} style={{ cursor: 'pointer' }}>
          <ArrowLeft size={16} />
          Voltar às Aplicações
        </Button>

        <Badge size="2" variant="surface" color="iris" radius="full">
          Project ID: {app.project_id}
        </Badge>
      </Flex>

      {/* App Header Banner */}
      <Card size="3" mb="5" style={{ border: '1px solid var(--gray-a4)', backgroundColor: 'var(--gray-a2)' }}>
        <Flex align="center" gap="3">
          <Box
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-3)',
              background: 'linear-gradient(135deg, var(--iris-9) 0%, var(--cyan-9) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 16px var(--iris-a6)',
            }}
          >
            <Shield size={22} color="#FFF" />
          </Box>
          <Box>
            <Heading size="6" weight="bold" style={{ letterSpacing: '-0.02em' }}>
              {app.name}
            </Heading>
            <Text size="2" color="gray">
              {app.description || 'Nenhuma descrição fornecida.'}
            </Text>
          </Box>
        </Flex>
      </Card>

      {/* Radix Tabs */}
      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List size="2" mb="5">
          <Tabs.Trigger value="security" style={{ cursor: 'pointer' }}>
            <Flex align="center" gap="2">
              <Globe size={15} />
              Segurança & CORS
            </Flex>
          </Tabs.Trigger>
          <Tabs.Trigger value="tokens" style={{ cursor: 'pointer' }}>
            <Flex align="center" gap="2">
              <Key size={15} />
              Tokens ({app.tokens?.length || 0})
            </Flex>
          </Tabs.Trigger>
          <Tabs.Trigger value="explorer" style={{ cursor: 'pointer' }}>
            <Flex align="center" gap="2">
              <Database size={15} />
              Data Explorer
            </Flex>
          </Tabs.Trigger>
          <Tabs.Trigger value="danger" style={{ cursor: 'pointer', color: 'var(--ruby-9)' }}>
            <Flex align="center" gap="2">
              <AlertTriangle size={15} />
              Zona de Risco
            </Flex>
          </Tabs.Trigger>
        </Tabs.List>

        {/* Tab 1: Security & CORS */}
        <Tabs.Content value="security">
          <Grid columns={{ initial: '1', md: '2' }} gap="4">
            <Card size="3" style={{ border: '1px solid var(--gray-a4)', backgroundColor: 'var(--gray-a2)' }}>
              <Heading size="4" weight="bold" mb="1">
                Controle de Origens Autorizadas (CORS)
              </Heading>
              <Text size="2" color="gray" mb="4" as="p">
                Defina quais domínios web têm permissão para ler e gravar dados nesta aplicação.
              </Text>

              <form onSubmit={handleSaveSettings}>
                <Flex direction="column" gap="4">
                  <Box>
                    <Text as="label" size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                      Origens Permitidas (Separe por vírgula)
                    </Text>
                    <TextArea
                      size="3"
                      rows={4}
                      value={originsInput}
                      onChange={(e) => setOriginsInput(e.target.value)}
                      placeholder="https://meusite.com.br, http://localhost:3000 ou *"
                    />
                    <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                      Use <code>*</code> para aceitar qualquer origem durante o desenvolvimento.
                    </Text>
                  </Box>

                  <Flex align="center" gap="2">
                    <Checkbox
                      id="nonBrowser"
                      checked={allowNonBrowser}
                      onCheckedChange={(checked) => setAllowNonBrowser(checked === true)}
                    />
                    <Text as="label" htmlFor="nonBrowser" size="2" style={{ cursor: 'pointer' }}>
                      Permitir requisições sem header <code>Origin</code> (Mobile nativo, Postman, server-to-server)
                    </Text>
                  </Flex>

                  {saveSuccess && (
                    <Callout.Root color="grass" size="1" variant="surface">
                      <Callout.Icon>
                        <Check size={16} />
                      </Callout.Icon>
                      <Callout.Text>Configurações atualizadas com sucesso!</Callout.Text>
                    </Callout.Root>
                  )}

                  <Button
                    type="submit"
                    size="3"
                    color="iris"
                    variant="solid"
                    disabled={savingSettings}
                    style={{ alignSelf: 'flex-start', cursor: 'pointer' }}
                  >
                    <Save size={16} />
                    {savingSettings ? 'Salvando...' : 'Salvar Configurações'}
                  </Button>
                </Flex>
              </form>
            </Card>

            <Card size="3" style={{ border: '1px solid var(--gray-a4)', backgroundColor: 'var(--gray-a2)' }}>
              <Flex justify="between" align="center" mb="3">
                <Flex align="center" gap="2">
                  <CodeIcon size={18} color="var(--cyan-9)" />
                  <Heading size="4" weight="bold">
                    Como Consumir a API
                  </Heading>
                </Flex>
                <Button
                  variant="soft"
                  color={copiedSnippet === 'fetch' ? 'grass' : 'gray'}
                  size="1"
                  onClick={() => copyCodeSnippet(sampleFetchCode, 'fetch')}
                  style={{ cursor: 'pointer' }}
                >
                  {copiedSnippet === 'fetch' ? <Check size={13} /> : <Copy size={13} />}
                  {copiedSnippet === 'fetch' ? 'Copiado!' : 'Copiar'}
                </Button>
              </Flex>

              <Box
                p="3"
                style={{
                  backgroundColor: 'var(--gray-a3)',
                  border: '1px solid var(--gray-a4)',
                  borderRadius: 'var(--radius-3)',
                  overflowX: 'auto',
                }}
              >
                <pre
                  style={{
                    margin: 0,
                    fontSize: '0.8rem',
                    color: 'var(--iris-9)',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {sampleFetchCode}
                </pre>
              </Box>
            </Card>
          </Grid>
        </Tabs.Content>

        {/* Tab 2: Tokens */}
        <Tabs.Content value="tokens">
          <Flex justify="between" align="center" mb="4">
            <Box>
              <Heading size="4" weight="bold">
                Tokens de Acesso (API Keys)
              </Heading>
              <Text size="2" color="gray">
                Tokens ativos para esta aplicação. Cada cliente utiliza seu próprio token no header <code>controlAccess</code>.
              </Text>
            </Box>

            <Button
              variant="solid"
              color="iris"
              size="2"
              onClick={() => setIsTokenModalOpen(true)}
              style={{ cursor: 'pointer' }}
            >
              <Plus size={16} />
              Gerar Novo Token
            </Button>
          </Flex>

          <Flex direction="column" gap="3">
            {app.tokens && app.tokens.length > 0 ? (
              app.tokens.map((token) => (
                <Card
                  key={token.id}
                  size="2"
                  style={{ border: '1px solid var(--gray-a4)', backgroundColor: 'var(--gray-a2)' }}
                >
                  <Flex justify="between" align="center" wrap="wrap" gap="3">
                    <Flex align="center" gap="3">
                      <Box
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 'var(--radius-3)',
                          backgroundColor: 'var(--cyan-a3)',
                          color: 'var(--cyan-9)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Key size={18} />
                      </Box>
                      <Box>
                        <Text size="2" weight="bold">
                          {token.name}
                        </Text>
                        <Text size="1" color="gray" as="p" style={{ fontFamily: 'var(--font-mono)' }}>
                          Prefixo: {token.token_prefix}
                        </Text>
                      </Box>
                    </Flex>

                    <Flex align="center" gap="4">
                      <Box style={{ textAlign: 'right' }}>
                        <Text size="1" color="gray" as="p">
                          Criado: {new Date(token.created_at).toLocaleDateString()}
                        </Text>
                        <Text size="1" color="gray" as="p">
                          Expira:{' '}
                          {token.expires_at ? (
                            <span style={{ color: new Date(token.expires_at) < new Date() ? 'var(--ruby-9)' : 'var(--gray-12)' }}>
                              {new Date(token.expires_at).toLocaleDateString()}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--grass-9)' }}>Nunca</span>
                          )}
                        </Text>
                      </Box>

                      <Button
                        variant="soft"
                        color="ruby"
                        size="1"
                        onClick={() => setTokenToRevoke(token.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Trash2 size={13} />
                        Revogar
                      </Button>
                    </Flex>
                  </Flex>
                </Card>
              ))
            ) : (
              <Card size="3" style={{ textAlign: 'center', padding: '36px', border: '1px dashed var(--gray-a5)', backgroundColor: 'var(--gray-a2)' }}>
                <Text size="2" color="gray">
                  Nenhum token cadastrado para esta aplicação. Clique no botão acima para gerar um.
                </Text>
              </Card>
            )}
          </Flex>

          <CreateTokenModal
            appId={app.id}
            isOpen={isTokenModalOpen}
            onClose={() => setIsTokenModalOpen(false)}
            onSuccess={() => {
              setIsTokenModalOpen(false)
              onRefreshApp()
            }}
          />
        </Tabs.Content>

        {/* Tab 3: Data Explorer */}
        <Tabs.Content value="explorer">
          <DataExplorer appId={app.id} projectName={app.name} />
        </Tabs.Content>

        {/* Tab 4: Danger Zone */}
        <Tabs.Content value="danger">
          <Card
            size="3"
            style={{
              border: '1px solid var(--ruby-a5)',
              backgroundColor: 'var(--ruby-a2)',
              padding: '28px',
            }}
          >
            <Flex align="center" gap="2" mb="2" style={{ color: 'var(--ruby-9)' }}>
              <AlertTriangle size={20} />
              <Heading size="4" weight="bold">
                Excluir Aplicação Definitivamente
              </Heading>
            </Flex>

            <Text size="2" color="gray" mb="4" as="p" style={{ lineHeight: 1.6 }}>
              Esta ação é <strong>irreversível</strong>. A exclusão desta aplicação apagará permanentemente todos os <strong>Tokens de Acesso</strong> e <strong>TODOS OS REGISTROS</strong> gravados em todas as coleções deste projeto no banco de dados.
            </Text>

            <Box mb="4" style={{ maxWidth: 420 }}>
              <Text size="2" weight="medium" mb="2" as="label" style={{ display: 'block' }}>
                Para confirmar, digite o Project ID (<code>{app.project_id}</code>):
              </Text>
              <TextField.Root
                size="3"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={app.project_id}
              />
            </Box>

            <Button
              variant="solid"
              color="ruby"
              size="3"
              disabled={deletingApp || deleteConfirmText !== app.project_id}
              onClick={handleDeleteApplication}
              style={{ cursor: deletingApp || deleteConfirmText !== app.project_id ? 'not-allowed' : 'pointer' }}
            >
              <Trash2 size={16} />
              {deletingApp ? 'Excluindo Aplicação...' : 'Excluir Aplicação e Dados'}
            </Button>
          </Card>
        </Tabs.Content>
      </Tabs.Root>

      {/* Revoke Token Alert Dialog */}
      <AlertDialog.Root open={!!tokenToRevoke} onOpenChange={(open) => !open && setTokenToRevoke(null)}>
        <AlertDialog.Content maxWidth="450px">
          <AlertDialog.Title>Revogar Token de Acesso</AlertDialog.Title>
          <AlertDialog.Description size="2">
            Tem certeza de que deseja revogar este token? Todos os clientes que o utilizam perderão o acesso imediatamente.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray">
                Cancelar
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button variant="solid" color="ruby" onClick={handleConfirmRevokeToken}>
                Sim, Revogar Token
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  )
}

