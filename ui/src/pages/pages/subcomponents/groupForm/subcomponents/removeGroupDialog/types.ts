import type { PageGroup } from "@utils/types/sitePage";

export interface RemoveGroupDialogProps {
  group: PageGroup;
  pageCount: number;
  isOpen: boolean;
  onClose: () => void;
}
