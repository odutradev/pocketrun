import type { AnalyticsShare } from "@utils/types/link";

export interface ShareListProps {
  title: string;
  items: AnalyticsShare[];
  emptyLabel?: string;
  labels?: Record<string, string>;
}
