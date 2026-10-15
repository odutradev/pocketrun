import { API_BASE_URL, STORAGE_KEYS } from '@api/config'

import type { ApiError } from '@projectTypes/api'

export interface RequestOptions extends RequestInit {
  skipAuth?: boolean
}

export const request = async <T>(endpoint: string, options: RequestOptions = {}): Promise<T> => {
  const { skipAuth = false, headers = {}, ...rest } = options
  const token = localStorage.getItem(STORAGE_KEYS.TOKEN)

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>)
  }

  if (!skipAuth && token) {
    requestHeaders.Authorization = `Bearer ${token}`
  }

  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders
  })

  let responseData: unknown = null
  const contentType = response.headers.get('content-type')
  if (contentType?.includes('application/json')) {
    responseData = await response.json()
  }

  if (!response.ok) {
    const errorBody = (responseData as { error?: string; message?: string } | null)
    const apiError: ApiError = {
      status: response.status,
      message: errorBody?.error || errorBody?.message || 'Request failed',
      details: responseData
    }
    throw apiError
  }

  return responseData as T
}

export const get = async <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
  return request<T>(endpoint, { ...options, method: 'GET' })
}

export const post = async <T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> => {
  return request<T>(endpoint, {
    ...options,
    method: 'POST',
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
}

export const put = async <T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> => {
  return request<T>(endpoint, {
    ...options,
    method: 'PUT',
    body: body !== undefined ? JSON.stringify(body) : undefined
  })
}

export const del = async <T>(endpoint: string, options?: RequestOptions): Promise<T> => {
  return request<T>(endpoint, { ...options, method: 'DELETE' })
}

export const apiClient = {
  request,
  get,
  post,
  put,
  delete: del,
  del
}

export default apiClient
