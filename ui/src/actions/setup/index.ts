import api from "@utils/api";

import type { SetupTokenValues, SuperadminValues } from "@utils/types/auth";
import type { Session, SetupStatus } from "@utils/types/user";
import type { MessageResponse } from "@utils/types/api";

export const getSetupStatus = async (signal?: AbortSignal) => {
  const response = await api.get<SetupStatus>("/setup/status/details", { signal });
  return response.data;
};

export const verifySetupToken = async (data: SetupTokenValues) => {
  const response = await api.post<MessageResponse>("/setup/token/verify", data);
  return response.data;
};

export const createSuperadmin = async (data: SuperadminValues) => {
  const response = await api.post<Session>("/setup/admin/create", data);
  return response.data;
};
