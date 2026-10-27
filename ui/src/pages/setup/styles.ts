import type { CSSProperties } from 'react'

export const containerStyle: CSSProperties = {
  maxWidth: 420,
  margin: '0 auto',
  width: '100%',
  padding: '16px'
}

export const cardStyle: CSSProperties = {
  backgroundColor: 'var(--color-panel-translucent)',
  border: '1px solid var(--gray-a4)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: 'var(--shadow-4)'
}

export const cardContentStyle: CSSProperties = {
  padding: '30px 26px'
}

export default {
  containerStyle,
  cardStyle,
  cardContentStyle
}
