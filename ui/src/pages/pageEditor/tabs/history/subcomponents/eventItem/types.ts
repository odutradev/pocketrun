import type { PageEvent } from "@utils/types/sitePage";

export interface EventItemProps {
  event: PageEvent;
  groupNames: Record<string, string>;
  now: number;
}
