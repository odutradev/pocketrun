import React, { useState } from 'react'
import type { Application } from '../services/api'
import { updateApplication, deleteApplication, deleteAPIToken } from '../services/api'
import { CreateTokenModal } from './CreateTokenModal'
import { DataExplorer } from './DataExplorer'
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
  Code,
  Copy,
  AlertTriangle
} from 'lucide-react'

interface AppDetailProps {
  app: Application
  onBack: () => void
  onRefreshApp: () => void
}

export const AppDetail: React.FC<AppDetailProps> = ({ app, onBack, onRefreshApp }) => {
  const [activeTab, setActiveTab] = useState<'security' | 'tokens' | 'explorer' | 'danger'>('security')
  const [originsInput, setOriginsInput] = useState<string>(app.allowed_origins.join(', '))
  const [allowNonBrowser, setAllowNonBrowser] = useState<boolean>(app.allow_non_browser_requests)
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean>(false)
  const [savingSettings, setSavingSettings] = useState<boolean>(false)
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState<string>('')
  const [deletingApp, setDeletingApp] = useState<boolean>(false)
  const [copiedSnippet, setCopiedSnippet] = useState<string | null>(null)

  const handleSaveSettings = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar configurações')
    } finally {
      setSavingSettings(false)
    }
  }

  const handleRevokeToken = async (tokenId: string) => {
    if (window.confirm('Tem certeza que deseja revogar este token de acesso? Os clientes que utilizam este token perderão o acesso imediatamente.')) {
      try {
        await deleteAPIToken(app.id, tokenId)
        onRefreshApp()
      } catch (err: any) {
        alert(err.message || 'Erro ao revogar token')
      }
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
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir aplicação')
      setDeletingApp(false)
    }
  }

  const copyCodeSnippet = (snippet: string, name: string) => {
    navigator.clipboard.writeText(snippet)
    setCopiedSnippet(name)
    setTimeout(() => setCopiedSnippet(null), 2000)
  }

  const sampleFetchCode = `// Exemplo no Frontend (React/Vue/Flutter)
const API_URL = "${window.location.origin}"
const TOKEN = "seu-token-aqui"

// Criar Registro na coleção "tarefas"
fetch(\`\${API_URL}/kv/tarefas/create\`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'controlAccess': TOKEN
  },
  body: JSON.stringify({
    data: { titulo: "Comprar Leite", concluida: false, prioridade: "alta" },
    expiresInDays: 30 // Opcional: auto-deletar após 30 dias
  })
})

// Buscar Registros com Filtro
fetch(\`\${API_URL}/kv/tarefas/get-all?concluida=false\`, {
  headers: { 'controlAccess': TOKEN }
})`

  return (
    <div>
      {/* Top Header Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <button onClick={onBack} className="btn-secondary" style={{ padding: '8px 14px', fontSize: '0.85rem' }}>
          <ArrowLeft size={16} />
          <span>Voltar às Aplicações</span>
        </button>

        <div className="badge badge-indigo">
          <span>Project ID: {app.project_id}</span>
        </div>
      </div>

      {/* Main App Title Banner */}
      <div className="glass-panel" style={{ padding: '24px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 20px var(--primary-glow)'
          }}>
            <Shield size={26} color="#FFF" />
          </div>
          <div>
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              {app.name}
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              {app.description || 'Nenhuma descrição fornecida.'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('security')}
          className="btn-secondary"
          style={{
            background: activeTab === 'security' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            borderColor: activeTab === 'security' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'security' ? '#FFF' : 'var(--text-muted)',
            fontWeight: 600,
          }}
        >
          <Globe size={16} />
          <span>Segurança & CORS</span>
        </button>

        <button
          onClick={() => setActiveTab('tokens')}
          className="btn-secondary"
          style={{
            background: activeTab === 'tokens' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            borderColor: activeTab === 'tokens' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'tokens' ? '#FFF' : 'var(--text-muted)',
            fontWeight: 600,
          }}
        >
          <Key size={16} />
          <span>Tokens de Acesso ({app.tokens?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab('explorer')}
          className="btn-secondary"
          style={{
            background: activeTab === 'explorer' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
            borderColor: activeTab === 'explorer' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'explorer' ? '#FFF' : 'var(--text-muted)',
            fontWeight: 600,
          }}
        >
          <Database size={16} />
          <span>Data Explorer</span>
        </button>

        <button
          onClick={() => setActiveTab('danger')}
          className="btn-secondary"
          style={{
            background: activeTab === 'danger' ? 'rgba(244, 63, 94, 0.15)' : 'transparent',
            borderColor: activeTab === 'danger' ? 'var(--accent-rose)' : 'transparent',
            color: activeTab === 'danger' ? 'var(--accent-rose)' : 'var(--text-muted)',
            fontWeight: 600,
            marginLeft: 'auto'
          }}
        >
          <AlertTriangle size={16} />
          <span>Zona de Risco</span>
        </button>
      </div>

      {/* Tab 1: Security & CORS Settings */}
      {activeTab === 'security' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
          <form onSubmit={handleSaveSettings} className="glass-panel" style={{ padding: '24px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '16px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Controle de Origens Autorizadas (CORS)
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Defina quais domínios web têm permissão para ler e gravar dados nesta aplicação através das chamadas de API.
            </p>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Origens Permitidas (Separe por vírgula)
              </label>
              <textarea
                value={originsInput}
                onChange={(e) => setOriginsInput(e.target.value)}
                className="input-field"
                rows={4}
                style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: '0.85rem' }}
                placeholder="https://meusite.com.br, http://localhost:3000 ou *"
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                Use <code>*</code> para aceitar qualquer origem durante o desenvolvimento.
              </p>
            </div>

            <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <input
                type="checkbox"
                id="nonBrowser"
                checked={allowNonBrowser}
                onChange={(e) => setAllowNonBrowser(e.target.checked)}
                style={{ width: '18px', height: '18px', accentColor: 'var(--primary)', cursor: 'pointer' }}
              />
              <label htmlFor="nonBrowser" style={{ fontSize: '0.85rem', color: 'var(--text-primary)', cursor: 'pointer' }}>
                Permitir requisições sem header <code>Origin</code> (Mobile nativo, Postman, server-to-server)
              </label>
            </div>

            <button type="submit" disabled={savingSettings} className="btn-primary" style={{ padding: '10px 20px' }}>
              {saveSuccess ? (
                <>
                  <Check size={16} />
                  <span>Configurações Salvas!</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>{savingSettings ? 'Salvando...' : 'Salvar Configurações'}</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Integration Code Snippet */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Code size={18} color="var(--secondary)" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Como Consumir a API
                </h3>
              </div>
              <button onClick={() => copyCodeSnippet(sampleFetchCode, 'fetch')} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                {copiedSnippet === 'fetch' ? <Check size={14} color="var(--accent-emerald)" /> : <Copy size={14} />}
                <span>{copiedSnippet === 'fetch' ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '16px', overflowX: 'auto' }}>
              <pre style={{ margin: 0, fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace', color: '#A5B4FC', whiteSpace: 'pre-wrap' }}>
                {sampleFetchCode}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Tokens Management */}
      {activeTab === 'tokens' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                Tokens de Acesso (API Keys)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                Tokens ativos para esta aplicação. Cada cliente utiliza seu próprio token no header <code>controlAccess</code>.
              </p>
            </div>

            <button onClick={() => setIsTokenModalOpen(true)} className="btn-primary">
              <Plus size={16} />
              <span>Gerar Novo Token</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {app.tokens && app.tokens.length > 0 ? (
              app.tokens.map((token) => (
                <div key={token.id} className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.12)', color: 'var(--secondary)' }}>
                      <Key size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1rem', fontWeight: 600 }}>{token.name}</h4>
                      <p style={{ fontSize: '0.8rem', fontFamily: 'JetBrains Mono, monospace', color: 'var(--text-muted)', marginTop: '2px' }}>
                        Prefixo: {token.token_prefix}
                      </p>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
                    <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      <div>Criado em: {new Date(token.created_at).toLocaleDateString()}</div>
                      <div>
                        Expira em:{' '}
                        {token.expires_at ? (
                          <span style={{ color: new Date(token.expires_at) < new Date() ? 'var(--accent-rose)' : 'var(--text-primary)' }}>
                            {new Date(token.expires_at).toLocaleDateString()}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--accent-emerald)' }}>Nunca</span>
                        )}
                      </div>
                    </div>

                    <button onClick={() => handleRevokeToken(token.id)} className="btn-danger">
                      <Trash2 size={14} />
                      <span>Revogar</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-panel" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                Nenhum token cadastrado para esta aplicação. Clique no botão acima para gerar um.
              </div>
            )}
          </div>

          <CreateTokenModal
            appId={app.id}
            isOpen={isTokenModalOpen}
            onClose={() => setIsTokenModalOpen(false)}
            onSuccess={() => {
              setIsTokenModalOpen(false)
              onRefreshApp()
            }}
          />
        </div>
      )}

      {/* Tab 3: Data Explorer */}
      {activeTab === 'explorer' && (
        <DataExplorer appId={app.id} projectName={app.name} />
      )}

      {/* Tab 4: Danger Zone */}
      {activeTab === 'danger' && (
        <div className="glass-panel" style={{ padding: '32px', borderColor: 'rgba(244, 63, 94, 0.3)', background: 'rgba(244, 63, 94, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--accent-rose)', marginBottom: '16px' }}>
            <AlertTriangle size={24} />
            <h3 style={{ fontSize: '1.3rem', fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Excluir Aplicação Definitivamente
            </h3>
          </div>

          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.6 }}>
            Esta ação é <strong>irreversível</strong>. A exclusão desta aplicação apagará permanentemente todos os <strong>Tokens de Acesso</strong> e <strong>TODOS OS REGISTROS</strong> gravados em todas as coleções deste projeto no banco de dados.
          </p>

          <div style={{ marginBottom: '20px', maxWidth: '400px' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
              Para confirmar, digite o Project ID (<code>{app.project_id}</code>):
            </label>
            <input
              type="text"
              placeholder={app.project_id}
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              className="input-field"
              style={{ borderColor: 'rgba(244, 63, 94, 0.4)' }}
            />
          </div>

          <button
            onClick={handleDeleteApplication}
            disabled={deletingApp || deleteConfirmText !== app.project_id}
            className="btn-danger"
            style={{ padding: '12px 24px', fontSize: '0.9rem' }}
          >
            <Trash2 size={16} />
            <span>{deletingApp ? 'Excluindo Aplicação...' : 'Excluir Aplicação e Dados'}</span>
          </button>
        </div>
      )}
    </div>
  )
}
