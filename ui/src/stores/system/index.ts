import { create } from 'zustand'

import { STORAGE_KEYS } from '@api/config'

import type { SystemSettings, ThemeAppearance, SystemState } from './types'

const DEFAULT_SETTINGS: SystemSettings = {
  theme: 'dark'
}

const applyDocumentTheme = (theme: ThemeAppearance) => {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  root.classList.remove('light', 'dark', 'light-theme', 'dark-theme')
  root.classList.add(theme, `${theme}-theme`)
  root.setAttribute('data-theme', theme)
}

const loadStoredSettings = (): SystemSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SYSTEM_SETTINGS)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw) as Partial<SystemSettings>
    const resolvedTheme: ThemeAppearance = parsed.theme === 'light' ? 'light' : 'dark'
    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      theme: resolvedTheme
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

const persistSettings = (settings: SystemSettings) => {
  localStorage.setItem(STORAGE_KEYS.SYSTEM_SETTINGS, JSON.stringify(settings))
  applyDocumentTheme(settings.theme)
}

const initialSettings = loadStoredSettings()
applyDocumentTheme(initialSettings.theme)

export const useSystemStore = create<SystemState>((set) => ({
  settings: initialSettings,
  theme: initialSettings.theme,
  isDarkMode: initialSettings.theme === 'dark',

  setTheme: (theme: ThemeAppearance) => {
    set((state) => {
      const nextSettings: SystemSettings = {
        ...state.settings,
        theme
      }
      persistSettings(nextSettings)
      return {
        settings: nextSettings,
        theme,
        isDarkMode: theme === 'dark'
      }
    })
  },

  toggleTheme: () => {
    set((state) => {
      const nextTheme: ThemeAppearance = state.theme === 'dark' ? 'light' : 'dark'
      const nextSettings: SystemSettings = {
        ...state.settings,
        theme: nextTheme
      }
      persistSettings(nextSettings)
      return {
        settings: nextSettings,
        theme: nextTheme,
        isDarkMode: nextTheme === 'dark'
      }
    })
  },

  updateSettings: (partial: Partial<SystemSettings>) => {
    set((state) => {
      const nextSettings: SystemSettings = {
        ...state.settings,
        ...partial
      }
      persistSettings(nextSettings)
      return {
        settings: nextSettings,
        theme: nextSettings.theme,
        isDarkMode: nextSettings.theme === 'dark'
      }
    })
  },

  resetSettings: () => {
    persistSettings(DEFAULT_SETTINGS)
    set({
      settings: DEFAULT_SETTINGS,
      theme: DEFAULT_SETTINGS.theme,
      isDarkMode: DEFAULT_SETTINGS.theme === 'dark'
    })
  }
}))

export default useSystemStore

