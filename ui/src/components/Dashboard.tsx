import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import type { Application } from '../services/api'
import { fetchApplications } from '../services/api'
import { CreateAppModal } from './CreateAppModal'
import { AppDetail } from './AppDetail'
import { Plus, Database, Key, Shield, Layers, ArrowRight, RefreshCw, Sparkles } from 'lucide-react'

interface DashboardProps {
  onOpenAuth: () => void
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenAuth }) => {
  const { user } = useAuth()
  const [apps, setApps] = useState<Application[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedApp, setSelectedApp] = useState<Application | null>(null)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false)

  const loadApps = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await fetchApplications()
      setApps(data)
      // If an app is selected, refresh its object
      if (selectedApp) {
        const updated = data.find((a) => a.id === selectedApp.id)
        if (updated) setSelectedApp(updated)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadApps()
  }, [user])

  if (!user) {
    return (
      <div style={{ maxWidth: '960px', margin: '60px auto', padding: '0 20px', textAlign: 'center' }}>
        <div className="glass-panel" style={{ padding: '64px 32px' }}>
          <div style={{
            width: '72px',
            height: '72px',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 8px 32px var(--primary-glow)'
          }}>
            <Sparkles size={36} color="#FFF" />
          </div>

          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif', marginBottom: '16px' }}>
            PocketRun v2 — O Backend Genérico Multi-Tenant
          </h2>

          <p style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', maxWidth: '640px', margin: '0 auto 32px', lineHeight: 1.6 }}>
            Crie e gerencie aplicações, configure tokens de acesso com isolamento completo e controle os domínios de origem autorizados (CORS) para todos os seus projetos pessoais e protótipos.
          </p>

          <button onClick={onOpenAuth} className="btn-primary" style={{ padding: '14px 32px', fontSize: '1.05rem' }}>
            <Shield size={20} />
            <span>Entrar / Cadastrar como Gestor</span>
          </button>
        </div>
      </div>
    )
  }

  if (selectedApp) {
    return (
      <AppDetail
        app={selectedApp}
        onBack={() => setSelectedApp(null)}
        onRefreshApp={loadApps}
      />
    )
  }

  const totalTokens = apps.reduce((acc, app) => acc + (app.tokens?.length || 0), 0)

  return (
    <div>
      {/* Top Banner & Quick Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Painel do Gestor
          </h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Bem-vindo de volta, <strong>{user.name}</strong> ({user.email})
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={loadApps} className="btn-secondary" style={{ padding: '10px 16px' }}>
            <RefreshCw size={16} />
            <span>Atualizar</span>
          </button>
          <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
            <Plus size={18} />
            <span>Nova Aplicação</span>
          </button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '36px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Aplicações Ativas</span>
            <Layers size={20} color="var(--primary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {apps.length}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Tokens de Acesso Gerados</span>
            <Key size={20} color="var(--secondary)" />
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            {totalTokens}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: 'var(--text-secondary)', marginBottom: '12px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Isolamento por Projeto</span>
            <Shield size={20} color="var(--accent-emerald)" />
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-emerald)', marginTop: '8px' }}>
            Ativo & Seguro
          </div>
        </div>
      </div>

      {/* Applications Grid Header */}
      <div style={{ marginBottom: '20px' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
          Suas Aplicações ({apps.length})
        </h3>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)' }}>
          Carregando aplicações...
        </div>
      ) : apps.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '56px 24px' }}>
          <Database size={48} color="var(--text-muted)" style={{ marginBottom: '16px' }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '8px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
            Nenhuma aplicação criada ainda
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', maxWidth: '440px', margin: '0 auto 24px' }}>
            Crie sua primeira aplicação para receber um Project ID e Token de Acesso exclusivo com isolamento no banco de dados.
          </p>
          <button onClick={() => setIsCreateModalOpen(true)} className="btn-primary">
            <Plus size={18} />
            <span>Criar Primeira Aplicação</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {apps.map((app) => (
            <div
              key={app.id}
              className="glass-panel glass-panel-hover"
              style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', cursor: 'pointer' }}
              onClick={() => setSelectedApp(app)}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div className="badge badge-indigo">
                    <span>{app.project_id}</span>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(app.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '6px', fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
                  {app.name}
                </h4>

                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {app.description || 'Sem descrição.'}
                </p>
              </div>

              <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>🔑 {app.tokens?.length || 0} Tokens</span>
                  <span>🌐 {app.allowed_origins.includes('*') ? 'Qualquer Origem' : `${app.allowed_origins.length} Origens`}</span>
                </div>

                <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
                  <span>Gerenciar</span>
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Application Modal */}
      <CreateAppModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={() => {
          setIsCreateModalOpen(false)
          loadApps()
        }}
      />
    </div>
  )
}
