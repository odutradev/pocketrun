import useAuthStore from "@stores/auth";
import api from "@utils/api";

import type { ChangePasswordPayload, ProfileValues, Session, User } from "@utils/types/user";
import type { AdminApiKey, CreateApiKeyValues, CreatedApiKey } from "@utils/types/apiKey";
import type { SignInValues } from "@utils/types/auth";

export const signIn = async (data: SignInValues) => {
  const response = await api.post<Session>("/auth/login", data);
  return response.data;
};

export const signOut = async () => {
  try {
    await api.post("/auth/logout");
  } finally {
    useAuthStore.getState().clearSession();
  }
};

export const revokeSessions = async () => {
  await api.post("/auth/sessions/revoke");
  useAuthStore.getState().clearSession();
};

export const getProfile = async () => {
  const response = await api.get<User>("/auth/me/details");
  return response.data;
};

export const updateProfile = async (data: ProfileValues) => {
  const response = await api.patch<User>("/auth/me/update", data);
  return response.data;
};

export const changePassword = async (data: ChangePasswordPayload) => {
  await api.patch("/auth/me/password/update", data);
};

export const listApiKeys = async () => {
  const response = await api.get<AdminApiKey[]>("/auth/api-keys/list");
  return response.data;
};

export const createApiKey = async (data: CreateApiKeyValues) => {
  const response = await api.post<CreatedApiKey>("/auth/api-keys/create", data);
  return response.data;
};

export const deleteApiKey = async (id: string) => {
  await api.delete(`/auth/api-keys/${id}/delete`);
};
