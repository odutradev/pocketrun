import type { CSSProperties } from 'react'

export const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1.25rem 2rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  background: 'rgba(15, 23, 42, 0.6)',
  backdropFilter: 'blur(12px)'
}

export const brandGroupStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '1rem'
}

export const logoBadgeStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '2.5rem',
  height: '2.5rem',
  borderRadius: '0.75rem',
  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
  color: '#ffffff',
  fontWeight: 700,
  fontSize: '1.25rem',
  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)'
}

export const titleGroupStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column'
}

export const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: '1.25rem',
  fontWeight: 700,
  color: '#f8fafc',
  letterSpacing: '-0.02em'
}

export const subtitleStyle: CSSProperties = {
  margin: 0,
  fontSize: '0.85rem',
  color: '#94a3b8'
}

export const versionBadgeStyle: CSSProperties = {
  padding: '0.25rem 0.75rem',
  borderRadius: '9999px',
  fontSize: '0.75rem',
  fontWeight: 600,
  color: '#818cf8',
  background: 'rgba(99, 102, 241, 0.1)',
  border: '1px solid rgba(99, 102, 241, 0.2)'
}
