import type { PageEvent } from "@utils/types/sitePage";

export interface HistoryDay {
  key: string;
  at: string;
  events: PageEvent[];
}
