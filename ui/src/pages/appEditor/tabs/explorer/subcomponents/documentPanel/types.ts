import type { ExplorerDocument } from "@utils/types/explorer";

export interface DocumentPanelProps {
  document: ExplorerDocument;
  onClose: () => void;
}
