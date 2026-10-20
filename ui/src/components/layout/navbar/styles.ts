import type { CSSProperties } from 'react'

export const headerStyle: CSSProperties = {
  position: 'sticky',
  top: 0,
  zIndex: 50,
  backgroundColor: 'rgba(11, 13, 19, 0.8)',
  backdropFilter: 'blur(16px)',
  WebkitBackdropFilter: 'blur(16px)',
  borderBottom: '1px solid var(--gray-a3)'
}

export const innerContainerStyle: CSSProperties = {
  maxWidth: '1280px',
  margin: '0 auto',
  padding: '10px 24px'
}

export const logoIconStyle: CSSProperties = {
  width: 28,
  height: 28,
  borderRadius: 'var(--radius-2)',
  backgroundColor: 'var(--iris-a3)',
  border: '1px solid var(--iris-a4)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

export const statusBadgeStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '2px 8px'
}

export const userBadgeStyle: CSSProperties = {
  backgroundColor: 'var(--gray-a2)',
  border: '1px solid var(--gray-a4)',
  padding: '2px 10px',
  borderRadius: 'var(--radius-full)'
}

export const actionButtonStyle: CSSProperties = {
  cursor: 'pointer'
}

export default {
  headerStyle,
  innerContainerStyle,
  logoIconStyle,
  statusBadgeStyle,
  userBadgeStyle,
  actionButtonStyle
}
