import api from "@utils/api";

import type { AnalyticsRange, Link, LinkAnalytics, LinkGroup, LinkGroupValues, LinkHistoryPage, LinkPayload, SlugAvailability } from "@utils/types/link";
import type { MessageResponse } from "@utils/types/api";

export const listLinks = async (signal?: AbortSignal) => {
  const response = await api.get<Link[]>("/links/list", { signal });
  return response.data;
};

export const getLink = async (linkId: string, signal?: AbortSignal) => {
  const response = await api.get<Link>(`/links/${linkId}/details`, { signal });
  return response.data;
};

export const checkLinkSlug = async (slug: string, linkId?: string, signal?: AbortSignal) => {
  const response = await api.get<SlugAvailability>("/links/slug-availability/check", { params: { slug, linkId }, signal });
  return response.data;
};

export const createLink = async (data: LinkPayload) => {
  const response = await api.post<Link>("/links/create", data);
  return response.data;
};

export const updateLink = async (linkId: string, data: LinkPayload) => {
  const response = await api.patch<Link>(`/links/${linkId}/update`, data);
  return response.data;
};

export const deleteLink = async (linkId: string) => {
  const response = await api.delete<MessageResponse>(`/links/${linkId}/delete`);
  return response.data;
};

export const listLinkGroups = async (signal?: AbortSignal) => {
  const response = await api.get<LinkGroup[]>("/links/groups/list", { signal });
  return response.data;
};

export const createLinkGroup = async (data: LinkGroupValues) => {
  const response = await api.post<LinkGroup>("/links/groups/create", data);
  return response.data;
};

export const updateLinkGroup = async (groupId: string, data: LinkGroupValues) => {
  const response = await api.patch<MessageResponse>(`/links/groups/${groupId}/update`, data);
  return response.data;
};

export const deleteLinkGroup = async (groupId: string) => {
  const response = await api.delete<MessageResponse>(`/links/groups/${groupId}/delete`);
  return response.data;
};

export const getLinkHistory = async (linkId: string, before?: string, signal?: AbortSignal) => {
  const response = await api.get<LinkHistoryPage>(`/links/${linkId}/history/list`, { params: { before }, signal });
  return response.data;
};

export const getLinkAnalytics = async (linkId: string, range: AnalyticsRange, signal?: AbortSignal) => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await api.get<LinkAnalytics>(`/links/${linkId}/analytics/details`, { params: { range, tz }, signal });
  return response.data;
};
