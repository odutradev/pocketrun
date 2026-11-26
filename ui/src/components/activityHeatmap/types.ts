import type { AnalyticsHeatCell, AnalyticsUnit } from "@utils/types/link";

export interface ActivityHeatmapProps {
  cells: AnalyticsHeatCell[];
  unit?: AnalyticsUnit;
}
