import type { ReactNode, SelectHTMLAttributes } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> {
  label: string;
  options: SelectOption[];
  value: string;
  onValueChange: (value: string) => void;
  hint?: ReactNode;
  error?: string;
}
