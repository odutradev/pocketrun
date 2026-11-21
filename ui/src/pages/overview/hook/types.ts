import type { AttentionItem, EnvironmentOverview, KvSummary } from "@utils/types/overview";
import type { AnalyticsRange } from "@utils/types/link";

export interface OverviewStore {
  range: AnalyticsRange;
  overview: EnvironmentOverview | null;
  isLoading: boolean;
  requestId: number;
  load: () => Promise<void>;
  setRange: (range: AnalyticsRange) => void;
}

export interface UseOverviewPageReturn {
  range: AnalyticsRange;
  rangeLabel: string;
  overview: EnvironmentOverview | null;
  kv: KvSummary | null;
  attention: AttentionItem[];
  isLoading: boolean;
  load: () => Promise<void>;
  handleRangeChange: (range: AnalyticsRange) => void;
  handleExport: () => void;
}
