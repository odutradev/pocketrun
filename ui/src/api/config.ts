export const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080').replace(/\/+$/, '')

export const STORAGE_KEYS = {
  TOKEN: 'pocketrun_manager_token',
  REFRESH_TOKEN: 'pocketrun_manager_refresh_token',
  USER: 'pocketrun_manager_user'
} as const

export default {
  API_BASE_URL,
  STORAGE_KEYS
}
