import type { Link } from "@utils/types/link";

export interface RemoveLinkDialogProps {
  link: Link;
  isOpen: boolean;
  onClose: () => void;
}
