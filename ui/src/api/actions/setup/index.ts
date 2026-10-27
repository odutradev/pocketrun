import apiClient from '@api/client'

import type { SetupStatusResponse, SetupAdminPayload, AuthResponse } from './types'

export const getSetupStatusAction = async (): Promise<SetupStatusResponse> => {
  return apiClient.get<SetupStatusResponse>('/setup/status', { skipAuth: true })
}

export const setupSuperadminAction = async (payload: SetupAdminPayload): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>('/setup/admin', payload, { skipAuth: true })
}

export default {
  getSetupStatusAction,
  setupSuperadminAction
}
