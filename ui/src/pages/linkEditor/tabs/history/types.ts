import type { LinkEvent } from "@utils/types/link";

export interface HistoryDay {
  key: string;
  at: string;
  events: LinkEvent[];
}
