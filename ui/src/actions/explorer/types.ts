import type { ExplorerDocument, ExplorerDocumentsResponse } from '@projectTypes/application'

export interface GetExplorerDocumentsParams {
  appId: string
  collection: string
  page?: number
  limit?: number
}

export type { ExplorerDocument, ExplorerDocumentsResponse }
