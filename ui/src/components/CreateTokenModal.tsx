import React, { useState } from 'react'
import { createAPIToken } from '../services/api'
import { X, Copy, Check, Key, AlertCircle } from 'lucide-react'

interface CreateTokenModalProps {
  appId: string
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const CreateTokenModal: React.FC<CreateTokenModalProps> = ({ appId, isOpen, onClose, onSuccess }) => {
  const [name, setName] = useState<string>('')
  const [validityDays, setValidityDays] = useState<number>(365)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [createdToken, setCreatedToken] = useState<string | null>(null)
  const [copied, setCopied] = useState<boolean>(false)

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
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
    } catch (err: any) {
      setError(err.message || 'Erro ao gerar token')
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
    <div className="modal-overlay" onClick={handleDone}>
      <div
        className="glass-panel"
        style={{ width: '100%', maxWidth: '480px', padding: '32px', position: 'relative' }}
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
              <div style={{ padding: '10px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: 'var(--secondary)' }}>
                <Key size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  Gerar Novo Token de Acesso
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Crie uma nova API Key com validade customizada.
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
                  Nome / Identificador do Token
                </label>
                <input
                  type="text"
                  placeholder="ex: App Mobile Flutter, Frontend Web"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
                  Validade do Token (em dias)
                </label>
                <select
                  value={validityDays}
                  onChange={(e) => setValidityDays(Number(e.target.value))}
                  className="input-field"
                >
                  <option value={30}>30 Dias</option>
                  <option value={90}>90 Dias</option>
                  <option value={180}>180 Dias</option>
                  <option value={365}>365 Dias (1 Ano)</option>
                  <option value={0}>Sem Expiração (Permanente)</option>
                </select>
              </div>

              <button type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', marginTop: '12px', padding: '12px' }}>
                {loading ? 'Gerando Token...' : 'Gerar Token'}
              </button>
            </form>
          </>
        ) : (
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: '56px',
              height: '56px',
              borderRadius: '9999px',
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <Key size={28} />
            </div>

            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '8px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
              Token Gerado!
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              Copie o token abaixo. Ele é exibido <strong>somente nesta tela</strong>.
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
              Concluído
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
