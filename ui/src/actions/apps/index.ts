import api from "@utils/api";

import type { Application, ApplicationConfig, CreateApplicationPayload, CreatedApplication, CreatedToken, CreateTokenPayload, KvRole, RolePayload, RoleUpdatePayload, UpdateApplicationPayload } from "@utils/types/application";
import type { MessageResponse } from "@utils/types/api";

export const listApplications = async (signal?: AbortSignal) => {
  const response = await api.get<Application[]>("/apps/list", { signal });
  return response.data;
};

export const getApplication = async (applicationId: string, signal?: AbortSignal) => {
  const response = await api.get<Application>(`/apps/${applicationId}/details`, { signal });
  return response.data;
};

export const createApplication = async (data: CreateApplicationPayload) => {
  const response = await api.post<CreatedApplication>("/apps/create", data);
  return response.data;
};

export const updateApplication = async (applicationId: string, data: UpdateApplicationPayload) => {
  const response = await api.patch<MessageResponse>(`/apps/${applicationId}/update`, data);
  return response.data;
};

export const deleteApplication = async (applicationId: string) => {
  const response = await api.delete<MessageResponse>(`/apps/${applicationId}/delete`);
  return response.data;
};

export const createToken = async (applicationId: string, data: CreateTokenPayload) => {
  const response = await api.post<CreatedToken>(`/apps/${applicationId}/tokens/create`, data);
  return response.data;
};

export const deleteToken = async (applicationId: string, tokenId: string) => {
  const response = await api.delete<MessageResponse>(`/apps/${applicationId}/tokens/${tokenId}/delete`);
  return response.data;
};

export const setTokenRole = async (applicationId: string, tokenId: string, role: string) => {
  const response = await api.patch<MessageResponse>(`/apps/${applicationId}/tokens/${tokenId}/role/set`, { role });
  return response.data;
};

export const createRole = async (applicationId: string, data: RolePayload) => {
  const response = await api.post<KvRole>(`/apps/${applicationId}/roles/create`, data);
  return response.data;
};

export const updateRole = async (applicationId: string, role: string, data: RoleUpdatePayload) => {
  const response = await api.patch<KvRole>(`/apps/${applicationId}/roles/${role}/update`, data);
  return response.data;
};

export const deleteRole = async (applicationId: string, role: string) => {
  const response = await api.delete<MessageResponse>(`/apps/${applicationId}/roles/${role}/delete`);
  return response.data;
};

export const exportApplicationConfig = async (applicationId: string, signal?: AbortSignal) => {
  const response = await api.get<ApplicationConfig>(`/apps/${applicationId}/config/export`, { signal });
  return response.data;
};

export const applyApplicationConfig = async (applicationId: string, data: Record<string, unknown>) => {
  const response = await api.post<ApplicationConfig>(`/apps/${applicationId}/config/apply`, data);
  return response.data;
};
