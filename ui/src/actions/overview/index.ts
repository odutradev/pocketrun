import api from "@utils/api";

import type { EnvironmentUsage } from "@utils/types/overview";
import type { AnalyticsRange } from "@utils/types/link";

export const getEnvironmentUsage = async (range: AnalyticsRange, signal?: AbortSignal) => {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const response = await api.get<EnvironmentUsage>("/overview/usage/details", { params: { range, tz }, signal });
  return response.data;
};
