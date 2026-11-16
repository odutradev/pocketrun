import api from "@utils/api";
import type { MessageResponse } from "@utils/types/api";
import type {
  Application,
  CreateApplicationPayload,
  CreatedApplication,
  CreatedToken,
  CreateTokenPayload,
  UpdateApplicationPayload
} from "@utils/types/application";

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
