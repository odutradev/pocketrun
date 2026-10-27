import apiClient from '@api/client'

import type { CreateTokenPayload, CreateTokenResponse } from './types'

export const createAPITokenAction = async (appId: string, payload: CreateTokenPayload): Promise<CreateTokenResponse> => {
  return apiClient.post<CreateTokenResponse>(`/apps/${appId}/tokens`, payload)
}

export const deleteAPITokenAction = async (appId: string, tokenId: string): Promise<void> => {
  return apiClient.del<void>(`/apps/${appId}/tokens/${tokenId}`)
}

export default {
  createAPITokenAction,
  deleteAPITokenAction
}
