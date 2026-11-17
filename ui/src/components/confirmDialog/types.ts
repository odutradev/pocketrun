import type { ReactNode } from "react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  isPending?: boolean;
  // Quando informado, o usuário digita este texto (o Project ID) para liberar o botão final.
  confirmationText?: string;
}
