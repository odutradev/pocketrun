import type { KvOverview } from "@utils/types/application";
import type { AnalyticsRange } from "@utils/types/link";

export interface KvAnalyticsStore {
  range: AnalyticsRange;
  overview: KvOverview | null;
  isLoading: boolean;
  requestId: number;
  load: () => Promise<void>;
  setRange: (range: AnalyticsRange) => void;
}

export interface UseKvAnalyticsPageReturn {
  range: AnalyticsRange;
  overview: KvOverview | null;
  isLoading: boolean;
  load: () => Promise<void>;
  handleRangeChange: (range: AnalyticsRange) => void;
  handleExport: () => void;
}
