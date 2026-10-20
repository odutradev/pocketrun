import type { CSSProperties } from 'react'

export const headerContainerStyle: CSSProperties = {
  textAlign: 'center',
  marginBottom: '20px'
}

export const iconContainerStyle: CSSProperties = {
  width: 40,
  height: 40,
  borderRadius: 'var(--radius-3)',
  backgroundColor: 'var(--iris-a3)',
  border: '1px solid var(--iris-a5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

export default {
  headerContainerStyle,
  iconContainerStyle
}
