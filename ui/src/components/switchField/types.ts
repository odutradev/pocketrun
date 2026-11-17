import type { ReactNode } from "react";

export interface SwitchFieldProps {
  label: string;
  description?: ReactNode;
  isChecked: boolean;
  onCheckedChange: (isChecked: boolean) => void;
  isDisabled?: boolean;
}
