import type { CSSProperties } from 'react'

export const headerContainerStyle: CSSProperties = {
  textAlign: 'center',
  marginBottom: '24px'
}

export const iconContainerStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: 'var(--radius-3)',
  background: 'linear-gradient(135deg, var(--iris-9) 0%, var(--cyan-9) 100%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 4px 16px var(--iris-a6)'
}
