import type { ReactNode } from "react";

export interface SecretRevealProps {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  secret: string;
  confirmLabel: string;
  onConfirm: () => void;
}
