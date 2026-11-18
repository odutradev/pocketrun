import type { PageAccessDialogState } from "@utils/types/sitePage";

export interface KeyDialogProps {
  dialog: PageAccessDialogState;
  onClose: () => void;
}
