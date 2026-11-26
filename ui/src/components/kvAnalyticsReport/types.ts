import type { KvAnalytics, KvAnalyticsShare, RankedApplication } from "@utils/types/application";
import type { AnalyticsShare } from "@utils/types/link";

export interface KvAnalyticsReportProps {
  analytics: KvAnalytics;
  topApplications?: RankedApplication[];
  emptyDescription: string;
  averageHint: string;
}

export type ShareConverter = (items: KvAnalyticsShare[]) => AnalyticsShare[];
