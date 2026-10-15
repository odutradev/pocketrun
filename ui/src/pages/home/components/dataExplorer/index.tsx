import { Box, Flex, Grid, Heading, Text, Table, Dialog, Code, Spinner } from '@radix-ui/themes'
import { Folder, RefreshCw, Eye, Search } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'

import { getExplorerCollectionsAction, getExplorerDocumentsAction } from '@api/actions/explorer'
import Button from '@components/ui/button'
import Badge from '@components/ui/badge'
import Input from '@components/ui/input'
import Card from '@components/ui/card'

import type { ExplorerDocumentsResponse, ExplorerDocument } from '@projectTypes/application'
import type { DataExplorerProps } from './types'

export const DataExplorer = ({ appId, projectName }: DataExplorerProps) => {
  const [collections, setCollections] = useState<string[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [documentsData, setDocumentsData] = useState<ExplorerDocumentsResponse | null>(null)
  const [loadingCols, setLoadingCols] = useState<boolean>(true)
  const [loadingDocs, setLoadingDocs] = useState<boolean>(false)
  const [search, setSearch] = useState<string>('')
  const [activeDoc, setActiveDoc] = useState<ExplorerDocument | null>(null)
  const [page, setPage] = useState<number>(1)

  const loadCollections = useCallback(async () => {
    setLoadingCols(true)
    try {
      const data = await getExplorerCollectionsAction(appId)
      setCollections(data)
      if (data.length > 0 && !selectedCollection) {
        setSelectedCollection(data[0])
      }
    } finally {
      setLoadingCols(false)
    }
  }, [appId, selectedCollection])

  const loadDocuments = useCallback(
    async (col: string, p = 1) => {
      setLoadingDocs(true)
      try {
        const data = await getExplorerDocumentsAction({ appId, collection: col, page: p, limit: 15 })
        setDocumentsData(data)
        setPage(p)
      } finally {
        setLoadingDocs(false)
      }
    },
    [appId]
  )

  useEffect(() => {
    let isSubscribed = true
    getExplorerCollectionsAction(appId)
      .then((data) => {
        if (!isSubscribed) return
        setCollections(data)
        if (data.length > 0) {
          setSelectedCollection((prev) => prev || data[0])
        }
      })
      .finally(() => {
        if (isSubscribed) setLoadingCols(false)
      })

    return () => {
      isSubscribed = false
    }
  }, [appId])

  useEffect(() => {
    if (!selectedCollection) return

    let isSubscribed = true
    getExplorerDocumentsAction({ appId, collection: selectedCollection, page: 1, limit: 15 })
      .then((data) => {
        if (!isSubscribed) return
        setDocumentsData(data)
        setPage(1)
      })
      .finally(() => {
        if (isSubscribed) setLoadingDocs(false)
      })

    return () => {
      isSubscribed = false
    }
  }, [appId, selectedCollection])

  const filteredDocs =
    documentsData?.data?.filter((doc) => {
      if (!search.trim()) return true
      return JSON.stringify(doc).toLowerCase().includes(search.toLowerCase())
    }) ?? []

  return (
    <Box>
      <Flex
        justify="between"
        align={{ initial: 'start', sm: 'center' }}
        direction={{ initial: 'column', sm: 'row' }}
        gap="2"
        mb="4"
      >
        <Box>
          <Heading size="4" weight="bold">
            Data Explorer — {projectName}
          </Heading>
          <Text size="2" color="gray">
            Inspecione coleções e documentos armazenados nesta aplicação.
          </Text>
        </Box>

        <Button
          variant="soft"
          color="gray"
          size="2"
          onClick={() => {
            loadCollections()
            if (selectedCollection) loadDocuments(selectedCollection, page)
          }}
          leftIcon={<RefreshCw size={14} />}
        >
          Atualizar Dados
        </Button>
      </Flex>

      <Grid columns={{ initial: '1', md: '1fr 3fr' }} gap="4">
        <Card size="2">
          <Text size="2" weight="bold" mb="2" color="gray" style={{ display: 'block' }}>
            Coleções ({collections.length})
          </Text>

          {loadingCols ? (
            <Flex justify="center" py="4">
              <Spinner size="2" />
            </Flex>
          ) : collections.length === 0 ? (
            <Text size="2" color="gray" style={{ textAlign: 'center', display: 'block', padding: '16px 0' }}>
              Nenhuma coleção encontrada.
            </Text>
          ) : (
            <Flex direction="column" gap="1">
              {collections.map((col) => (
                <Button
                  key={col}
                  variant={selectedCollection === col ? 'solid' : 'ghost'}
                  color="iris"
                  size="2"
                  onClick={() => setSelectedCollection(col)}
                  leftIcon={<Folder size={14} />}
                  style={{ justifyContent: 'flex-start', textAlign: 'left' }}
                >
                  {col}
                </Button>
              ))}
            </Flex>
          )}
        </Card>

        <Card size="2">
          <Flex justify="between" align="center" gap="3" mb="3">
            <Badge size="2" variant="surface" color="iris">
              {selectedCollection || 'Selecione uma coleção'}
            </Badge>

            <Box style={{ maxWidth: 260, width: '100%' }}>
              <Input
                placeholder="Filtrar nesta página..."
                size="1"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search size={14} />}
              />
            </Box>
          </Flex>

          {loadingDocs ? (
            <Flex justify="center" align="center" gap="2" py="6">
              <Spinner size="2" />
              <Text size="2" color="gray">
                Buscando documentos...
              </Text>
            </Flex>
          ) : !selectedCollection ? (
            <Text size="2" color="gray" style={{ textAlign: 'center', display: 'block', padding: '32px 0' }}>
              Escolha uma coleção à esquerda para visualizar seus registros.
            </Text>
          ) : filteredDocs.length === 0 ? (
            <Text size="2" color="gray" style={{ textAlign: 'center', display: 'block', padding: '32px 0' }}>
              Nenhum documento encontrado.
            </Text>
          ) : (
            <>
              <Table.Root variant="surface">
                <Table.Header>
                  <Table.Row>
                    <Table.ColumnHeaderCell>ID</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Criado em</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell>Resumo de Dados</Table.ColumnHeaderCell>
                    <Table.ColumnHeaderCell style={{ width: 80, textAlign: 'center' }}>
                      Ação
                    </Table.ColumnHeaderCell>
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {filteredDocs.map((doc) => (
                    <Table.Row key={doc._id}>
                      <Table.RowHeaderCell>
                        <Code size="1">{doc._id.slice(0, 10)}...</Code>
                      </Table.RowHeaderCell>
                      <Table.Cell>
                        <Text size="1" color="gray">
                          {new Date(doc.created_at).toLocaleString()}
                        </Text>
                      </Table.Cell>
                      <Table.Cell>
                        <Text
                          size="1"
                          color="gray"
                          style={{
                            maxWidth: 320,
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {JSON.stringify(doc.data)}
                        </Text>
                      </Table.Cell>
                      <Table.Cell style={{ textAlign: 'center' }}>
                        <Button
                          variant="ghost"
                          color="iris"
                          size="1"
                          onClick={() => setActiveDoc(doc)}
                          leftIcon={<Eye size={13} />}
                        >
                          Ver
                        </Button>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table.Root>

              {documentsData && documentsData.total_pages > 1 && (
                <Flex justify="between" align="center" mt="3">
                  <Text size="1" color="gray">
                    Página {documentsData.page} de {documentsData.total_pages} ({documentsData.total} registros)
                  </Text>
                  <Flex gap="2">
                    <Button
                      variant="soft"
                      size="1"
                      disabled={page <= 1}
                      onClick={() => loadDocuments(selectedCollection, page - 1)}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="soft"
                      size="1"
                      disabled={page >= documentsData.total_pages}
                      onClick={() => loadDocuments(selectedCollection, page + 1)}
                    >
                      Próxima
                    </Button>
                  </Flex>
                </Flex>
              )}
            </>
          )}
        </Card>
      </Grid>

      <Dialog.Root open={Boolean(activeDoc)} onOpenChange={(open) => !open && setActiveDoc(null)}>
        <Dialog.Content maxWidth="600px">
          <Dialog.Title size="4" weight="bold" mb="2">
            Detalhes do Documento
          </Dialog.Title>
          <Dialog.Description size="1" color="gray" mb="3">
            ID: <Code size="1">{activeDoc?._id}</Code>
          </Dialog.Description>

          <Box
            p="3"
            style={{
              backgroundColor: 'var(--gray-a3)',
              borderRadius: 'var(--radius-3)',
              maxHeight: 360,
              overflow: 'auto'
            }}
          >
            <pre style={{ margin: 0, fontSize: 12, fontFamily: 'monospace' }}>
              {JSON.stringify(activeDoc?.data, null, 2)}
            </pre>
          </Box>

          <Flex justify="end" mt="4">
            <Button variant="soft" color="gray" size="2" onClick={() => setActiveDoc(null)}>
              Fechar
            </Button>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
    </Box>
  )
}

export default DataExplorer
