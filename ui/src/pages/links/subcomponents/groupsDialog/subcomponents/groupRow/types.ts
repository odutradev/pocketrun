import type { LinkGroup } from "@utils/types/link";

export interface GroupRowProps {
  group: LinkGroup;
  isPending: boolean;
  onRename: (name: string) => void;
  onRemove: () => void;
}
