import apiClient from '@api/client'

import type { SignInPayload, SignUpPayload, AuthResponse } from './types'

export const signInAction = async (payload: SignInPayload): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>('/auth/login', payload, { skipAuth: true })
}

export const signUpAction = async (payload: SignUpPayload): Promise<AuthResponse> => {
  return apiClient.post<AuthResponse>('/auth/register', payload, { skipAuth: true })
}

export default {
  signInAction,
  signUpAction
}
