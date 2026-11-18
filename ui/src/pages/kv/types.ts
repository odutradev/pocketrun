import type { Application } from "@utils/types/application";

export interface AppColumnsOptions {
  isCopied: (key: string) => boolean;
  onCopy: (application: Application) => void;
  onEdit: (application: Application) => void;
  onRemove: (application: Application) => void;
}
