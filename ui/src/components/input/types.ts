import type { InputHTMLAttributes, ReactNode } from "react";

export type InputSize = "md" | "lg";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  label?: string;
  isLabelHidden?: boolean;
  hint?: ReactNode;
  error?: string;
  leftIcon?: ReactNode;
  // Trecho fixo antes do valor, como `https://` ou `/p/`.
  prefix?: string;
  // Valores de máquina (Project ID, origens, filtros) usam a fonte mono.
  isMono?: boolean;
  size?: InputSize;
}
