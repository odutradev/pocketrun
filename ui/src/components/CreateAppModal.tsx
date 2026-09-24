import React, { useState } from 'react'
import { createApplication } from '../services/api'
import { X, Copy, Check, AlertCircle, Plus, Shield, Globe } from 'lucide-react'

interface CreateAppModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const CreateAppModal: React.FC<CreateAppModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState<string>('')
  const [projectId, setProjectId] = useState<string>('')
  const [description, setDescription] = useState<string>('')
  const [origins, setOrigins] = useState<string>('*')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)

  if (!isOpen) return null

  const handleNameChange = (val: string) => {
    setName(val)
    if (!projectId || projectId === name.toLowerCase().replace(/[^a-z0-9-]/g, '-')) {
      setProjectId(val.toLowerCase().trim().replace(/[^a-z0-9-]/g, '-'))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setError(err.message || 'Erro ao criar aplicação')
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
    <div className="modal-overlay" onClick={handleDone}>
      <div
        className="glass-panel"
        style={{ width: '100%', maxWidth: '520px', padding: '32px', position: 'relative' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleDone}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        {!createdToken ? (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)' }}>
                <Plus size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Nova Aplicação
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Configure os detalhes e as origens de acesso autorizadas.
                </p>
              </div>
            </div>

            {error && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.3)',
                borderRadius: 'var(--radius-md)',
                padding: '12px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: 'var(--accent-rose)',
                fontSize: '0.85rem'
              }}>
                <AlertCircle size={18} />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Nome da Aplicação
                </label>
                <input
                  type="text"
                  placeholder="ex: Meu E-Commerce, Blog Pessoal"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Project ID (Identificador Único)
                </label>
                <input
                  type="text"
                  placeholder="ex: meu-ecommerce-2026"
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-'))}
                  className="input-field"
                  required
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Usado no isolamento de dados do banco de dados.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Origens Permitidas (CORS)
                </label>
                <div style={{ position: 'relative' }}>
                  <Globe size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    placeholder="https://meusite.com, http://localhost:3000 ou *"
                    value={origins}
                    onChange={(e) => setOrigins(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '42px' }}
                  />
                </div>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Separe múltiplos domínios por vírgula. Use * para permitir qualquer origem.
                </p>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Descrição (Opcional)
                </label>
                <input
                  type="text"
                  placeholder="Aplicação web e mobile de pedidos..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                />
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '12px', padding: '12px' }}>
                {loading ? 'Criando Aplicação...' : 'Criar Aplicação'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '9999px',
              background: 'rgba(16, 185, 129, 0.15)',
              color: 'var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Shield size={28} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Aplicação Criada com Sucesso!
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Abaixo está o seu <strong>Token de Acesso (API Key)</strong>. Guarde-o em local seguro, pois ele <strong>não será exibido novamente</strong>!
            </p>

            <div style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border-color-glow)',
              borderRadius: 'var(--radius-md)',
              padding: '14px',
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: '0.9rem',
              color: '#34D399',
              wordBreak: 'break-all',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            }}>
              <span>{createdToken}</span>
              <button onClick={copyToClipboard} className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem', flexShrink: 0 }}>
                {copied ? <Check size={16} color="var(--accent-emerald)" /> : <Copy size={16} />}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>

            <button onClick={handleDone} className="btn-primary" style={{ width: '100%', padding: '12px' }}>
              Entendi e Salvei o Token
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
