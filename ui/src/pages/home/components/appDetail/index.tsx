import { ArrowLeft, Globe, Key, Database, Trash2, Plus, Save, Check, Code as CodeIcon, Copy, AlertTriangle } from 'lucide-react'
import { Box, Flex, Heading, Text, Tabs, TextArea, Checkbox, AlertDialog, Table, Code, Callout } from '@radix-ui/themes'
import { useState, useCallback } from 'react'

import { updateApplicationAction, deleteApplicationAction } from '@actions/apps'
import { deleteAPITokenAction } from '@actions/tokens'
import CreateTokenModal from '../createTokenModal'
import { API_BASE_URL } from '@api/config'
import Button from '@components/ui/button'
import DataExplorer from '../dataExplorer'
import Badge from '@components/ui/badge'
import Input from '@components/ui/input'
import Card from '@components/ui/card'

import type { AppDetailProps } from './types'
import type { FormEvent } from 'react'

export const AppDetail = ({ app, onBack, onRefreshApp }: AppDetailProps) => {
  const [activeTab, setActiveTab] = useState<string>('security')
  const [originsInput, setOriginsInput] = useState<string>(app.allowed_origins.join(', '))
  const [allowNonBrowser, setAllowNonBrowser] = useState<boolean>(app.allow_non_browser_requests)
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean>(false)
  const [savingSettings, setSavingSettings] = useState<boolean>(false)
  const [settingsSuccess, setSettingsSuccess] = useState<boolean>(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('')
  const [deletingApp, setDeletingApp] = useState<boolean>(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)
  const [tokenToRevoke, setTokenToRevoke] = useState<string | null>(null)

  const handleSaveSettings = async (e: FormEvent) => {
    e.preventDefault()
    setSavingSettings(true)
    setSettingsSuccess(false)
    setSettingsError(null)

    try {
      const allowedOriginsList = originsInput
        .split(',')
        .map((o) => o.trim())
        .filter((o) => o.length > 0)

      await updateApplicationAction(app.id, {
        allowed_origins: allowedOriginsList.length ? allowedOriginsList : ['*'],
        allow_non_browser_requests: allowNonBrowser
      })

      setSettingsSuccess(true)
      onRefreshApp()
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Falha ao salvar configurações'
      setSettingsError(message)
    } finally {
      setSavingSettings(false)
    }
  }

  const handleRevokeToken = async () => {
    if (!tokenToRevoke) return
    try {
      await deleteAPITokenAction(app.id, tokenToRevoke)
      setTokenToRevoke(null)
      onRefreshApp()
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Falha ao revogar token'
      alert(message)
    }
  }

  const handleDeleteApp = async () => {
    if (deleteConfirmText !== app.project_id) return
    setDeletingApp(true)
    setDeleteError(null)
    try {
      await deleteApplicationAction(app.id)
      onBack()
      onRefreshApp()
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Falha ao excluir aplicação'
      setDeleteError(message)
    } finally {
      setDeletingApp(false)
    }
  }

  const copySnippet = useCallback((text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSnippet(id)
    setTimeout(() => setCopiedSnippet(null), 2000)
  }, [])

  const curlSnippet = `curl -X POST "${API_BASE_URL}/api/v1/data/pedidos" \\
  -H "Authorization: Bearer <SEU_TOKEN>" \\
  -H "Content-Type: application/json" \\
  -d '{"cliente": "Maria", "valor": 150.00, "status": "pago"}'`

  const jsSnippet = `const res = await fetch("${API_BASE_URL}/api/v1/data/pedidos", {
  method: "POST",
  headers: {
    "Authorization": "Bearer <SEU_TOKEN>",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    cliente: "Maria",
    valor: 150.00,
    status: "pago"
  })
});
const data = await res.json();
console.log(data);`

  return (
    <Box>
      <Flex align="center" gap="3" mb="4">
        <Button variant="ghost" color="gray" size="2" onClick={onBack} leftIcon={<ArrowLeft size={16} />}>
          Voltar às Aplicações
        </Button>
      </Flex>

      <Card size="3" mb="5">
        <Flex justify="between" align={{ initial: 'start', sm: 'center' }} wrap="wrap" gap="3">
          <Box>
            <Flex align="center" gap="2" mb="1">
              <Heading size="5" weight="bold">
                {app.name}
              </Heading>
              <Badge size="1" variant="surface" color="iris" radius="full">
                {app.project_id}
              </Badge>
            </Flex>
            <Text size="2" color="gray">
              {app.description || 'Nenhuma descrição fornecida.'}
            </Text>
          </Box>

          <Flex gap="3">
            <Badge size="2" variant="surface" color="iris">
              🔑 {app.tokens?.length || 0} Tokens
            </Badge>
            <Badge size="2" variant="surface" color={app.allowed_origins.includes('*') ? 'amber' : 'grass'}>
              🌐 {app.allowed_origins.includes('*') ? 'Origem Global (*)' : `${app.allowed_origins.length} Origens`}
            </Badge>
          </Flex>
        </Flex>
      </Card>

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        <Tabs.List mb="4">
          <Tabs.Trigger value="security">
            <Flex align="center" gap="2">
              <Globe size={15} />
              Segurança & CORS
            </Flex>
          </Tabs.Trigger>
          <Tabs.Trigger value="tokens">
            <Flex align="center" gap="2">
              <Key size={15} />
              Tokens de Acesso ({app.tokens?.length || 0})
            </Flex>
          </Tabs.Trigger>
          <Tabs.Trigger value="explorer">
            <Flex align="center" gap="2">
              <Database size={15} />
              Data Explorer
            </Flex>
          </Tabs.Trigger>
          <Tabs.Trigger value="snippets">
            <Flex align="center" gap="2">
              <CodeIcon size={15} />
              Exemplos de Código
            </Flex>
          </Tabs.Trigger>
          <Tabs.Trigger value="danger">
            <Flex align="center" gap="2">
              <Trash2 size={15} />
              Zona de Perigo
            </Flex>
          </Tabs.Trigger>
        </Tabs.List>

        <Tabs.Content value="security">
          <Card size="3">
            <Heading size="4" weight="bold" mb="1">
              Configurações de Segurança e Origens
            </Heading>
            <Text size="2" color="gray" mb="4">
              Restrinja quais domínios podem enviar requisições do navegador para os endpoints deste projeto.
            </Text>

            <form onSubmit={handleSaveSettings}>
              <Flex direction="column" gap="4">
                <Box>
                  <Text as="label" size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                    Origens Permitidas (CORS)
                  </Text>
                  <TextArea
                    size="2"
                    rows={3}
                    placeholder="https://exemplo.com, http://localhost:3000, *"
                    value={originsInput}
                    onChange={(e) => setOriginsInput(e.target.value)}
                  />
                  <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                    Separe os endereços autorizados por vírgula. Use <Code size="1">*</Code> para liberar requisições de qualquer frontend.
                  </Text>
                </Box>

                <Flex align="center" gap="2">
                  <Checkbox
                    id="allowNonBrowser"
                    checked={allowNonBrowser}
                    onCheckedChange={(checked) => setAllowNonBrowser(Boolean(checked))}
                  />
                  <Text as="label" size="2" htmlFor="allowNonBrowser" style={{ cursor: 'pointer' }}>
                    Permitir requisições que não venham de navegadores (ex: cURL, Insomnia, scripts backend ou mobile)
                  </Text>
                </Flex>

                {settingsSuccess && (
                  <Callout.Root color="grass" size="1">
                    <Callout.Icon>
                      <Check size={14} />
                    </Callout.Icon>
                    <Callout.Text>Configurações atualizadas com sucesso!</Callout.Text>
                  </Callout.Root>
                )}

                {settingsError && (
                  <Callout.Root color="red" size="1">
                    <Callout.Icon>
                      <AlertTriangle size={14} />
                    </Callout.Icon>
                    <Callout.Text>{settingsError}</Callout.Text>
                  </Callout.Root>
                )}

                <Box pt="2">
                  <Button
                    type="submit"
                    variant="solid"
                    color="iris"
                    size="2"
                    loading={savingSettings}
                    leftIcon={<Save size={15} />}
                  >
                    Salvar Alterações
                  </Button>
                </Box>
              </Flex>
            </form>
          </Card>
        </Tabs.Content>

        <Tabs.Content value="tokens">
          <Card size="3">
            <Flex justify="between" align="center" mb="4">
              <Box>
                <Heading size="4" weight="bold">
                  Tokens de Acesso da Aplicação
                </Heading>
                <Text size="2" color="gray">
                  Chaves secretas para autenticar requisições de clientes autorizados.
                </Text>
              </Box>
              <Button
                variant="solid"
                color="iris"
                size="2"
                onClick={() => setIsTokenModalOpen(true)}
                leftIcon={<Plus size={15} />}
              >
                Novo Token
              </Button>
            </Flex>

            {!app.tokens || app.tokens.length === 0 ? (
              <Box py="6" style={{ textAlign: 'center' }}>
                <Key size={32} color="var(--gray-8)" style={{ marginBottom: 8 }} />
                <Text size="2" color="gray" style={{ display: 'block' }}>
                  Nenhum token gerado para esta aplicação.
                </Text>
              </Box>
            ) : (
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>Nome</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Prefixo</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Criado em</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Expiração</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell style={{ width: 80, textAlign: 'center' }}>
                      Ações
                    </Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {app.tokens.map((t) => (
                    <Table.Row key={t.id}>
                      <Table.RowHeaderCell>{t.name}</Table.RowHeaderCell>
                      <Table.Cell>
                        <Code size="1">{t.token_prefix}••••••••</Code>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="1" color="gray">
                          {new Date(t.created_at).toLocaleDateString()}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text size="1" color="gray">
                          {t.expires_at ? new Date(t.expires_at).toLocaleDateString() : 'Sem expiração'}
                        </Text>
                      </Table.Cell>
                      <Table.Cell style={{ textAlign: 'center' }}>
                        <Button
                          variant="ghost"
                          color="red"
                          size="1"
                          onClick={() => setTokenToRevoke(t.id)}
                          leftIcon={<Trash2 size={13} />}
                        >
                          Revogar
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>
            )}
          </Card>
        </Tabs.Content>

        <Tabs.Content value="explorer">
          <DataExplorer appId={app.id} projectName={app.name} />
        </Tabs.Content>

        <Tabs.Content value="snippets">
          <Flex direction="column" gap="4">
            <Card size="3">
              <Flex justify="between" align="center" mb="2">
                <Heading size="3" weight="bold">
                  Exemplo cURL
                </Heading>
                <Button
                  variant="soft"
                  size="1"
                  color={copiedSnippet === 'curl' ? 'grass' : 'gray'}
                  onClick={() => copySnippet(curlSnippet, 'curl')}
                  leftIcon={copiedSnippet === 'curl' ? <Check size={13} /> : <Copy size={13} />}
                >
                  {copiedSnippet === 'curl' ? 'Copiado' : 'Copiar'}
                </Button>
              </Flex>
              <Box p="3" style={{ backgroundColor: 'var(--gray-a3)', borderRadius: 'var(--radius-3)' }}>
                <pre style={{ margin: 0, fontSize: 12, fontFamily: 'monospace', overflow: 'auto' }}>
                  {curlSnippet}
                </pre>
              </Box>
            </Card>

            <Card size="3">
              <Flex justify="between" align="center" mb="2">
                <Heading size="3" weight="bold">
                  Exemplo JavaScript / Fetch
                </Heading>
                <Button
                  variant="soft"
                  size="1"
                  color={copiedSnippet === 'js' ? 'grass' : 'gray'}
                  onClick={() => copySnippet(jsSnippet, 'js')}
                  leftIcon={copiedSnippet === 'js' ? <Check size={13} /> : <Copy size={13} />}
                >
                  {copiedSnippet === 'js' ? 'Copiado' : 'Copiar'}
                </Button>
              </Flex>
              <Box p="3" style={{ backgroundColor: 'var(--gray-a3)', borderRadius: 'var(--radius-3)' }}>
                <pre style={{ margin: 0, fontSize: 12, fontFamily: 'monospace', overflow: 'auto' }}>
                  {jsSnippet}
                </pre>
              </Box>
            </Card>
          </Flex>
        </Tabs.Content>

        <Tabs.Content value="danger">
          <Card size="3" style={{ border: '1px solid var(--ruby-a6)' }}>
            <Flex gap="3" align="start" mb="4">
              <AlertTriangle size={24} color="var(--ruby-9)" />
              <Box>
                <Heading size="4" weight="bold" color="red">
                  Excluir Aplicação Permanentemente
                </Heading>
                <Text size="2" color="gray">
                  Esta ação é irreversível. Todos os dados, chaves e coleções vinculados a este projeto serão apagados.
                </Text>
              </Box>
            </Flex>

            <Box mb="4">
              <Text size="2" mb="1" style={{ display: 'block' }}>
                Para confirmar, digite o identificador do projeto: <Code size="2">{app.project_id}</Code>
              </Text>
              <Input
                placeholder={app.project_id}
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
              />
            </Box>

            {deleteError && (
              <Box mb="4">
                <Callout.Root color="red" size="1">
                  <Callout.Icon>
                    <AlertTriangle size={14} />
                  </Callout.Icon>
                  <Callout.Text>{deleteError}</Callout.Text>
                </Callout.Root>
              </Box>
            )}

            <Button
              variant="solid"
              color="red"
              size="2"
              disabled={deleteConfirmText !== app.project_id}
              loading={deletingApp}
              onClick={handleDeleteApp}
              leftIcon={<Trash2 size={15} />}
            >
              Excluir Esta Aplicação
            </Button>
          </Card>
        </Tabs.Content>
      </Tabs.Root>

      <CreateTokenModal
        appId={app.id}
        isOpen={isTokenModalOpen}
        onClose={() => setIsTokenModalOpen(false)}
        onSuccess={() => {
          setIsTokenModalOpen(false)
          onRefreshApp()
        }}
      />

      <AlertDialog.Root open={Boolean(tokenToRevoke)} onOpenChange={(open) => !open && setTokenToRevoke(null)}>
        <AlertDialog.Content maxWidth="450px">
          <AlertDialog.Title size="4" weight="bold">
            Confirmar Revogação de Token
          </AlertDialog.Title>
          <AlertDialog.Description size="2" color="gray">
            Tem certeza que deseja revogar este token de acesso? Todas as requisições autenticadas por ele serão rejeitadas imediatamente.
          </AlertDialog.Description>
          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button variant="soft" color="gray" size="2">
                Cancelar
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button variant="solid" color="red" size="2" onClick={handleRevokeToken}>
                Sim, Revogar Token
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Box>
  )
}

export default AppDetail
