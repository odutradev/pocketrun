import type { ReactNode } from "react";

export interface FormFieldProps {
  controlId: string;
  label?: string;
  isLabelHidden?: boolean;
  hint?: ReactNode;
  error?: string;
  children: ReactNode;
}

export interface FieldControlStyleProps {
  $hasError: boolean;
  $isMono?: boolean;
}
