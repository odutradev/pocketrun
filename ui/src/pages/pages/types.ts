import type { SitePage } from "@utils/types/sitePage";

export interface PageColumnsOptions {
  isCopied: (key: string) => boolean;
  onCopy: (sitePage: SitePage) => void;
  onEdit: (sitePage: SitePage) => void;
  onRemove: (sitePage: SitePage) => void;
  onToggle: (sitePage: SitePage) => void;
}
