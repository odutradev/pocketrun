import { Dialog, TextArea, Flex, Box, Text, IconButton, Code, Callout } from '@radix-ui/themes'
import { X, Copy, Check, Plus, Shield, Globe, AlertCircle } from 'lucide-react'
import { useState, useCallback } from 'react'

import { createApplicationAction } from '@actions/apps'
import Button from '@components/ui/button'
import Badge from '@components/ui/badge'
import Input from '@components/ui/input'

import type { CreateAppModalProps } from './types'
import type { FormEvent } from 'react'

export const CreateAppModal = ({ isOpen, onClose, onSuccess }: CreateAppModalProps) => {
  const [name, setName] = useState<string>('')
  const [projectId, setProjectId] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [origins, setOrigins] = useState<string>('*')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)

  const handleNameChange = useCallback((val: string) => {
    setName(val)
    setProjectId(val.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-'))
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const allowedOriginsList = origins
        .split(',')
        .map((o) => o.trim())
        .filter((o) => o.length > 0)

      const res = await createApplicationAction({
        name,
        project_id: projectId,
        description,
        allowed_origins: allowedOriginsList.length ? allowedOriginsList : ['*'],
        allow_non_browser_requests: true
      })

      setCreatedToken(res.raw_token)
      onSuccess()
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Erro ao criar aplicação'
      setError(message)
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
    setError(null)
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
              <Box mb="3">
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
                <Input
                  label="Nome da Aplicação"
                  placeholder="ex: Meu E-Commerce, Blog Pessoal"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />

                <Input
                  label="Project ID (Identificador Único)"
                  placeholder="ex: meu-ecommerce-2026"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  required
                />

                <Input
                  label="Origens Permitidas (CORS)"
                  placeholder="https://meusite.com, http://localhost:3000 ou *"
                  value={origins}
                  onChange={(e) => setOrigins(e.target.value)}
                  leftIcon={<Globe size={16} />}
                />

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
                  loading={loading}
                  mt="2"
                  style={{ width: '100%' }}
                >
                  Criar Aplicação
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
                margin: '0 auto 16px'
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
                textAlign: 'left'
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
                  leftIcon={copied ? <Check size={14} /> : <Copy size={14} />}
                  style={{ flexShrink: 0 }}
                >
                  {copied ? 'Copiado!' : 'Copiar'}
                </Button>
              </Flex>
            </Box>

            <Button size="3" color="iris" variant="solid" onClick={handleDone} style={{ width: '100%' }}>
              Entendi e Salvei o Token
            </Button>
          </Box>
        )}
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default CreateAppModal
