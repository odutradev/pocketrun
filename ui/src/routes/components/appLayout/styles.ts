import type { CSSProperties } from 'react'

export const backgroundStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: '#0c101c',
  backgroundImage:
    'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(120, 119, 198, 0.15), rgba(255, 255, 255, 0))'
}

export const mainContentStyle: CSSProperties = {
  flex: 1
}

export const footerStyle: CSSProperties = {
  borderTop: '1px solid var(--gray-a4)',
  padding: '24px',
  textAlign: 'center',
  backgroundColor: 'rgba(11, 13, 19, 0.5)'
}
