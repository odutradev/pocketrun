import { Dialog, Button, TextField, TextArea, Callout, Flex, Box, Text, Badge, IconButton, Code } from '@radix-ui/themes'
import { X, Copy, Check, AlertCircle, Plus, Shield, Globe } from 'lucide-react'
import { useState } from 'react'

import { createApplication } from '../services/api'

import type { FormEvent } from 'react'

interface CreateAppModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const CreateAppModal = ({ isOpen, onClose, onSuccess }: CreateAppModalProps) => {
  const [name, setName] = useState<string>('')
  const [projectId, setProjectId] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [origins, setOrigins] = useState<string>('*')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)

  const handleNameChange = (val: string) => {
    setName(val)
    if (!projectId || projectId === name.toLowerCase().replace(/[^a-z0-9-]/g, '-')) {
      setProjectId(val.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-'))
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const allowedOriginsList = origins
        .split(',')
        .map((o) => o.trim())
        .filter((o) => o.length > 0)

      const res = await createApplication({
        name,
        project_id: projectId,
        description,
        allowed_origins: allowedOriginsList.length ? allowedOriginsList : ['*'],
        allow_non_browser_requests: true,
      })

      setCreatedToken(res.raw_token)
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao criar aplicação')
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (createdToken) {
      navigator.clipboard.writeText(createdToken)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDone = () => {
    setCreatedToken(null)
    setName('')
    setProjectId('')
    setDescription('')
    setOrigins('*')
    onClose()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleDone()}>
      <Dialog.Content maxWidth="520px" style={{ padding: '28px' }}>
        <Flex justify="between" align="start" mb="3">
          <Badge size="1" variant="surface" color="iris" radius="full">
            <Flex align="center" gap="1">
              <Plus size={13} />
              Nova Aplicação
            </Flex>
          </Badge>
          <Dialog.Close>
            <IconButton variant="ghost" color="gray" size="1" onClick={handleDone} style={{ cursor: 'pointer' }}>
              <X size={16} />
            </IconButton>
          </Dialog.Close>
        </Flex>

        {!createdToken ? (
          <>
            <Dialog.Title size="5" weight="bold" mb="1">
              Criar Aplicação
            </Dialog.Title>
            <Dialog.Description size="2" color="gray" mb="4">
              Configure os detalhes e as origens de acesso autorizadas para o seu novo projeto.
            </Dialog.Description>

            {error && (
              <Box mb="4">
                <Callout.Root color="ruby" size="1" variant="surface">
                  <Callout.Icon>
                    <AlertCircle size={16} />
                  </Callout.Icon>
                  <Callout.Text>{error}</Callout.Text>
                </Callout.Root>
              </Box>
            )}

            <form onSubmit={handleSubmit}>
              <Flex direction="column" gap="3">
                <Box>
                  <Text as="label" size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                    Nome da Aplicação
                  </Text>
                  <TextField.Root
                    size="3"
                    type="text"
                    placeholder="ex: Meu E-Commerce, Blog Pessoal"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    required
                  />
                </Box>

                <Box>
                  <Text as="label" size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                    Project ID (Identificador Único)
                  </Text>
                  <TextField.Root
                    size="3"
                    type="text"
                    placeholder="ex: meu-ecommerce-2026"
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                    required
                  />
                  <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                    Usado para isolamento dos dados de cada tenant.
                  </Text>
                </Box>

                <Box>
                  <Text as="label" size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                    Origens Permitidas (CORS)
                  </Text>
                  <TextField.Root
                    size="3"
                    type="text"
                    placeholder="https://meusite.com, http://localhost:3000 ou *"
                    value={origins}
                    onChange={(e) => setOrigins(e.target.value)}
                  >
                    <TextField.Slot>
                      <Globe size={16} color="var(--gray-9)" />
                    </TextField.Slot>
                  </TextField.Root>
                  <Text size="1" color="gray" mt="1" style={{ display: 'block' }}>
                    Separe por vírgula. Use * para aceitar qualquer origem.
                  </Text>
                </Box>

                <Box>
                  <Text as="label" size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                    Descrição (Opcional)
                  </Text>
                  <TextArea
                    size="2"
                    rows={2}
                    placeholder="Aplicação web e mobile de pedidos..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Box>

                <Button
                  type="submit"
                  size="3"
                  color="iris"
                  variant="solid"
                  disabled={loading}
                  mt="2"
                  style={{ width: '100%', cursor: 'pointer' }}
                >
                  {loading ? 'Criando Aplicação...' : 'Criar Aplicação'}
                </Button>
              </Flex>
            </form>
          </>
        ) : (
          <Box style={{ textAlign: 'center' }} py="2">
            <Box
              style={{
                width: 52,
                height: 52,
                borderRadius: 'var(--radius-full)',
                backgroundColor: 'var(--grass-a3)',
                color: 'var(--grass-9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Shield size={26} />
            </Box>

            <Dialog.Title size="5" weight="bold" mb="1">
              Aplicação Criada com Sucesso!
            </Dialog.Title>
            <Dialog.Description size="2" color="gray" mb="4">
              Abaixo está o seu <strong>Token de Acesso (API Key)</strong>. Guarde-o em local seguro, pois ele não será exibido novamente.
            </Dialog.Description>

            <Box
              p="3"
              mb="4"
              style={{
                backgroundColor: 'var(--gray-a3)',
                border: '1px solid var(--gray-a5)',
                borderRadius: 'var(--radius-3)',
                textAlign: 'left',
              }}
            >
              <Flex justify="between" align="center" gap="2">
                <Code size="2" color="grass" style={{ wordBreak: 'break-all' }}>
                  {createdToken}
                </Code>
                <Button
                  variant="soft"
                  color={copied ? 'grass' : 'gray'}
                  size="2"
                  onClick={copyToClipboard}
                  style={{ flexShrink: 0, cursor: 'pointer' }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              </Flex>
            </Box>

            <Button
              size="3"
              color="iris"
              variant="solid"
              onClick={handleDone}
              style={{ width: '100%', cursor: 'pointer' }}
            >
              Entendi e Salvei o Token
            </Button>
          </Box>
        )}
      </Dialog.Content>
    </Dialog.Root>
  )
}

