import type { ReactNode } from "react";

export interface DialogHeaderProps {
  icon: ReactNode;
  label: string;
  onClose: () => void;
}
