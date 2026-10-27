import apiClient from '@api/client'

import type { Application, CreateAppPayload, CreateAppResponse, UpdateAppPayload } from './types'

export const getApplicationsAction = async (): Promise<Application[]> => {
  return apiClient.get<Application[]>('/apps')
}

export const createApplicationAction = async (payload: CreateAppPayload): Promise<CreateAppResponse> => {
  return apiClient.post<CreateAppResponse>('/apps', payload)
}

export const updateApplicationAction = async (appId: string, payload: UpdateAppPayload): Promise<void> => {
  return apiClient.put<void>(`/apps/${appId}`, payload)
}

export const deleteApplicationAction = async (appId: string): Promise<void> => {
  return apiClient.del<void>(`/apps/${appId}`)
}

export default {
  getApplicationsAction,
  createApplicationAction,
  updateApplicationAction,
  deleteApplicationAction
}
