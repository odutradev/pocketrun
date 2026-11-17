import type { Link } from "@utils/types/link";

export interface LinkColumnsOptions {
  groupNames: Record<string, string>;
  isCopied: (key: string) => boolean;
  onCopy: (link: Link) => void;
  onEdit: (link: Link) => void;
  onRemove: (link: Link) => void;
}
