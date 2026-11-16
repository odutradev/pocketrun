import type { ExplorerDocument } from "@utils/types/explorer";

export interface DocumentDialogProps {
  document: ExplorerDocument | null;
  onClose: () => void;
}
