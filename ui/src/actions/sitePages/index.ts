import api from "@utils/api";

import type {
  AnalyticsRange,
  LinkAnalytics,
  LinkGroupValues,
  LinkHistoryParams,
  PageGroup,
  PageHistoryPage,
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

export const getPageAnalytics = async (pageId: string, range: AnalyticsRange, signal?: AbortSignal) => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await api.get<LinkAnalytics>(`/pages/${pageId}/analytics/details`, { params: { range, tz }, signal });
  return response.data;
};
