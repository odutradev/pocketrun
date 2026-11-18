import type { PageGroup } from "@utils/types/sitePage";

export interface CreateGroupDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (group: PageGroup) => void;
}
