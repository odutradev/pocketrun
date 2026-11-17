import type { InputHTMLAttributes, ReactNode } from "react";

export type InputSize = "md" | "lg";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  label?: string;
  isLabelHidden?: boolean;
  hint?: ReactNode;
  error?: string;
  leftIcon?: ReactNode;
  trailing?: ReactNode;
  prefix?: string;
  isMono?: boolean;
  size?: InputSize;
}
