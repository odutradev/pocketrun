export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastItem {
  id: string
  type: ToastType
  message: string
  title?: string
}

export interface ToastState {
  toasts: ToastItem[]
  showToast: (message: string, type?: ToastType, title?: string) => void
  removeToast: (id: string) => void
}
