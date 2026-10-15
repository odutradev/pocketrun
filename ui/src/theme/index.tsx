import type { ReactNode } from 'react'
import { Theme } from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'

import { themeConfig } from './config'

export interface ThemeProviderProps {
  children: ReactNode
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  return (
    <Theme
      appearance={themeConfig.appearance}
      accentColor={themeConfig.accentColor}
      grayColor={themeConfig.grayColor}
      radius={themeConfig.radius}
      scaling={themeConfig.scaling}
    >
      {children}
    </Theme>
  )
}

export default ThemeProvider
