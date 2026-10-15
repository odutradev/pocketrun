import { Dialog, Select, Flex, Box, Text, IconButton, Code, Callout } from '@radix-ui/themes'
import { X, Copy, Check, Key, AlertCircle } from 'lucide-react'
import { useState } from 'react'

import { createAPITokenAction } from '@actions/tokens'
import Button from '@components/ui/button'
import Badge from '@components/ui/badge'
import Input from '@components/ui/input'

import type { CreateTokenModalProps } from './types'
import type { FormEvent } from 'react'

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
      const res = await createAPITokenAction(appId, {
        name: name || 'Novo Token API',
        validity_days: Number(validityDays)
      })
      setCreatedToken(res.raw_token)
      onSuccess()
    } catch (err: unknown) {
      const message = (err as { message?: string })?.message || 'Erro ao gerar token'
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
    setValidityDays(365)
    setError(null)
    onClose()
  }

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && handleDone()}>
      <Dialog.Content maxWidth="480px" style={{ padding: '28px' }}>
        <Flex justify="between" align="start" mb="3">
          <Badge size="1" variant="surface" color="iris" radius="full">
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
              Gerar Novo Token
            </Dialog.Title>
            <Dialog.Description size="2" color="gray" mb="4">
              Crie um novo token de autenticação (Bearer API Key) para conectar suas aplicações.
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
                  label="Identificador do Token"
                  placeholder="ex: Backend Produção, Frontend Vercel"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  leftIcon={<Key size={16} />}
                  required
                />

                <Box>
                  <Text as="label" size="2" weight="medium" mb="1" style={{ display: 'block' }}>
                    Validade do Token
                  </Text>
                  <Select.Root
                    value={String(validityDays)}
                    onValueChange={(val) => setValidityDays(Number(val))}
                    size="3"
                  >
                    <Select.Trigger style={{ width: '100%' }} />
                    <Select.Content position="popper">
                      <Select.Item value="30">30 Dias</Select.Item>
                      <Select.Item value="90">90 Dias (3 meses)</Select.Item>
                      <Select.Item value="180">180 Dias (6 meses)</Select.Item>
                      <Select.Item value="365">365 Dias (1 ano)</Select.Item>
                      <Select.Item value="1095">3 Anos</Select.Item>
                    </Select.Content>
                  </Select.Root>
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
                  Gerar Token de Acesso
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
              <Key size={26} />
            </Box>

            <Dialog.Title size="5" weight="bold" mb="1">
              Token Criado com Sucesso!
            </Dialog.Title>
            <Dialog.Description size="2" color="gray" mb="4">
              Copie o token abaixo agora. Por motivos de segurança, você não poderá vê-lo novamente.
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
              Fechar e Concluir
            </Button>
          </Box>
        )}
      </Dialog.Content>
    </Dialog.Root>
  )
}

export default CreateTokenModal
