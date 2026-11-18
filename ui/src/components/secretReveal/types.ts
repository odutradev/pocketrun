import type { ReactNode } from "react";

export interface SecretRevealProps {
  secret: string;
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
  warning?: ReactNode;
}
