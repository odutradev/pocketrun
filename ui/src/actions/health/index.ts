import api from "@utils/api";
import type { PingResponse } from "@utils/types/api";

export const ping = async (signal?: AbortSignal) => {
  const response = await api.get<PingResponse>("/ping", { signal });
  return response.data;
};
