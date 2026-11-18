import api from "@utils/api";

import type { ExplorerDocument, ExplorerQuery } from "@utils/types/explorer";
import type { Page } from "@utils/types/api";

export const listCollections = async (applicationId: string, signal?: AbortSignal) => {
  const response = await api.get<string[]>(`/apps/${applicationId}/explorer/collections/list`, { signal });
  return response.data;
};

export const listDocuments = async ({ applicationId, collection, page, limit }: ExplorerQuery, signal?: AbortSignal) => {
  const response = await api.get<Page<ExplorerDocument>>(
    `/apps/${applicationId}/explorer/collections/${encodeURIComponent(collection)}/documents/list`,
    { params: { page, limit }, signal }
  );
  return response.data;
};
