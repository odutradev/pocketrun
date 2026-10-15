import { Dialog, Button, TextField, Select, Callout, Flex, Box, Text, Badge, IconButton, Code } from '@radix-ui/themes'
import { X, Copy, Check, Key, AlertCircle } from 'lucide-react'
import { useState } from 'react'

import { createAPIToken } from '../services/api'

import type { FormEvent } from 'react'

interface CreateTokenModalProps {
  appId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const CreateTokenModal = ({ appId, isOpen, onClose, onSuccess }: CreateTokenModalProps) => {
  const [name, setName] = useState<string>('')
  const [validityDays, setValidityDays] = useState<number>(365)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const res = await createAPIToken(appId, {
        name: name || 'Novo Token API',
        validity_days: Number(validityDays),
      })
      setCreatedToken(res.raw_token)
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro ao gerar token')
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
    setValidityDays(365)
    onClose()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleDone()}>
      <Dialog.Content maxWidth="480px" style={{ padding: '28px' }}>
        <Flex justify="between" align="start" mb="3">
          <Badge size="1" variant="surface" color="cyan" radius="full">
            <Flex align="center" gap="1">
              <Key size={13} />
              Novo Token de Acesso
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
              Gerar API Key
            </Dialog.Title>
            <Dialog.Description size="2" color="gray" mb="4">
              Crie uma nova chave de acesso com identificador e validade customizados.
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
                    Nome / Identificador do Token
                  </Text>
                  <TextField.Root
                    size="3"
                    type="text"
                    placeholder="ex: App Mobile Flutter, Frontend Web"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </Box>

                <Box>
                  <Text as="label" size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                    Validade do Token
                  </Text>
                  <Select.Root
                    size="3"
                    value={String(validityDays)}
                    onValueChange={(val) => setValidityDays(Number(val))}
                  >
                    <Select.Trigger style={{ width: '100%' }} />
                    <Select.Content>
                      <Select.Item value="30">30 Dias</Select.Item>
                      <Select.Item value="90">90 Dias</Select.Item>
                      <Select.Item value="180">180 Dias</Select.Item>
                      <Select.Item value="365">365 Dias (1 Ano)</Select.Item>
                      <Select.Item value="0">Sem Expiração (Permanente)</Select.Item>
                    </Select.Content>
                  </Select.Root>
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
                  {loading ? 'Gerando Token...' : 'Gerar Token'}
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
                backgroundColor: 'var(--cyan-a3)',
                color: 'var(--cyan-9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <Key size={26} />
            </Box>

            <Dialog.Title size="5" weight="bold" mb="1">
              Token Gerado!
            </Dialog.Title>
            <Dialog.Description size="2" color="gray" mb="4">
              Copie o token abaixo. Ele é exibido <strong>somente nesta tela</strong>.
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
              Concluído
            </Button>
          </Box>
        )}
      </Dialog.Content>
    </Dialog.Root>
  )
}

