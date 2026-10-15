import { Box, Flex, Grid, Card, Heading, Text, Badge, Button, TextField, Spinner, ScrollArea, Code } from '@radix-ui/themes'
import { Database, RefreshCw, Layers, ChevronLeft, ChevronRight, FileText, Search } from 'lucide-react'
import { useState, useEffect } from 'react'

import { fetchExplorerCollections, fetchExplorerDocuments } from '../services/api'

import type { ExplorerDocumentsResponse, ExplorerDocument } from '../services/api'

interface DataExplorerProps {
  appId: string
  projectName: string
}

export const DataExplorer = ({ appId, projectName }: DataExplorerProps) => {
  const [collections, setCollections] = useState<string[]>([])
  const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
  const [documentsData, setDocumentsData] = useState<ExplorerDocumentsResponse | null>(null)
  const [loadingCols, setLoadingCols] = useState<boolean>(true)
  const [loadingDocs, setLoadingDocs] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [search, setSearch] = useState<string>('')

  const loadCollections = async () => {
    setLoadingCols(true)
    try {
      const cols = await fetchExplorerCollections(appId)
      setCollections(cols)
      if (cols.length > 0 && !selectedCollection) {
        setSelectedCollection(cols[0])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingCols(false)
    }
  }

  const loadDocuments = async (col: string, p = 1) => {
    setLoadingDocs(true)
    try {
      const data = await fetchExplorerDocuments(appId, col, p, 15)
      setDocumentsData(data)
      setPage(p)
    } catch (err) {
      console.error(err)
    } finally {
      setLoadingDocs(false)
    }
  }

  useEffect(() => {
    loadCollections()
  }, [appId])

  useEffect(() => {
    if (selectedCollection) {
      loadDocuments(selectedCollection, 1)
    } else {
      setDocumentsData(null)
    }
  }, [selectedCollection])

  const filteredDocs = documentsData?.data?.filter((doc) => {
    if (!search.trim()) return true
    return JSON.stringify(doc).toLowerCase().includes(search.toLowerCase())
  }) ?? []

  return (
    <Box>
      <Flex justify="between" align={{ initial: 'start', sm: 'center' }} direction={{ initial: 'column', sm: 'row' }} gap="2" mb="4">
        <Box>
          <Heading size="4" weight="bold">
            Data Explorer — {projectName}
          </Heading>
          <Text size="2" color="gray">
            Navegue e inspecione os dados gravados pelas aplicações nas coleções.
          </Text>
        </Box>
        <Button
          variant="soft"
          color="gray"
          size="2"
          onClick={loadCollections}
          style={{ cursor: 'pointer' }}
        >
          <RefreshCw size={14} />
          Atualizar
        </Button>
      </Flex>

      {loadingCols ? (
        <Flex justify="center" align="center" gap="2" py="8">
          <Spinner size="3" />
          <Text size="2" color="gray">Carregando coleções do projeto...</Text>
        </Flex>
      ) : collections.length === 0 ? (
        <Card size="3" style={{ textAlign: 'center', padding: '48px 24px', border: '1px dashed var(--gray-a5)', backgroundColor: 'var(--gray-a2)' }}>
          <Flex direction="column" align="center">
            <Database size={40} color="var(--gray-8)" style={{ marginBottom: 12 }} />
            <Heading size="4" weight="bold" mb="1">
              Nenhuma Coleção Encontrada
            </Heading>
            <Text size="2" color="gray" style={{ maxWidth: 460 }}>
              Esta aplicação ainda não enviou dados para o PocketRun. Quando seu frontend fizer requisições para <code>POST /kv/:collection/create</code>, as coleções aparecerão aqui automaticamente!
            </Text>
          </Flex>
        </Card>
      ) : (
        <Grid columns={{ initial: '1', md: '240px 1fr' }} gap="4">
          {/* Collections List */}
          <Card size="2" style={{ border: '1px solid var(--gray-a4)', backgroundColor: 'var(--gray-a2)' }}>
            <Flex align="center" gap="2" mb="3">
              <Layers size={16} color="var(--iris-9)" />
              <Text size="2" weight="bold" color="gray" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Coleções ({collections.length})
              </Text>
            </Flex>

            <Flex direction="column" gap="1">
              {collections.map((col) => {
                const isSelected = selectedCollection === col
                return (
                  <Button
                    key={col}
                    variant={isSelected ? 'soft' : 'ghost'}
                    color={isSelected ? 'iris' : 'gray'}
                    size="2"
                    onClick={() => setSelectedCollection(col)}
                    style={{
                      justifyContent: 'flex-start',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: isSelected ? 600 : 400,
                    }}
                  >
                    <FileText size={15} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {col}
                    </span>
                  </Button>
                )
              })}
            </Flex>
          </Card>

          {/* Documents Content */}
          <Card size="2" style={{ border: '1px solid var(--gray-a4)', backgroundColor: 'var(--gray-a2)' }}>
            <Flex justify="between" align="center" gap="3" mb="4" wrap="wrap">
              <Box style={{ flex: 1, maxWidth: 320 }}>
                <TextField.Root
                  size="2"
                  placeholder="Filtrar registros JSON..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                >
                  <TextField.Slot>
                    <Search size={14} color="var(--gray-9)" />
                  </TextField.Slot>
                </TextField.Root>
              </Box>

              {documentsData && (
                <Badge size="1" variant="surface" color="gray" radius="full">
                  Total: {documentsData.total} registros
                </Badge>
              )}
            </Flex>

            {loadingDocs ? (
              <Flex justify="center" align="center" gap="2" py="8">
                <Spinner size="3" />
                <Text size="2" color="gray">
                  Carregando documentos da coleção <code>{selectedCollection}</code>...
                </Text>
              </Flex>
            ) : filteredDocs.length === 0 ? (
              <Box py="8" style={{ textAlign: 'center' }}>
                <Text size="2" color="gray">
                  Nenhum documento encontrado na coleção <strong>{selectedCollection}</strong>.
                </Text>
              </Box>
            ) : (
              <Flex direction="column" gap="3">
                {filteredDocs.map((doc: ExplorerDocument, index: number) => (
                  <Card
                    key={doc._id || index}
                    size="1"
                    style={{
                      backgroundColor: 'var(--gray-a3)',
                      border: '1px solid var(--gray-a4)',
                    }}
                  >
                    <Flex justify="between" align="center" pb="2" mb="2" style={{ borderBottom: '1px solid var(--gray-a4)' }}>
                      <Code size="1" color="cyan">
                        ID: {doc._id}
                      </Code>
                      <Text size="1" color="gray">
                        {new Date(doc.created_at).toLocaleString()}
                      </Text>
                    </Flex>
                    <ScrollArea type="auto" scrollbars="horizontal">
                      <pre
                        style={{
                          margin: 0,
                          fontSize: '0.8rem',
                          color: 'var(--gray-12)',
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                        }}
                      >
                        {JSON.stringify(doc.data, null, 2)}
                      </pre>
                    </ScrollArea>
                  </Card>
                ))}

                {documentsData && documentsData.total_pages > 1 && (
                  <Flex justify="center" align="center" gap="3" mt="3">
                    <Button
                      size="1"
                      variant="soft"
                      color="gray"
                      disabled={page <= 1}
                      onClick={() => selectedCollection && loadDocuments(selectedCollection, page - 1)}
                      style={{ cursor: page <= 1 ? 'not-allowed' : 'pointer' }}
                    >
                      <ChevronLeft size={14} />
                      Anterior
                    </Button>

                    <Text size="1" color="gray">
                      Página {page} de {documentsData.total_pages}
                    </Text>

                    <Button
                      size="1"
                      variant="soft"
                      color="gray"
                      disabled={page >= documentsData.total_pages}
                      onClick={() => selectedCollection && loadDocuments(selectedCollection, page + 1)}
                      style={{ cursor: page >= documentsData.total_pages ? 'not-allowed' : 'pointer' }}
                    >
                      Próxima
                      <ChevronRight size={14} />
                    </Button>
                  </Flex>
                )}
              </Flex>
            )}
          </Card>
        </Grid>
      )}
    </Box>
  )
}

