import api from "@utils/api";

import type { ExplorerDocument, ExplorerQuery, Page } from "@utils/types/explorer";

export const listCollections = async (applicationId: string, signal?: AbortSignal) => {
  const response = await api.get<string[]>(`/apps/${applicationId}/explorer/collections`, { signal });
  return response.data;
};

export const listDocuments = async ({ applicationId, collection, page, limit }: ExplorerQuery, signal?: AbortSignal) => {
  const response = await api.get<Page<ExplorerDocument>>(
    `/apps/${applicationId}/explorer/collections/${encodeURIComponent(collection)}/documents`,
    { params: { page, limit }, signal }
  );
  return response.data;
};
