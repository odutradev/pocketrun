import type { AnalyticsRange, PagesOverview } from "@utils/types/sitePage";

export interface PagesAnalyticsStore {
  range: AnalyticsRange;
  overview: PagesOverview | null;
  isLoading: boolean;
  requestId: number;
  load: () => Promise<void>;
  setRange: (range: AnalyticsRange) => void;
}

export interface UsePagesAnalyticsPageReturn {
  range: AnalyticsRange;
  overview: PagesOverview | null;
  isLoading: boolean;
  load: () => Promise<void>;
  handleRangeChange: (range: AnalyticsRange) => void;
}
