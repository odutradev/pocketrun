import { API_BASE_URL, STORAGE_KEYS } from './config'

export interface ManagerUser {
  id: string
  name: string
  email: string
  role?: string
  created_at: string
}

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

const getAuthHeaders = () => {
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN)
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  }
}

export const registerManager = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to register')
  return data
}

export const loginManager = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to login')
  return data
}

export const fetchManagerMe = async (): Promise<ManagerUser> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    headers: getAuthHeaders()
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to fetch user')
  return data
}

export const fetchApplications = async (): Promise<Application[]> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/apps`, {
    headers: getAuthHeaders()
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to fetch applications')
  return data
}

export const createApplication = async (payload: CreateAppPayload): Promise<CreateAppResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/apps`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to create application')
  return data
}

export const updateApplication = async (appId: string, payload: Partial<CreateAppPayload>): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/apps/${appId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to update application')
}

export const deleteApplication = async (appId: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/apps/${appId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to delete application')
}

export const createAPIToken = async (appId: string, payload: CreateTokenPayload): Promise<CreateTokenResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/apps/${appId}/tokens`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to create token')
  return data
}

export const deleteAPIToken = async (appId: string, tokenId: string): Promise<void> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/apps/${appId}/tokens/${tokenId}`, {
    method: 'DELETE',
    headers: getAuthHeaders()
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to revoke token')
}

export const fetchExplorerCollections = async (appId: string): Promise<string[]> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/apps/${appId}/explorer/collections`, {
    headers: getAuthHeaders()
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to fetch collections')
  return data
}

export const fetchExplorerDocuments = async (
  appId: string,
  collection: string,
  page = 1,
  limit = 20
): Promise<ExplorerDocumentsResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/apps/${appId}/explorer/${collection}?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders()
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to fetch documents')
  return data
}

export const fetchHealthPing = async (): Promise<{ status: string }> => {
  const res = await fetch(`${API_BASE_URL}/ping`)
  if (!res.ok) throw new Error('API offline')
  return res.json()
}

export const fetchSetupStatus = async (): Promise<SetupStatusResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/setup/status`)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to check setup status')
  return data
}

export const setupSuperadmin = async (payload: SetupAdminPayload): Promise<AuthResponse> => {
  const res = await fetch(`${API_BASE_URL}/api/v1/setup/admin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to initialize superadmin')
  return data
}
