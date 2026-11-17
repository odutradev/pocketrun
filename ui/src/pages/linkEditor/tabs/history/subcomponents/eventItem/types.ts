import type { LinkEvent } from "@utils/types/link";

export interface EventItemProps {
  event: LinkEvent;
  groupNames: Record<string, string>;
  now: number;
}
