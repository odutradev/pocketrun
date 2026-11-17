import type { ReactNode } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectAction {
  label: string;
  icon?: ReactNode;
  onSelect: () => void;
}

export interface SelectProps {
  label: string;
  isLabelHidden?: boolean;
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  name?: string;
  id?: string;
  placeholder?: string;
  disabled?: boolean;
  hint?: ReactNode;
  error?: string;
  action?: SelectAction;
}
