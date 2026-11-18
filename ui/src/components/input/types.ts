import type { InputHTMLAttributes, ReactNode, Ref } from "react";

export type InputSize = "md" | "lg";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  ref?: Ref<HTMLInputElement>;
  label?: string;
  isLabelHidden?: boolean;
  hint?: ReactNode;
  error?: string;
  leftIcon?: ReactNode;
  leading?: ReactNode;
  trailing?: ReactNode;
  prefix?: string;
  isMono?: boolean;
  size?: InputSize;
}
