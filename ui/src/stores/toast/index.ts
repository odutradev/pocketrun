import { create } from 'zustand'

import type { ToastState, ToastItem, ToastType } from './types'

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],

  showToast: (message: string, type: ToastType = 'info', title?: string) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const newToast: ToastItem = { id, message, type, title }

    set((state) => ({ toasts: [...state.toasts, newToast] }))

    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id)
      }))
    }, 4000)
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id)
    }))
  }
}))

export default useToastStore
