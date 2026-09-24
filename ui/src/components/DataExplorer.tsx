import React, { useState, useEffect } from 'react'
import type { ExplorerDocumentsResponse } from '../services/api'
import { fetchExplorerCollections, fetchExplorerDocuments } from '../services/api'
import { Database, RefreshCw, Layers, ChevronLeft, ChevronRight, FileText, Search } from 'lucide-react'

interface DataExplorerProps {
  appId: string
  projectName: string
}

export const DataExplorer: React.FC<DataExplorerProps> = ({ appId, projectName }) => {
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
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Data Explorer — {projectName}
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Navegue e inspecione os dados gravados pelas aplicações nas coleções.
          </p>
        </div>
        <button onClick={loadCollections} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.8rem' }}>
          <RefreshCw size={14} />
          <span>Atualizar</span>
        </button>
      </div>

      {loadingCols ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
          Carregando coleções do projeto...
        </div>
      ) : collections.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '48px 24px' }}>
          <Database size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>Nenhuma Coleção Encontrada</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 16px' }}>
            Esta aplicação ainda não enviou dados para o PocketRun. Quando seu frontend fizer requisições para <code>POST /kv/:collection/create</code>, as coleções aparecerão aqui automaticamente!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '240px 1fr', gap: '20px' }}>
          {/* Sidebar Collections List */}
          <div className="glass-panel" style={{ padding: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              <Layers size={16} color="var(--primary)" />
              <span>Coleções ({collections.length})</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {collections.map((col) => (
                <button
                  key={col}
                  onClick={() => setSelectedCollection(col)}
                  style={{
                    padding: '10px 12px',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid',
                    borderColor: selectedCollection === col ? 'var(--primary-glow)' : 'transparent',
                    background: selectedCollection === col ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    color: selectedCollection === col ? '#818CF8' : 'var(--text-primary)',
                    textAlign: 'left',
                    fontSize: '0.85rem',
                    fontWeight: selectedCollection === col ? 600 : 400,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <FileText size={16} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{col}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Documents Table / View */}
          <div className="glass-panel" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', gap: '12px' }}>
              <div style={{ position: 'relative', flex: 1, maxWidth: '320px' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="Filtrar registros JSON..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field"
                  style={{ paddingLeft: '36px', padding: '8px 12px 8px 36px', fontSize: '0.85rem' }}
                />
              </div>

              {documentsData && (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Total: <strong>{documentsData.total}</strong> registros
                </div>
              )}
            </div>

            {loadingDocs ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                Carregando documentos da coleção <code>{selectedCollection}</code>...
              </div>
            ) : filteredDocs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Nenhum documento encontrado na coleção <strong>{selectedCollection}</strong>.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {filteredDocs.map((doc: any, index: number) => (
                  <div
                    key={doc._id || index}
                    style={{
                      background: 'var(--bg-input)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      padding: '14px',
                      fontSize: '0.85rem',
                      fontFamily: 'JetBrains Mono, monospace',
                      overflowX: 'auto'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px' }}>
                      <span style={{ color: 'var(--secondary)', fontSize: '0.75rem' }}>ID: {doc._id}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                        Criado em: {new Date(doc.created_at).toLocaleString()}
                      </span>
                    </div>
                    <pre style={{ margin: 0, color: '#E2E8F0', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>
                      {JSON.stringify(doc.data, null, 2)}
                    </pre>
                  </div>
                ))}

                {/* Pagination Controls */}
                {documentsData && documentsData.total_pages > 1 && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', marginTop: '16px' }}>
                    <button
                      disabled={page <= 1}
                      onClick={() => selectedCollection && loadDocuments(selectedCollection, page - 1)}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      <ChevronLeft size={16} />
                      <span>Anterior</span>
                    </button>

                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      Página {page} de {documentsData.total_pages}
                    </span>

                    <button
                      disabled={page >= documentsData.total_pages}
                      onClick={() => selectedCollection && loadDocuments(selectedCollection, page + 1)}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                    >
                      <span>Próxima</span>
                      <ChevronRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
