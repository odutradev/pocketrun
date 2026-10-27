import type { CSSProperties } from 'react'

export const backgroundStyle: CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: 'var(--app-bg, var(--color-background))',
  backgroundImage:
    'radial-gradient(ellipse 80% 50% at 50% -20%, var(--mint-a4), transparent)'
}

export const mainContentStyle: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column'
}

