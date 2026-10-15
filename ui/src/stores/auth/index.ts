import { create } from 'zustand'

import { getProfileAction } from '@actions/users/profile'
import { STORAGE_KEYS } from '@api/config'

import type { ManagerUser } from '@projectTypes/user'
import type { AuthState } from './types'

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem(STORAGE_KEYS.TOKEN),
  isAuthenticated: Boolean(localStorage.getItem(STORAGE_KEYS.TOKEN)),
  isLoading: true,

  login: (token: string, user: ManagerUser) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
    set({
      token,
      user,
      isAuthenticated: true,
      isLoading: false
    })
  },

  register: (token: string, user: ManagerUser) => {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token)
    set({
      token,
      user,
      isAuthenticated: true,
      isLoading: false
    })
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEYS.TOKEN)
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isLoading: false
    })
  },

  initializeAuth: async () => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (!savedToken) {
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false
      })
      return
    }

    try {
      const profile = await getProfileAction()
      set({
        token: savedToken,
        user: profile,
        isAuthenticated: true,
        isLoading: false
      })
    } catch {
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false
      })
    }
  },

  refreshUser: async () => {
    const savedToken = localStorage.getItem(STORAGE_KEYS.TOKEN)
    if (!savedToken) {
      set({
        token: null,
        user: null,
        isAuthenticated: false,
        isLoading: false
      })
      return
    }

    try {
      const profile = await getProfileAction()
      set({
        user: profile,
        isAuthenticated: true
      })
    } catch {
      localStorage.removeItem(STORAGE_KEYS.TOKEN)
      set({
        token: null,
        user: null,
        isAuthenticated: false
      })
    }
  }
}))

export default useAuthStore
