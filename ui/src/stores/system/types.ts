export type ThemeAppearance = 'dark' | 'light'

export interface SystemSettings {
  theme: ThemeAppearance
}

export interface SystemState {
  settings: SystemSettings
  theme: ThemeAppearance
  isDarkMode: boolean
  setTheme: (theme: ThemeAppearance) => void
  toggleTheme: () => void
  updateSettings: (partial: Partial<SystemSettings>) => void
  resetSettings: () => void
}

