import type { ReactNode } from "react";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  eyebrow?: string;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}
