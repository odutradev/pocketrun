import api from "@utils/api";

import type { Session, SetupStatus } from "@utils/types/user";
import type { SignUpValues } from "@utils/validations/auth";

export const getSetupStatus = async (signal?: AbortSignal) => {
  const response = await api.get<SetupStatus>("/setup/status", { signal });
  return response.data;
};

export const createSuperadmin = async (data: SignUpValues) => {
  const response = await api.post<Session>("/setup/admin/create", data);
  return response.data;
};
