import apiClient from '@api/client'

import type { HealthPingResponse } from './types'

export const healthPingAction = async (): Promise<HealthPingResponse> => {
  return apiClient.get<HealthPingResponse>('/ping', { skipAuth: true })
}

export default {
  healthPingAction
}
