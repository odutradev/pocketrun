import type { BrandTool } from "@utils/types/brand";

export interface UsageChartPoint {
  time: number;
  pages: number;
  links: number;
  kv: number;
}

export type UsageSeriesKey = "pages" | "links" | "kv";

export interface UsageSeries {
  key: UsageSeriesKey;
  tool: BrandTool;
  label: string;
  total: number;
  previous: number | null;
}
