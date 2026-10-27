import apiClient from '@api/client'

import type { ProfileResponse } from './types'

export const getProfileAction = async (): Promise<ProfileResponse> => {
  return apiClient.get<ProfileResponse>('/auth/me')
}

export default {
  getProfileAction
}
