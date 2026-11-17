import api from "@utils/api";

import type { ChangePasswordPayload, ProfileValues } from "@utils/validations/user";
import type { SignInValues } from "@utils/validations/auth";
import type { Session, User } from "@utils/types/user";

export const signIn = async (data: SignInValues) => {
  const response = await api.post<Session>("/auth/login", data);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get<User>("/auth/me");
  return response.data;
};

export const updateProfile = async (data: ProfileValues) => {
  const response = await api.patch<User>("/auth/me/update", data);
  return response.data;
};

export const changePassword = async (data: ChangePasswordPayload) => {
  await api.patch("/auth/me/password/update", data);
};
