import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Server, User, LogOut, ShieldCheck, Database } from 'lucide-react'

interface NavbarProps {
  apiStatus: string
  onOpenAuth: () => void
}

export const Navbar: React.FC<NavbarProps> = ({ apiStatus, onOpenAuth }) => {
  const { user, logout } = useAuth()

  return (
    <header className="glass-panel" style={{ borderRadius: 0, borderTop: 0, borderLeft: 0, borderRight: 0, padding: '16px 32px', marginBottom: '24px' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px var(--primary-glow)'
          }}>
            <Database size={22} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'Plus Jakarta Sans, sans-serif', letterSpacing: '-0.5px' }}>
              PocketRun <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.2)', color: 'var(--primary)', border: '1px solid var(--border-color-glow)' }}>v2.0</span>
            </h1>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Multi-Tenant Key-Value Platform</p>
          </div>
        </div>

        {/* Right Section: API Status & User Auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Health Status Badge */}
          <div className={`badge ${apiStatus === 'online' ? 'badge-emerald' : apiStatus === 'offline' ? 'badge-amber' : 'badge-indigo'}`} style={{ gap: '6px' }}>
            <Server size={12} />
            <span>API {apiStatus}</span>
          </div>

          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid var(--border-color)',
                padding: '6px 14px',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem'
              }}>
                <ShieldCheck size={16} color="var(--primary)" />
                <span style={{ fontWeight: 600 }}>{user.name}</span>
              </div>
              <button onClick={logout} className="btn-secondary" style={{ padding: '8px 12px', fontSize: '0.85rem' }} title="Logout">
                <LogOut size={16} />
                <span>Sair</span>
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn-primary">
              <User size={16} />
              <span>Entrar como Gestor</span>
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
