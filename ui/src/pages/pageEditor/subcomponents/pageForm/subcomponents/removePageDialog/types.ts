import type { SitePage } from "@utils/types/sitePage";

export interface RemovePageDialogProps {
  sitePage: SitePage;
  isOpen: boolean;
  onClose: () => void;
}
