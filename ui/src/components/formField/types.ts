import type { ReactNode } from "react";

export interface FormFieldProps {
  controlId: string;
  label?: string;
  // Esconde o rótulo visualmente, mantendo-o para leitores de tela.
  isLabelHidden?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}

export interface FieldControlStyleProps {
  $hasError: boolean;
  $isMono?: boolean;
}
