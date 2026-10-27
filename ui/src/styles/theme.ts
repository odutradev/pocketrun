import type { ThemeProps } from '@radix-ui/themes'

export const brandPalette = {
  50: '#F7FCFA',
  100: '#F7FDFA',
  200: '#E8F8F2',
  300: '#D0F3E5',
  400: '#AFEDD5',
  500: '#83E7C0',
  600: '#4AE1A7',
  700: '#00FF9D',
  800: '#1B8B60',
  900: '#12523A',
  950: '#0A281D'
} as const

export const themeConfig: ThemeProps = {
  appearance: 'dark',
  accentColor: 'mint',
  grayColor: 'sage',
  radius: 'medium',
  scaling: '100%'
}

export default themeConfig
