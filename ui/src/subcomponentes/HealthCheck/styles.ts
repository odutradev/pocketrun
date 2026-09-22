import type { CSSProperties } from 'react'

export const cardStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.25rem',
  padding: '1.75rem',
  borderRadius: '1rem',
  background: 'rgba(30, 41, 59, 0.5)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
}

export const cardHeaderStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between'
}

export const cardTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#f8fafc'
}

export const statusRowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.75rem'
}

export const getBadgeStyle = (online: boolean): CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.375rem 0.875rem',
  borderRadius: '9999px',
  fontSize: '0.85rem',
  fontWeight: 600,
  color: online ? '#4ade80' : '#f87171',
  background: online ? 'rgba(74, 222, 128, 0.1)' : 'rgba(248, 113, 113, 0.1)',
  border: online ? '1px solid rgba(74, 222, 128, 0.25)' : '1px solid rgba(248, 113, 113, 0.25)'
})

export const dotStyle = (online: boolean): CSSProperties => ({
  width: '0.5rem',
  height: '0.5rem',
  borderRadius: '50%',
  background: online ? '#4ade80' : '#f87171',
  boxShadow: online ? '0 0 8px #4ade80' : '0 0 8px #f87171'
})

export const buttonStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  padding: '0.625rem 1.25rem',
  borderRadius: '0.5rem',
  border: 'none',
  background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
  color: '#ffffff',
  fontSize: '0.875rem',
  fontWeight: 600,
  cursor: 'pointer',
  transition: 'transform 0.15s ease, opacity 0.15s ease'
}

export const infoTextStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.85rem',
  color: '#94a3b8'
}
