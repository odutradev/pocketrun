import type { KvOverview } from "@utils/types/application";

export interface KvPanelProps {
  traffic: KvOverview;
  rangeLabel: string;
  emptyText: string;
}
