import apiClient from '@api/client'

import type { ExplorerDocumentsResponse, GetExplorerDocumentsParams } from './types'

export const getExplorerCollectionsAction = async (appId: string): Promise<string[]> => {
  return apiClient.get<string[]>(`/api/v1/apps/${appId}/explorer/collections`)
}

export const getExplorerDocumentsAction = async ({
  appId,
  collection,
  page = 1,
  limit = 20
}: GetExplorerDocumentsParams): Promise<ExplorerDocumentsResponse> => {
  return apiClient.get<ExplorerDocumentsResponse>(
    `/api/v1/apps/${appId}/explorer/${collection}?page=${page}&limit=${limit}`
  )
}

export default {
  getExplorerCollectionsAction,
  getExplorerDocumentsAction
}
