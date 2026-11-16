import api from "@utils/api";
import type { Session, User } from "@utils/types/user";
import type { SignInValues, SignUpValues } from "@utils/validations/auth";

export const signIn = async (data: SignInValues) => {
  const response = await api.post<Session>("/auth/login", data);
  return response.data;
};

export const signUp = async (data: SignUpValues) => {
  const response = await api.post<Session>("/auth/register", data);
  return response.data;
};

export const getProfile = async () => {
  const response = await api.get<User>("/auth/me");
  return response.data;
};
