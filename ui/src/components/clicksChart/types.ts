import type { AnalyticsBucket, AnalyticsPoint, LinkEvent } from "@utils/types/link";

export interface ClicksChartProps {
  series: AnalyticsPoint[];
  bucket: AnalyticsBucket;
  markers: LinkEvent[];
}

export interface ChartPoint {
  time: number;
  clicks: number;
  visitors: number;
}
