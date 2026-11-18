import type { LinkGroup } from "@utils/types/link";

export interface RemoveGroupDialogProps {
  group: LinkGroup;
  linkCount: number;
  isOpen: boolean;
  onClose: () => void;
}
