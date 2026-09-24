export const API_BASE_URL = '' // Uses relative path (proxied by Vite or Nginx)

export interface ManagerUser {
  id: string
  name: string
  email: string
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

export interface ExplorerDocumentsResponse {
  data: any[]
  total: number
  page: number
  limit: number
  total_pages: number
}

// Helper to construct headers with JWT
const getAuthHeaders = () => {
  const token = localStorage.getItem('pocketrun_manager_token')
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// Auth API Calls
export async function registerManager(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to register')
  return data
}

export async function loginManager(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to login')
  return data
}

export async function fetchManagerMe(): Promise<ManagerUser> {
  const res = await fetch(`${API_BASE_URL}/api/v1/auth/me`, {
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to fetch user')
  return data
}

// Applications API Calls
export async function fetchApplications(): Promise<Application[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/apps`, {
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to fetch applications')
  return data
}

export async function createApplication(payload: CreateAppPayload): Promise<CreateAppResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/apps`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to create application')
  return data
}

export async function updateApplication(appId: string, payload: Partial<CreateAppPayload>): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/v1/apps/${appId}`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to update application')
}

export async function deleteApplication(appId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/v1/apps/${appId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to delete application')
}

// Token Management API Calls
export async function createAPIToken(appId: string, payload: CreateTokenPayload): Promise<CreateTokenResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/apps/${appId}/tokens`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to create token')
  return data
}

export async function deleteAPIToken(appId: string, tokenId: string): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/v1/apps/${appId}/tokens/${tokenId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to revoke token')
}

// Data Explorer API Calls
export async function fetchExplorerCollections(appId: string): Promise<string[]> {
  const res = await fetch(`${API_BASE_URL}/api/v1/apps/${appId}/explorer/collections`, {
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to fetch collections')
  return data
}

export async function fetchExplorerDocuments(appId: string, collection: string, page = 1, limit = 20): Promise<ExplorerDocumentsResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/apps/${appId}/explorer/${collection}?page=${page}&limit=${limit}`, {
    headers: getAuthHeaders(),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Failed to fetch documents')
  return data
}

// Health Check API
export async function fetchHealthPing(): Promise<{ status: string }> {
  const res = await fetch(`${API_BASE_URL}/ping`)
  if (!res.ok) throw new Error('API offline')
  return res.json()
}
