import type { AnalyticsRange, LinksOverview } from "@utils/types/link";

export interface LinksAnalyticsStore {
  range: AnalyticsRange;
  overview: LinksOverview | null;
  isLoading: boolean;
  requestId: number;
  load: () => Promise<void>;
  setRange: (range: AnalyticsRange) => void;
}

export interface UseLinksAnalyticsPageReturn {
  range: AnalyticsRange;
  overview: LinksOverview | null;
  isLoading: boolean;
  load: () => Promise<void>;
  handleRangeChange: (range: AnalyticsRange) => void;
}
