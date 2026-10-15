import type { ManagerUser } from './user'

export interface APIToken {
  id: string
  name: string
  token_prefix: string
  expires_at?: string
  created_at: string
  last_used_at?: string
}

export interface Application {
  id: string
  manager_id: string
  name: string
  project_id: string
  description: string
  allowed_origins: string[]
  allow_non_browser_requests: boolean
  tokens?: APIToken[]
  created_at: string
  updated_at: string
}

export interface AuthResponse {
  token: string
  user: ManagerUser
}

export interface CreateAppPayload {
  name: string
  project_id: string
  description: string
  allowed_origins: string[]
  allow_non_browser_requests?: boolean
}

export interface CreateAppResponse {
  application: Application
  raw_token: string
}

export interface CreateTokenPayload {
  name: string
  validity_days: number
}

export interface CreateTokenResponse {
  token: APIToken
  raw_token: string
}

export interface ExplorerDocument {
  _id: string
  collection?: string
  project_id?: string
  data: Record<string, unknown>
  created_at: string
  updated_at?: string
}

export interface ExplorerDocumentsResponse {
  data: ExplorerDocument[]
  total: number
  page: number
  limit: number
  total_pages: number
}

export interface SetupStatusResponse {
  setup_required: boolean
  has_users: boolean
}

export interface SetupAdminPayload {
  name: string
  email: string
  password: string
}
