import type { AttentionItem, EnvironmentOverview, KvSummary } from "@utils/types/overview";

export interface OverviewStore {
  overview: EnvironmentOverview | null;
  isLoading: boolean;
  requestId: number;
  load: () => Promise<void>;
}

export interface UseOverviewPageReturn {
  overview: EnvironmentOverview | null;
  kv: KvSummary | null;
  attention: AttentionItem[];
  isLoading: boolean;
  load: () => Promise<void>;
}
