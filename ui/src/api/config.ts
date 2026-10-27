export const API_BASE_URL = (
  import.meta.env.VITE_ADMIN_API_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8081'
).replace(/\/+$/, '')

export const STORAGE_KEYS = {
  TOKEN: 'pocketrun_manager_token',
  REFRESH_TOKEN: 'pocketrun_manager_refresh_token',
  USER: 'pocketrun_manager_user',
  SYSTEM_SETTINGS: 'pocketrun_system_settings'
} as const

export default {
  API_BASE_URL,
  STORAGE_KEYS
}
