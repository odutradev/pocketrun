import type { LinkGroup } from "@utils/types/link";

export interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (group: LinkGroup) => void;
}
