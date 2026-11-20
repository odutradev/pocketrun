import type { LinkAnalytics, RankedLink } from "@utils/types/link";

export interface TrafficPanelProps {
  title: string;
  traffic: LinkAnalytics;
  ranked: RankedLink[];
  basePath: string;
  emptyText: string;
}
