import api from "@utils/api";
import type { Session, User } from "@utils/types/user";
import type { SignInValues } from "@utils/validations/auth";

export const signIn = async (data: SignInValues) => {
  const response = await api.post<Session>("/auth/login", data);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get<User>("/auth/me");
  return response.data;
};
