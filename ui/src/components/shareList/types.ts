import type { AnalyticsShare, AnalyticsUnit } from "@utils/types/link";

export interface ShareListProps {
  title: string;
  items: AnalyticsShare[];
  emptyLabel?: string;
  labels?: Record<string, string>;
  unit?: AnalyticsUnit;
}
