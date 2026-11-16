export interface ExplorerDocument {
  _id: string;
  appId: string;
  projectId: string;
  collectionName: string;
  data: Record<string, unknown>;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Page<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ExplorerQuery {
  applicationId: string;
  collection: string;
  page: number;
  limit: number;
}
