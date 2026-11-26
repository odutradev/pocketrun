import type { AnalyticsBucket, AnalyticsPoint, AnalyticsSeriesLabels, LinkEvent } from "@utils/types/link";

export interface ClicksChartProps {
  series: AnalyticsPoint[];
  bucket: AnalyticsBucket;
  markers: ChartMarker[];
  labels?: AnalyticsSeriesLabels;
}

export type ChartMarker = Pick<LinkEvent, "id" | "at">;

export interface ChartPoint {
  time: number;
  clicks: number;
  visitors: number;
}
