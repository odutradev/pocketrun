import type { CSSProperties } from 'react'

export const appContainerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  minHeight: '100vh',
  background: 'radial-gradient(ellipse at top, #0f172a 0%, #020617 100%)',
  color: '#f8fafc',
  fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
}

export const mainContentStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2rem',
  flex: 1,
  width: '100%',
  maxWidth: '1024px',
  margin: '0 auto',
  padding: '2rem 1.5rem',
  boxSizing: 'border-box'
}

export const footerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem',
  borderTop: '1px solid rgba(255, 255, 255, 0.06)',
  fontSize: '0.85rem',
  color: '#64748b'
}
