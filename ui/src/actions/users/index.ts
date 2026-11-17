import api from "@utils/api";

import type { UserFormValues } from "@utils/validations/user";
import type { User } from "@utils/types/user";

export const listUsers = async () => {
  const response = await api.get<User[]>("/users/list");
  return response.data;
};

export const createUser = async (data: UserFormValues) => {
  const response = await api.post<User>("/users/create", data);
  return response.data;
};

export const updateUser = async (userId: string, data: UserFormValues) => {
  const response = await api.patch<User>(`/users/${userId}/update`, data);
  return response.data;
};

export const deleteUser = async (userId: string) => {
  await api.delete(`/users/${userId}/delete`);
};
