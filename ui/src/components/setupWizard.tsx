import { useState, useId } from 'react'
import { ShieldCheck, Lock, Mail, User as UserIcon, CheckCircle2, AlertCircle, Sparkles, ArrowRight } from 'lucide-react'

import { setupSuperadmin } from '../services/api'
import { useAuth } from '../context/authContext'

import type { FormEvent } from 'react'

interface SetupWizardProps {
  onSuccess: () => void
}

export const SetupWizard = ({ onSuccess }: SetupWizardProps) => {
  const nameId = useId()
  const emailId = useId()
  const passwordId = useId()
  const confirmPasswordId = useId()

  const { login } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const isMinLength = password.length >= 8
  const hasLetter = /[a-zA-Z]/.test(password)
  const hasNumberOrSymbol = /[\d!@#$%^&*(),.?":{}|<>]/.test(password)
  const passwordsMatch = password.length > 0 && password === confirmPassword

  const isFormValid = name.trim().length >= 2 && email.includes('@') && isMinLength && hasLetter && hasNumberOrSymbol && passwordsMatch

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!passwordsMatch) {
      setError('As senhas digitadas não coincidem.')
      return
    }

    if (!isMinLength || !hasLetter || !hasNumberOrSymbol) {
      setError('A senha não cumpre os requisitos de segurança.')
      return
    }

    setLoading(true)
    try {
      const res = await setupSuperadmin({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      })

      login(res.token, res.user)
      onSuccess()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Falha ao inicializar o superadmin')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: '80vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 16px',
    }}>
      <div
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          padding: '40px',
          borderRadius: 'var(--radius-xl)',
          position: 'relative',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(99, 102, 241, 0.15)',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px var(--primary-glow)',
          }}>
            <ShieldCheck size={28} color="#FFF" />
          </div>
          <div>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: 'var(--secondary)',
              background: 'rgba(6, 182, 212, 0.1)',
              padding: '2px 8px',
              borderRadius: '999px',
              marginBottom: '4px',
            }}>
              <Sparkles size={12} /> Primeiro Acesso • Modo Setup
            </span>
            <h1 style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              fontFamily: 'Plus Jakarta Sans, sans-serif',
              letterSpacing: '-0.02em',
            }}>
              Configuração Inicial do PocketRun
            </h1>
          </div>
        </div>

        <p style={{
          fontSize: '0.9rem',
          color: 'var(--text-secondary)',
          marginBottom: '20px',
          lineHeight: 1.5,
        }}>
          Nenhum administrador detectado no banco de dados. Defina as credenciais do <strong>Super Administrador</strong> para ativar a segurança do sistema.
        </p>

        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          border: '1px solid rgba(99, 102, 241, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '12px 16px',
          marginBottom: '24px',
          fontSize: '0.82rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-start',
        }}>
          <ShieldCheck size={18} style={{ color: 'var(--primary)', flexShrink: 0, marginTop: '2px' }} />
          <span>
            <strong>Proteção ativa:</strong> Após esta etapa, o modo de configuração será permanentemente desativado e o registro público ficará bloqueado.
          </span>
        </div>

        {error && (
          <div style={{
            background: 'rgba(244, 63, 94, 0.1)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: 'var(--accent-rose)',
            fontSize: '0.85rem',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label htmlFor={nameId} style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Nome do Super Administrador
            </label>
            <div style={{ position: 'relative' }}>
              <UserIcon size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id={nameId}
                type="text"
                placeholder="Ex: Administrador PocketRun"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '42px', width: '100%' }}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor={emailId} style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              E-mail Principal
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id={emailId}
                type="email"
                placeholder="admin@seudominio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '42px', width: '100%' }}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor={passwordId} style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Senha Mestra (Mínimo 8 caracteres)
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id={passwordId}
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '42px', width: '100%' }}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor={confirmPasswordId} style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>
              Confirmar Senha Mestra
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                id={confirmPasswordId}
                type="password"
                placeholder="••••••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="input-field"
                style={{ paddingLeft: '42px', width: '100%' }}
                required
              />
            </div>
          </div>

          {/* Password requirements indicators */}
          <div style={{
            background: 'var(--bg-input)',
            borderRadius: 'var(--radius-md)',
            padding: '12px 14px',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '8px',
            fontSize: '0.78rem',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: isMinLength ? 'var(--accent-emerald)' : 'var(--text-muted)',
            }}>
              <CheckCircle2 size={14} />
              <span>8+ caracteres</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: hasLetter ? 'var(--accent-emerald)' : 'var(--text-muted)',
            }}>
              <CheckCircle2 size={14} />
              <span>Contém letras</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: hasNumberOrSymbol ? 'var(--accent-emerald)' : 'var(--text-muted)',
            }}>
              <CheckCircle2 size={14} />
              <span>Número ou símbolo</span>
            </div>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: passwordsMatch ? 'var(--accent-emerald)' : 'var(--text-muted)',
            }}>
              <CheckCircle2 size={14} />
              <span>Senhas conferem</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !isFormValid}
            className="btn-primary"
            style={{
              width: '100%',
              marginTop: '10px',
              padding: '14px',
              fontSize: '0.95rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: !isFormValid ? 0.6 : 1,
              cursor: !isFormValid ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? (
              'Inicializando Superadmin...'
            ) : (
              <>
                Concluir Configuração e Entrar
                <ArrowRight size={18} />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
