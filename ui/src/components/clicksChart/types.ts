import type { AnalyticsBucket, AnalyticsPoint, LinkEvent } from "@utils/types/link";

export interface ClicksChartProps {
  series: AnalyticsPoint[];
  bucket: AnalyticsBucket;
  markers: ChartMarker[];
}

export type ChartMarker = Pick<LinkEvent, "id" | "at">;

export interface ChartPoint {
  time: number;
  clicks: number;
  visitors: number;
}
