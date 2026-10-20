import type { CSSProperties } from 'react'

export const containerStyle: CSSProperties = {
  maxWidth: 420,
  margin: '0 auto',
  width: '100%',
  padding: '16px'
}

export const cardStyle: CSSProperties = {
  backgroundColor: 'rgba(13, 16, 23, 0.75)',
  border: '1px solid var(--gray-a4)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.24)'
}

export const cardContentStyle: CSSProperties = {
  padding: '30px 26px'
}

export default {
  containerStyle,
  cardStyle,
  cardContentStyle
}
