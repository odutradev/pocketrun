import api from "@utils/api";

import type {
  AnalyticsRange,
  LinkAnalytics,
  LinkGroupValues,
  LinkHistoryParams,
  PageAccess,
  PageAccessIssued,
  PageAccessKeyPayload,
  PageAccessRevealed,
  PageConfig,
  PageConfigApplied,
  PageConfigPayload,
  PageGroup,
  PageHistoryPage,
  PageKvDetails,
  PageKvPayload,
  PageKvPreviewCall,
  PageKvPreviewResult,
  PageKvRequestSummary,
  PageListParams,
  PagePayload,
  PageSummary,
  PageVersion,
  PagesOverview,
  SitePage,
  SlugAvailability
} from "@utils/types/sitePage";
import type { MessageResponse, Page } from "@utils/types/api";

export const listPages = async (params: PageListParams, signal?: AbortSignal) => {
  const response = await api.get<Page<SitePage>>("/pages/list", { params, signal });
  return response.data;
};

export const getPageSummary = async (signal?: AbortSignal) => {
  const response = await api.get<PageSummary>("/pages/summary/details", { signal });
  return response.data;
};

export const getPagesOverview = async (range: AnalyticsRange, signal?: AbortSignal) => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await api.get<PagesOverview>("/pages/analytics/details", { params: { range, tz }, signal });
  return response.data;
};

export const getPage = async (pageId: string, signal?: AbortSignal) => {
  const response = await api.get<SitePage>(`/pages/${pageId}/details`, { signal });
  return response.data;
};

export const checkPageSlug = async (slug: string, pageId?: string, signal?: AbortSignal) => {
  const response = await api.get<SlugAvailability>("/pages/slug-availability/check", { params: { slug, pageId }, signal });
  return response.data;
};

export const createPage = async (data: PagePayload) => {
  const response = await api.post<SitePage>("/pages/create", data);
  return response.data;
};

export const updatePage = async (pageId: string, data: PagePayload) => {
  const response = await api.patch<SitePage>(`/pages/${pageId}/update`, data);
  return response.data;
};

export const setPageStatus = async (pageId: string, isActive: boolean) => {
  const response = await api.patch<SitePage>(`/pages/${pageId}/status/set`, { isActive });
  return response.data;
};

export const deletePage = async (pageId: string) => {
  const response = await api.delete<MessageResponse>(`/pages/${pageId}/delete`);
  return response.data;
};

export const listPageGroups = async (signal?: AbortSignal) => {
  const response = await api.get<PageGroup[]>("/pages/groups/list", { signal });
  return response.data;
};

export const createPageGroup = async (data: LinkGroupValues) => {
  const response = await api.post<PageGroup>("/pages/groups/create", data);
  return response.data;
};

export const updatePageGroup = async (groupId: string, data: LinkGroupValues) => {
  const response = await api.patch<PageGroup>(`/pages/groups/${groupId}/update`, data);
  return response.data;
};

export const deletePageGroup = async (groupId: string) => {
  const response = await api.delete<MessageResponse>(`/pages/groups/${groupId}/delete`);
  return response.data;
};

export const getPageHistory = async (pageId: string, params: LinkHistoryParams, signal?: AbortSignal) => {
  const response = await api.get<PageHistoryPage>(`/pages/${pageId}/history/list`, { params, signal });
  return response.data;
};

export const listPageVersions = async (pageId: string, signal?: AbortSignal) => {
  const response = await api.get<PageVersion[]>(`/pages/${pageId}/versions/list`, { signal });
  return response.data;
};

export const getPageVersion = async (pageId: string, number: number, signal?: AbortSignal) => {
  const response = await api.get<PageVersion>(`/pages/${pageId}/versions/${number}/details`, { signal });
  return response.data;
};

export const getPageKv = async (pageId: string, signal?: AbortSignal) => {
  const response = await api.get<PageKvDetails>(`/pages/${pageId}/kv/details`, { signal });
  return response.data;
};

export const enablePageKv = async (pageId: string) => {
  const response = await api.post<PageKvDetails>(`/pages/${pageId}/kv/enable`);
  return response.data;
};

export const setPageKv = async (pageId: string, data: PageKvPayload) => {
  const response = await api.patch<PageKvDetails>(`/pages/${pageId}/kv/set`, data);
  return response.data;
};

export const removePageKv = async (pageId: string) => {
  const response = await api.delete<MessageResponse>(`/pages/${pageId}/kv/remove`);
  return response.data;
};

export const listPageKvRequests = async (pageId: string, signal?: AbortSignal) => {
  const response = await api.get<PageKvRequestSummary>(`/pages/${pageId}/kv/requests/list`, { signal });
  return response.data;
};

export const runPageKvPreview = async (pageId: string, call: PageKvPreviewCall): Promise<PageKvPreviewResult> => {
  const params = new URLSearchParams(call.query);
  params.set("as", call.as);
  const response = await api.request<unknown>({
    url: `/pages/${pageId}/kv/preview/${call.path}`,
    method: call.method,
    params,
    data: call.body,
    validateStatus: () => true
  });
  return { status: response.status, data: response.data };
};

export const getPageAccess = async (pageId: string, signal?: AbortSignal) => {
  const response = await api.get<PageAccess>(`/pages/${pageId}/access/details`, { signal });
  return response.data;
};

export const setPageAccessEnabled = async (pageId: string, isEnabled: boolean) => {
  const response = await api.patch<PageAccess>(`/pages/${pageId}/access/status/set`, { isEnabled });
  return response.data;
};

export const setPageAccessSessionHours = async (pageId: string, sessionHours: number) => {
  const response = await api.patch<PageAccess>(`/pages/${pageId}/access/session/set`, { sessionHours });
  return response.data;
};

export const revokePageAccessSessions = async (pageId: string) => {
  const response = await api.post<PageAccess>(`/pages/${pageId}/access/sessions/revoke`);
  return response.data;
};

export const createPageAccessKey = async (pageId: string, data: PageAccessKeyPayload) => {
  const response = await api.post<PageAccessIssued>(`/pages/${pageId}/access/keys/create`, data);
  return response.data;
};

export const renamePageAccessKey = async (pageId: string, keyId: string, role: string) => {
  const response = await api.patch<PageAccess>(`/pages/${pageId}/access/keys/${keyId}/update`, { role });
  return response.data;
};

export const resetPageAccessPin = async (pageId: string, keyId: string, pin: string) => {
  const response = await api.post<PageAccessIssued>(`/pages/${pageId}/access/keys/${keyId}/pin/reset`, { pin });
  return response.data;
};

export const revealPageAccessPin = async (pageId: string, keyId: string) => {
  const response = await api.get<PageAccessRevealed>(`/pages/${pageId}/access/keys/${keyId}/pin/reveal`);
  return response.data;
};

export const removePageAccessKey = async (pageId: string, keyId: string) => {
  const response = await api.delete<PageAccess>(`/pages/${pageId}/access/keys/${keyId}/remove`);
  return response.data;
};

export const getPageAnalytics = async (pageId: string, range: AnalyticsRange, signal?: AbortSignal) => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await api.get<LinkAnalytics>(`/pages/${pageId}/analytics/details`, { params: { range, tz }, signal });
  return response.data;
};

export const exportPageConfig = async (pageId: string, signal?: AbortSignal) => {
  const response = await api.get<PageConfig>(`/pages/${pageId}/config/export`, { signal });
  return response.data;
};

export const applyPageConfig = async (pageId: string, data: PageConfigPayload) => {
  const response = await api.post<PageConfigApplied>(`/pages/${pageId}/config/apply`, data);
  return response.data;
};
